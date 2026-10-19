'use client';

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import * as d3Zoom from 'd3-zoom';
import * as d3Selection from 'd3-selection';
import {
  Copy,
  Download,
  FileCode,
  RotateCcw,
  Maximize2,
  Table as TableIcon,
  Layers,
  ExternalLink,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  buildDiagramSpec,
  compileMermaid,
  type FileNode,
  type GraphData,
  type ThemeColors,
} from '@repometric/core';

export interface ArchitectureDiagramProps {
  files: FileNode[];
  graph?: GraphData | null;
  owner: string;
  repo: string;
  sha: string;
  height?: number;
  onSelectPath?: (path: string) => void;
}

export function getThemeColors(): ThemeColors {
  if (typeof window === 'undefined') {
    return {
      paper: '#E9EEF0',
      surface: '#F5F8F9',
      fog: '#C9D3D8',
      ink: '#14213D',
      inkMuted: '#4A5872',
      teal: '#2A7F87',
      danger: '#D6352F',
      moss: '#5E8C4A',
    };
  }

  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    return {
      paper: '#0F1A26',
      surface: '#16263A',
      fog: '#223244',
      ink: '#E6EDF0',
      inkMuted: '#9FB0BF',
      teal: '#4FB3BC',
      danger: '#FF6B5E',
      moss: '#8DBB78',
    };
  }

  return {
    paper: '#E9EEF0',
    surface: '#F5F8F9',
    fog: '#C9D3D8',
    ink: '#14213D',
    inkMuted: '#4A5872',
    teal: '#2A7F87',
    danger: '#D6352F',
    moss: '#5E8C4A',
  };
}

