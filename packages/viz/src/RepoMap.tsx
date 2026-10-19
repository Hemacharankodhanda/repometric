'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3-hierarchy';
import { Search, Table, LayoutGrid, ChevronRight, CornerLeftUp } from 'lucide-react';
import { buildHierarchy, type FileNode, type MapNode } from '@repometric/core';
import {
  formatBytes,
  getLanguageColor,
  getSizeColor,
  getTopLanguages,
  OKABE_ITO_PALETTE,
  OTHER_LANG_COLOR,
  YL_GN_BU_PALETTE,
} from './colors';

export type ColorMode = 'language' | 'size';

export interface RepoMapProps {
  files: FileNode[];
  selectedPath?: string;
  onSelect?: (path: string) => void;
  height?: number | string;
  className?: string;
}

interface HoverInfo {
  x: number;
  y: number;
  node: HierarchyRectangularNode<MapNode>;
}

export const RepoMap: React.FC<RepoMapProps> = ({
  files,
  selectedPath,
  onSelect,
  height = 540,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [colorMode, setColorMode] = useState<ColorMode>('language');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [currentPath, setCurrentPath] = useState<string>(''); // empty = root
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [animationProgress, setAnimationProgress] = useState(1);

  // Top languages detection
  const topLanguages = useMemo(() => getTopLanguages(files), [files]);

  // Size bounds
  const [minFileSize, maxFileSize] = useMemo(() => {
    let min = Infinity;
    let max = 0;
    for (const f of files) {
      if (f.size < min) min = f.size;
      if (f.size > max) max = f.size;
    }
    return [min === Infinity ? 0 : min, max];
  }, [files]);

  // Build full hierarchy
  const fullRoot = useMemo(() => buildHierarchy(files), [files]);

  // Current zoomed root node
  const activeRoot = useMemo(() => {
    if (!currentPath) return fullRoot;

    function findNode(node: MapNode, target: string): MapNode | null {
      if (node.path === target) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, target);
          if (found) return found;
        }
      }
      return null;
    }

    return findNode(fullRoot, currentPath) ?? fullRoot;
  }, [fullRoot, currentPath]);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height: h } = entry.contentRect;
        if (width > 0 && h > 0) {
          setDimensions({ width, height: h });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute treemap layout
  const treemapLayout = useMemo(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0) return null;

    const h = hierarchy<MapNode>(activeRoot)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : d.size))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const tm = treemap<MapNode>()
      .tile(treemapSquarify)
      .size([dimensions.width, dimensions.height])
      .paddingInner(1)
      .paddingTop(18)
      .paddingOuter(2);

    return tm(h);
  }, [activeRoot, dimensions]);

  // Flatten tiles for rendering and hit-testing
  const tiles = useMemo(() => {
    if (!treemapLayout) return [];
    return treemapLayout.descendants();
  }, [treemapLayout]);

  // Draw-in animation on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationProgress(1);
      return;
    }

    setAnimationProgress(0);
    const start = performance.now();
    const duration = 600; // ms

    let reqId: number;
    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      setAnimationProgress(progress);
      if (progress < 1) {
        reqId = requestAnimationFrame(animate);
      }
    };

    reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [currentPath]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !treemapLayout) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const query = searchQuery.trim().toLowerCase();

    for (const node of tiles) {
      const w = node.x1 - node.x0;
      const h = node.y1 - node.y0;

      if (w < 1 || h < 1) continue;

      const isLeaf = !node.children || node.children.length === 0;
      const isSelected = selectedPath && node.data.path === selectedPath;
      const isHovered = hoverInfo?.node.data.path === node.data.path;

      // Staggered draw-in based on depth
      const depthDelay = Math.min(0.8, node.depth * 0.15);
      const nodeProgress = Math.max(
        0,
        Math.min(1, (animationProgress - depthDelay) / (1 - depthDelay || 1)),
      );

      if (nodeProgress <= 0) continue;

      if (!isLeaf) {
        // Draw folder container
        ctx.fillStyle = 'rgba(20, 33, 61, 0.04)';
        ctx.strokeStyle = 'rgba(20, 33, 61, 0.15)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(node.x0, node.y0, w, h, 2);
        ctx.fill();
        ctx.stroke();

        // Draw folder header strip if space permits
        if (w >= 70 && h >= 20) {
          ctx.fillStyle = 'rgba(20, 33, 61, 0.08)';
          ctx.fillRect(node.x0 + 1, node.y0 + 1, w - 2, 16);

          ctx.fillStyle = '#14213d';
          ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textBaseline = 'middle';
          const folderText = node.data.name;
          ctx.fillText(folderText, node.x0 + 6, node.y0 + 9, w - 12);
        }
      } else {
        // Draw file leaf tile
        const baseColor =
          colorMode === 'language'
            ? getLanguageColor(node.data.language, topLanguages)
            : getSizeColor(node.data.size, minFileSize, maxFileSize);

        const matchesQuery = !query || node.data.path.toLowerCase().includes(query);

        if (!matchesQuery) {
          ctx.globalAlpha = 0.25;
        } else {
          ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.roundRect(node.x0, node.y0, w, h, 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = isSelected ? '#2a7f87' : isHovered ? '#14213d' : 'rgba(20, 33, 61, 0.15)';
        ctx.lineWidth = isSelected || isHovered ? 2 : 1;
        ctx.stroke();

        ctx.globalAlpha = 1.0;

        // Label if tile is big enough
        if (w >= 60 && h >= 16) {
          ctx.fillStyle = '#14213d';
          ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.data.name, node.x0 + 4, node.y0 + h / 2, w - 8);
        }
      }
    }
  }, [
    dimensions,
    treemapLayout,
    tiles,
    selectedPath,
    hoverInfo,
    animationProgress,
    searchQuery,
    colorMode,
    topLanguages,
    minFileSize,
    maxFileSize,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Hit testing on click & hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find deepest tile covering (x, y)
    let found: HierarchyRectangularNode<MapNode> | null = null;
    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i]!;
      if (x >= tile.x0 && x <= tile.x1 && y >= tile.y0 && y <= tile.y1) {
        found = tile;
        break;
      }
    }

    if (found && (!found.children || found.children.length === 0)) {
      setHoverInfo({ x, y, node: found });
    } else {
      setHoverInfo(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find deepest tile clicked
    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i]!;
      if (x >= tile.x0 && x <= tile.x1 && y >= tile.y0 && y <= tile.y1) {
        const isFolder = tile.children && tile.children.length > 0;
        if (isFolder && tile.data.path !== currentPath) {
          // Zoom into folder
          setCurrentPath(tile.data.path);
          setHoverInfo(null);
          return;
        } else if (!isFolder) {
          onSelect?.(tile.data.path);
          return;
        }
      }
    }
  };

  // Esc goes up one level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentPath) {
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPath]);

  // Breadcrumb segments
  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [{ name: 'root', path: '' }];
    const parts = currentPath.split('/');
    const result = [{ name: 'root', path: '' }];
    let acc = '';
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      result.push({ name: part, path: acc });
    }
    return result;
  }, [currentPath]);

  // Filtered files for table view
  const tableFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = files;
    if (currentPath) {
      list = list.filter((f) => f.path.startsWith(currentPath + '/') || f.path === currentPath);
    }
    if (query) {
      list = list.filter((f) => f.path.toLowerCase().includes(query));
    }
    return list.slice(0, 300); // cap display rows
  }, [files, currentPath, searchQuery]);

  return (
    <div
      className={`flex flex-col bg-surface rounded-panel border border-line overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-line bg-surface text-xs">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1 overflow-x-auto py-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path || 'root'}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-muted/50" />}
                <button
                  type="button"
                  onClick={() => setCurrentPath(crumb.path)}
                  className={`px-1.5 py-0.5 rounded-control transition-colors font-mono ${
                    isLast
                      ? 'text-ink font-semibold bg-fog/20'
                      : 'text-teal hover:text-teal/80 hover:bg-fog/10 cursor-pointer'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            );
          })}
          {currentPath && (
            <button
              type="button"
              onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
              }}
              className="ml-2 inline-flex items-center text-ink-muted hover:text-ink px-1 py-0.5"
              title="Go up (Esc)"
              aria-label="Go up one folder level"
            >
              <CornerLeftUp className="w-3.5 h-3.5 mr-0.5" />
              <span>Up</span>
            </button>
          )}
        </nav>

        {/* Right Tools: Search, Color Mode, View Toggle */}
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              aria-label="Search files in repo map"
              className="h-7 w-36 sm:w-48 pl-7 pr-2 rounded-control border border-line bg-paper text-ink text-xs focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1"
            />
          </div>

          {/* Color Mode Switcher */}
          <div
            role="radiogroup"
            aria-label="Map color mode"
            className="hidden sm:inline-flex items-center p-0.5 rounded-control bg-paper border border-line"
          >
            <button
              type="button"
              role="radio"
              aria-checked={colorMode === 'language'}
              onClick={() => setColorMode('language')}
              className={`px-2 py-0.5 rounded-control font-medium transition-colors ${
                colorMode === 'language'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Language
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={colorMode === 'size'}
              onClick={() => setColorMode('size')}
              className={`px-2 py-0.5 rounded-control font-medium transition-colors ${
                colorMode === 'size'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Size
            </button>
          </div>

          {/* View as Table Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}
            className="inline-flex items-center px-2 py-1 rounded-control bg-paper border border-line text-ink hover:bg-fog/20 cursor-pointer"
            aria-label={viewMode === 'map' ? 'View as table' : 'View as map'}
          >
            {viewMode === 'map' ? (
              <>
                <Table className="w-3.5 h-3.5 mr-1" />
                <span>Table</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                <span>Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas or Table */}
      <div ref={containerRef} className="relative flex-1 min-h-[300px] overflow-hidden bg-paper">
        {viewMode === 'map' ? (
          <>
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="region"
              aria-label="Repository treemap visualization"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              className="w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-2px]"
            />

            {/* Hover Card */}
            {hoverInfo && (
              <div
                className="pointer-events-none absolute z-20 rounded-control border border-line bg-surface p-2.5 text-xs text-ink shadow-md"
                style={{
                  left: Math.min(hoverInfo.x + 12, dimensions.width - 240),
                  top: Math.min(hoverInfo.y + 12, dimensions.height - 120),
                  maxWidth: 240,
                }}
              >
                <div className="font-mono font-semibold truncate text-ink">
                  {hoverInfo.node.data.path}
                </div>
                <div className="mt-1.5 space-y-0.5 text-ink-muted">
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="text-ink font-medium">
                      {hoverInfo.node.data.language ?? 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="text-ink font-medium">
                      {formatBytes(hoverInfo.node.data.size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test file:</span>
                    <span className="text-ink font-medium">
                      {hoverInfo.node.data.isTest ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Table View Alternative */
          <div className="h-full overflow-auto p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="py-2 px-3 font-semibold">Path</th>
                  <th className="py-2 px-3 font-semibold">Size</th>
                  <th className="py-2 px-3 font-semibold">Language</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {tableFiles.map((file) => (
                  <tr
                    key={file.path}
                    onClick={() => onSelect?.(file.path)}
                    className="border-b border-line/50 hover:bg-surface/50 cursor-pointer font-mono"
                  >
                    <td className="py-1.5 px-3 truncate max-w-xs">{file.path}</td>
                    <td className="py-1.5 px-3 text-ink-muted">{formatBytes(file.size)}</td>
                    <td className="py-1.5 px-3 text-ink-muted">{file.language ?? '—'}</td>
                    <td className="py-1.5 px-3 text-ink-muted">
                      {file.isTest ? 'Test' : 'Source'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-line bg-surface text-xs text-ink-muted">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-ink">Size:</span>
          <span>tile area = file size in bytes</span>
        </div>

        {/* Dynamic color scale swatches */}
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
          <span className="font-medium text-ink">Color:</span>
          {colorMode === 'language' ? (
            <div className="flex items-center space-x-2">
              {topLanguages.map((lang, idx) => (
                <div key={lang} className="flex items-center space-x-1">
                  <span
                    className="w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: OKABE_ITO_PALETTE[idx] }}
                  />
                  <span>{lang}</span>
                </div>
              ))}
              <div className="flex items-center space-x-1">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: OTHER_LANG_COLOR }}
                />
                <span>Other</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <span>Small</span>
              <div className="flex space-x-0.5">
                {YL_GN_BU_PALETTE.map((color) => (
                  <span key={color} className="w-3.5 h-2.5" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span>Large</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