export function ArchitectureDiagram({
  files,
  graph = null,
  owner,
  repo,
  sha,
  height = 620,
  onSelectPath,
}: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<ThemeColors>(getThemeColors);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
  const [showEdgeWeights, setShowEdgeWeights] = useState<boolean>(true);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  // 1. Build Diagram Specification (pure, deterministic)
  const spec = useMemo(() => {
    return buildDiagramSpec(files, graph);
  }, [files, graph]);

  // If edge weights toggled off, temporarily remove weights for compilation
  const edgeAdjustedSpec = useMemo(() => {
    if (showEdgeWeights) return spec;
    return {
      ...spec,
      edges: spec.edges.map((e) => ({ ...e, weight: 1 })),
      externalEdges: spec.externalEdges.map((e) => ({ ...e, weight: 1 })),
    };
  }, [spec, showEdgeWeights]);

  // 2. Compile Mermaid flowchart
  const compiled = useMemo(() => {
    return compileMermaid(
      edgeAdjustedSpec,
      { owner, repo, sha },
      theme
    );
  }, [edgeAdjustedSpec, owner, repo, sha, theme]);

  // Track theme changes (dark/light mode)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getThemeColors());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Copy status timeout helper
  const triggerCopyFeedback = (action: string) => {
    setCopiedAction(action);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  // 3. Render Mermaid to SVG and attach d3-zoom + interactive events
  useEffect(() => {
    if (viewMode !== 'diagram' || !svgWrapperRef.current) return;

    let isMounted = true;
    const wrapper = svgWrapperRef.current;

    async function renderMermaidSvg() {
      try {
        setRenderError(null);
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            fontFamily:
              'Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            primaryColor: theme.fog,
            primaryTextColor: theme.ink,
            primaryBorderColor: theme.ink,
            lineColor: theme.inkMuted,
            secondaryColor: theme.surface,
            tertiaryColor: theme.paper,
            background: theme.paper,
          },
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
          },
          maxTextSize: 100000,
        });

        const uniqueId = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, compiled.mermaid);

        if (!isMounted) return;

        // Sanitize with DOMPurify per spec while preserving foreignObject node labels
        const DOMPurify = (await import('dompurify')).default;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');

        // Strictly remove any executable scripts or event listeners
        doc.querySelectorAll('script').forEach((el) => el.remove());
        doc.querySelectorAll('*').forEach((el) => {
          for (const attr of Array.from(el.attributes)) {
            if (
              attr.name.toLowerCase().startsWith('on') ||
              attr.value.trim().toLowerCase().startsWith('javascript:')
            ) {
              el.removeAttribute(attr.name);
            }
          }
        });

        // Sanitize each foreignObject's label content safely with DOMPurify
        doc.querySelectorAll('foreignObject').forEach((fo) => {
          const safeInner = DOMPurify.sanitize(fo.innerHTML, {
            ALLOWED_TAGS: ['div', 'span', 'p', 'b', 'i', 'strong', 'em', 'br', 'code'],
            ALLOWED_ATTR: ['class', 'style', 'xmlns'],
          });
          fo.innerHTML = safeInner;
        });

        const serializer = new XMLSerializer();
        const cleanSvg = serializer.serializeToString(doc.documentElement);

        wrapper.innerHTML = cleanSvg;

        const svgElement = wrapper.querySelector('svg');
        if (!svgElement) return;

        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.cursor = 'grab';

        // Add custom typography & contrast styles to ensure text is prominent and readable in light & dark
        const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = `
          .node foreignObject { overflow: visible !important; }
          .node .nodeLabel, .nodeLabel p, .nodeLabel span, .node text {
            color: ${theme.ink} !important;
            fill: ${theme.ink} !important;
            font-family: Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.4 !important;
            user-select: none !important;
          }
          .cluster .nodeLabel, .cluster span, .cluster text {
            color: ${theme.ink} !important;
            fill: ${theme.ink} !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            letter-spacing: 0.04em !important;
            text-transform: uppercase !important;
            user-select: none !important;
          }
          .edgeLabel, .edgeLabel p, .edgeLabel span, .edgeLabel text {
            color: ${theme.inkMuted} !important;
            fill: ${theme.inkMuted} !important;
            font-size: 11px !important;
            font-family: JetBrains Mono, Menlo, monospace !important;
            background-color: ${theme.paper} !important;
            padding: 1px 4px !important;
            border-radius: 4px !important;
          }
        `;
        svgElement.prepend(styleEl);

        // Wrap inner contents in a zoomable <g>
        const innerContent = svgElement.innerHTML;
        svgElement.innerHTML = `<g class="diagram-zoom-layer">${innerContent}</g>`;

        const svgSelection = d3Selection.select(svgElement);
        const zoomGroup = svgSelection.select<SVGGElement>('.diagram-zoom-layer');

        const zoomBehavior = d3Zoom
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.15, 6])
          .on('zoom', (event) => {
            zoomGroup.attr('transform', event.transform.toString());
          });

        svgSelection.call(zoomBehavior);

        // Auto-fit on initial render
        setTimeout(() => {
          if (!isMounted) return;
          try {
            const bbox = (zoomGroup.node() as SVGGraphicsElement)?.getBBox();
            if (bbox && bbox.width > 0 && bbox.height > 0) {
              const clientWidth = svgElement.clientWidth || 800;
              const clientHeight = svgElement.clientHeight || height;
              const scale = Math.min(
                (clientWidth - 60) / bbox.width,
                (clientHeight - 60) / bbox.height,
                1.2
              );
              const tx = (clientWidth - bbox.width * scale) / 2 - bbox.x * scale;
              const ty = (clientHeight - bbox.height * scale) / 2 - bbox.y * scale;

              svgSelection.call(
                zoomBehavior.transform,
                d3Zoom.zoomIdentity.translate(tx, ty).scale(scale)
              );
            }
          } catch {
            // ignore layout exceptions on rapid remounts
          }
        }, 50);

        // Attach interactivity to node elements
        const nodeElements = svgElement.querySelectorAll('.node');
        nodeElements.forEach((el) => {
          const rawId = el.id || '';
          // Mermaid ids might be `flowchart-c0-123` or `c0`
          const matchedId = rawId.match(/(?:flowchart-)?([ce]\d+)/)?.[1];
          if (!matchedId) return;

          const htmlEl = el as SVGElement;
          htmlEl.style.cursor = 'pointer';
          htmlEl.setAttribute('tabindex', '0');
          htmlEl.setAttribute('role', 'button');

          const meta = compiled.nodeMap[matchedId];
          const label = meta?.label || matchedId;
          htmlEl.setAttribute('aria-label', `Architecture component ${label}`);

          htmlEl.addEventListener('click', () => {
            setSelectedNodeId(matchedId);
            setLiveAnnouncement(`Selected component ${label}`);
            if (meta?.path && onSelectPath) {
              onSelectPath(meta.path);
            }
          });

          htmlEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedNodeId(matchedId);
              setLiveAnnouncement(`Selected component ${label}`);
              if (meta?.path && onSelectPath) {
                onSelectPath(meta.path);
              }
            }
          });

          htmlEl.addEventListener('mouseenter', () => {
            setHoveredNodeId(matchedId);
          });

          htmlEl.addEventListener('mouseleave', () => {
            setHoveredNodeId((curr) => (curr === matchedId ? null : curr));
          });
        });
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err);
          setRenderError(`Failed to render architecture diagram: ${msg}`);
        }
      }
    }

    renderMermaidSvg();

    return () => {
      isMounted = false;
    };
  }, [compiled, theme, viewMode, height, onSelectPath]);

  // Hover dimming effect
  useEffect(() => {
    if (!svgWrapperRef.current || viewMode !== 'diagram') return;
    const svgElement = svgWrapperRef.current.querySelector('svg');
    if (!svgElement) return;

    const allNodes = svgElement.querySelectorAll('.node');

    if (!hoveredNodeId) {
      allNodes.forEach((n) => {
        (n as SVGElement).style.opacity = '1';
      });
      return;
    }

    // Direct connected neighbors of the hovered node
    const connected = new Set<string>([hoveredNodeId]);
    for (const e of spec.edges) {
      if (e.from === hoveredNodeId) connected.add(e.to);
      if (e.to === hoveredNodeId) connected.add(e.from);
    }
    for (const ee of spec.externalEdges) {
      if (ee.from === hoveredNodeId) connected.add(ee.to);
      if (ee.to === hoveredNodeId) connected.add(ee.from);
    }

    allNodes.forEach((n) => {
      const rawId = n.id || '';
      const matched = rawId.match(/(?:flowchart-)?([ce]\d+)/)?.[1];
      const isHighlighted = matched && connected.has(matched);
      (n as SVGElement).style.opacity = isHighlighted ? '1' : '0.25';
      (n as SVGElement).style.transition = 'opacity 150ms ease';
    });
  }, [hoveredNodeId, spec, viewMode]);

  // Reset View handler
  const handleResetView = useCallback(() => {
    if (!svgWrapperRef.current) return;
    const svgElement = svgWrapperRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgSelection = d3Selection.select(svgElement);
    const zoomGroup = svgSelection.select<SVGGElement>('.diagram-zoom-layer');
    try {
      const bbox = (zoomGroup.node() as SVGGraphicsElement)?.getBBox();
      if (bbox) {
        const clientWidth = svgElement.clientWidth || 800;
        const clientHeight = svgElement.clientHeight || height;
        const scale = Math.min(
          (clientWidth - 60) / bbox.width,
          (clientHeight - 60) / bbox.height,
          1.2
        );
        const tx = (clientWidth - bbox.width * scale) / 2 - bbox.x * scale;
        const ty = (clientHeight - bbox.height * scale) / 2 - bbox.y * scale;

        svgSelection
          .transition()
          .duration(300)
          .call(
            d3Zoom.zoom<SVGSVGElement, unknown>().transform,
            d3Zoom.zoomIdentity.translate(tx, ty).scale(scale)
          );
      }
    } catch {
      // ignore
    }
  }, [height]);

  // Copy raw Mermaid code
  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(compiled.mermaid);
    triggerCopyFeedback('mermaid');
  };

  // Copy as README markdown snippet
  const handleCopyReadme = () => {
    const snippet = `## Architecture Diagram\n\n\`\`\`mermaid\n${compiled.mermaid}\`\`\`\n`;
    navigator.clipboard.writeText(snippet);
    triggerCopyFeedback('readme');
  };

  // Download SVG file
  const handleDownloadSvg = () => {
    if (!svgWrapperRef.current) return;
    const svgElement = svgWrapperRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repo}-architecture.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    triggerCopyFeedback('svg');
  };

  // Download PNG at 2x resolution with footer strip
  const handleDownloadPng = () => {
    if (!svgWrapperRef.current) return;
    const svgElement = svgWrapperRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgXml = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scaleFactor = 2;
      const baseWidth = svgElement.clientWidth || 1000;
      const baseHeight = svgElement.clientHeight || 700;
      const footerHeight = 44 * scaleFactor;

      const canvas = document.createElement('canvas');
      canvas.width = baseWidth * scaleFactor;
      canvas.height = baseHeight * scaleFactor + footerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background fill
      ctx.fillStyle = theme.paper;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw diagram SVG
      ctx.drawImage(img, 0, 0, canvas.width, baseHeight * scaleFactor);

      // Footer divider
      ctx.strokeStyle = theme.fog;
      ctx.lineWidth = 1 * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(0, baseHeight * scaleFactor);
      ctx.lineTo(canvas.width, baseHeight * scaleFactor);
      ctx.stroke();

      // Footer metadata
      ctx.fillStyle = theme.ink;
      ctx.font = `${13 * scaleFactor}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(
        `${owner}/${repo}  •  sha: ${sha.slice(0, 7)}  •  RepoMetric Architecture`,
        20 * scaleFactor,
        baseHeight * scaleFactor + 28 * scaleFactor
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${repo}-architecture.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        triggerCopyFeedback('png');
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Selected item metadata and connections
  const selectedComponent = useMemo(() => {
    if (!selectedNodeId) return null;
    return spec.components.find((c) => c.id === selectedNodeId) || null;
  }, [spec.components, selectedNodeId]);

  const selectedExternal = useMemo(() => {
    if (!selectedNodeId) return null;
    return spec.externals.find((e) => e.id === selectedNodeId) || null;
  }, [spec.externals, selectedNodeId]);

  // Calculate incoming and outgoing connections for side panel
  const connections = useMemo(() => {
    if (!selectedNodeId) return { incoming: [], outgoing: [] };

    const incoming: { id: string; label: string; weight: number }[] = [];
    const outgoing: { id: string; label: string; weight: number }[] = [];

    // Internal edges
    for (const e of spec.edges) {
      if (e.to === selectedNodeId) {
        const fromComp = spec.components.find((c) => c.id === e.from);
        if (fromComp) {
          incoming.push({ id: fromComp.id, label: fromComp.label, weight: e.weight });
        }
      }
      if (e.from === selectedNodeId) {
        const toComp = spec.components.find((c) => c.id === e.to);
        if (toComp) {
          outgoing.push({ id: toComp.id, label: toComp.label, weight: e.weight });
        }
      }
    }

    // External edges
    for (const ee of spec.externalEdges) {
      if (ee.to === selectedNodeId) {
        const fromComp = spec.components.find((c) => c.id === ee.from);
        if (fromComp) {
          incoming.push({ id: fromComp.id, label: fromComp.label, weight: ee.weight });
        }
      }
      if (ee.from === selectedNodeId) {
        const toExt = spec.externals.find((ext) => ext.id === ee.to);
        if (toExt) {
          outgoing.push({ id: toExt.id, label: toExt.label, weight: ee.weight });
        }
      }
    }

    return { incoming, outgoing };
  }, [spec, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full rounded-panel border border-line bg-paper overflow-hidden select-none"
      style={{ height: `${height}px` }}
      data-testid="architecture-diagram"
    >
      {/* Live accessibility region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-line bg-surface/90 backdrop-blur-xs z-10">
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center border border-line rounded-control bg-paper p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('diagram')}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-xs text-xs font-medium transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="View as interactive diagram"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-xs text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="View as accessible list and table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>View as list</span>
            </button>
          </div>

          {/* Edge count toggle */}
          {viewMode === 'diagram' && (
            <button
              type="button"
              onClick={() => setShowEdgeWeights((prev) => !prev)}
              className={`px-2 py-1 rounded-control border border-line text-xs transition-colors ${
                showEdgeWeights
                  ? 'bg-surface text-ink font-medium'
                  : 'bg-paper text-ink-muted hover:text-ink'
              }`}
              title="Toggle import counts on edges"
            >
              Weights: {showEdgeWeights ? 'On' : 'Off'}
            </button>
          )}
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="flex items-center space-x-1">
          {viewMode === 'diagram' && (
            <>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors"
                title="Reset zoom and pan view"
                aria-label="Reset view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors"
                title="Fit to screen"
                aria-label="Fit to screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="h-4 w-px bg-line mx-1" />

          {/* Copy Mermaid */}
          <button
            type="button"
            onClick={handleCopyMermaid}
            className="flex items-center space-x-1 px-2 py-1 rounded-control border border-line bg-surface hover:bg-paper text-xs text-ink transition-colors"
            title="Copy raw Mermaid code"
          >
            {copiedAction === 'mermaid' ? (
              <Check className="w-3.5 h-3.5 text-moss-text" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-ink-muted" />
            )}
            <span>{copiedAction === 'mermaid' ? 'Copied' : 'Mermaid'}</span>
          </button>

          {/* Copy README Snippet */}
          <button
            type="button"
            onClick={handleCopyReadme}
            className="flex items-center space-x-1 px-2 py-1 rounded-control border border-line bg-surface hover:bg-paper text-xs text-ink transition-colors"
            title="Copy as Markdown ```mermaid block for README"
          >
            {copiedAction === 'readme' ? (
              <Check className="w-3.5 h-3.5 text-moss-text" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-ink-muted" />
            )}
            <span>{copiedAction === 'readme' ? 'Copied' : 'README'}</span>
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center space-x-1 px-2 py-1 rounded-control border border-line bg-surface hover:bg-paper text-xs text-ink transition-colors"
            title="Download vector SVG"
          >
            {copiedAction === 'svg' ? (
              <Check className="w-3.5 h-3.5 text-moss-text" />
            ) : (
              <Download className="w-3.5 h-3.5 text-ink-muted" />
            )}
            <span>SVG</span>
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center space-x-1 px-2 py-1 rounded-control border border-line bg-surface hover:bg-paper text-xs text-ink transition-colors"
            title="Download 2x PNG image with footer strip"
          >
            {copiedAction === 'png' ? (
              <Check className="w-3.5 h-3.5 text-moss-text" />
            ) : (
              <Download className="w-3.5 h-3.5 text-ink-muted" />
            )}
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Render Error */}
        {renderError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-paper z-20 space-y-2">
            <AlertCircle className="w-8 h-8 text-danger-text" />
            <p className="text-sm font-semibold text-danger-text">{renderError}</p>
            <p className="text-xs text-ink-muted max-w-md">
              You can still inspect the components via the list view or copy the Mermaid code.
            </p>
          </div>
        )}

        {/* View Mode 1: Interactive SVG Canvas */}
        {viewMode === 'diagram' && (
          <div
            ref={svgWrapperRef}
            className="w-full h-full flex items-center justify-center focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="Interactive architecture diagram canvas"
          />
        )}

        {/* View Mode 2: Accessible List / Table View */}
        {viewMode === 'list' && (
          <div className="w-full h-full overflow-y-auto p-4 space-y-6 bg-paper">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">
                Architecture Components ({spec.components.length})
              </h3>
              <p className="text-xs text-ink-muted">
                Keyboard accessible table of all identified architectural layers, components, and module dependencies.
              </p>
            </div>

            <div className="border border-line rounded-control bg-surface overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-paper/60 text-ink-muted font-medium">
                    <th className="py-2 px-3">Component</th>
                    <th className="py-2 px-3">Layer</th>
                    <th className="py-2 px-3">Files</th>
                    <th className="py-2 px-3">Dependencies</th>
                    <th className="py-2 px-3">Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 text-ink">
                  {spec.components.map((comp) => {
                    const isSelected = selectedNodeId === comp.id;
                    const outgoingEdges = spec.edges.filter((e) => e.from === comp.id);
                    return (
                      <tr
                        key={comp.id}
                        tabIndex={0}
                        onClick={() => {
                          setSelectedNodeId(comp.id);
                          setLiveAnnouncement(`Selected component ${comp.label}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNodeId(comp.id);
                            setLiveAnnouncement(`Selected component ${comp.label}`);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal/10 font-medium'
                            : 'hover:bg-paper/80 focus:bg-paper/80 focus:outline-none'
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold">{comp.label}</td>
                        <td className="py-2 px-3">
                          <span className="capitalize px-1.5 py-0.5 rounded text-[11px] bg-fog/30 border border-line">
                            {comp.layer}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono">{comp.fileCount}</td>
                        <td className="py-2 px-3 text-ink-muted">
                          {outgoingEdges.length > 0
                            ? outgoingEdges.length === 1
                              ? '1 target'
                              : `${outgoingEdges.length} targets`
                            : 'None'}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-ink-muted truncate max-w-[200px]">
                          {comp.path}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Externals Table if present */}
            {spec.externals.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-ink">
                  External Packages & Services ({spec.externals.length})
                </h4>
                <div className="border border-line rounded-control bg-surface overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-paper/60 text-ink-muted font-medium">
                        <th className="py-2 px-3">External</th>
                        <th className="py-2 px-3">Classification</th>
                        <th className="py-2 px-3">Imported By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60 text-ink">
                      {spec.externals.map((ext) => (
                        <tr key={ext.id} className="hover:bg-paper/80">
                          <td className="py-2 px-3 font-semibold">{ext.label}</td>
                          <td className="py-2 px-3 capitalize">
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-teal/10 text-teal-text border border-teal/20">
                              {ext.kind}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {ext.importedBy} {ext.importedBy === 1 ? 'file' : 'files'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Side Panel for Selected Node */}
        {selectedNodeId && (selectedComponent || selectedExternal) && (
          <div className="absolute top-3 right-3 w-72 max-w-[calc(100%-24px)] rounded-panel border border-line bg-surface/95 backdrop-blur-md shadow-md p-4 space-y-3 z-30 transition-all animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">
                  {selectedComponent ? `${selectedComponent.layer} layer` : `${selectedExternal?.kind} external`}
                </span>
                <h3 className="text-sm font-semibold text-ink">
                  {selectedComponent ? selectedComponent.label : selectedExternal?.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-paper transition-colors"
                title="Close component details"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedComponent && (
              <div className="space-y-1.5 text-xs text-ink-muted">
                <div className="flex justify-between border-b border-line/60 pb-1">
                  <span>Source files:</span>
                  <span className="font-mono font-medium text-ink">
                    {selectedComponent.fileCount}
                  </span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-1">
                  <span>Directory path:</span>
                  <span className="font-mono text-[11px] text-ink truncate max-w-[150px]">
                    {selectedComponent.path}
                  </span>
                </div>
              </div>
            )}

            {/* Outgoing Dependencies */}
            {connections.outgoing.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-ink-muted">
                  Depends on ({connections.outgoing.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {connections.outgoing.map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => setSelectedNodeId(conn.id)}
                      className="px-1.5 py-0.5 rounded text-[11px] bg-paper hover:bg-fog border border-line text-ink transition-colors flex items-center space-x-1"
                    >
                      <span>{conn.label}</span>
                      {conn.weight > 1 && (
                        <span className="text-[10px] text-ink-muted font-mono">
                          ({conn.weight})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming Dependencies */}
            {connections.incoming.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-ink-muted">
                  Depended on by ({connections.incoming.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {connections.incoming.map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => setSelectedNodeId(conn.id)}
                      className="px-1.5 py-0.5 rounded text-[11px] bg-paper hover:bg-fog border border-line text-ink transition-colors flex items-center space-x-1"
                    >
                      <span>{conn.label}</span>
                      {conn.weight > 1 && (
                        <span className="text-[10px] text-ink-muted font-mono">
                          ({conn.weight})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Open on GitHub Link */}
            {compiled.nodeMap[selectedNodeId]?.url && (
              <div className="pt-2 border-t border-line">
                <a
                  href={compiled.nodeMap[selectedNodeId].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-teal-text hover:underline font-medium"
                >
                  <span>Open folder on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Notes & Legend Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-line bg-surface/70 text-[11px] text-ink-muted">
        <div className="truncate max-w-xl">
          {spec.notes.length > 0 ? (
            <span>{spec.notes.join(' ')}</span>
          ) : (
            <span>
              Flowchart showing {spec.components.length} components across layers and external dependencies.
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] shrink-0 font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-fog border border-ink" />
            <span className="text-ink">Component</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-surface border-2 border-teal" />
            <span className="text-teal-text">External</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-danger" />
            <span className="text-danger-text">Cycle</span>
          </span>
        </div>
      </div>
    </div>
  );
}
