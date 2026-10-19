'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3Force from 'd3-force';
import { polygonHull } from 'd3-polygon';
import {
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Network,
  Table as TableIcon,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { GraphData, GraphNode } from '@repometric/core';
import {
  getLanguageColor,
  getSizeColor,
  formatBytes,
  getTopLanguages,
} from './colors';

export interface DependencyGraphProps {
  data: GraphData;
  height?: number;
  className?: string;
  onSelectNode?: (nodeId: string | null) => void;
}

interface SimNode extends d3Force.SimulationNodeDatum {
  id: string;
  folder: string;
  language: string;
  size: number;
  fanIn: number;
  fanOut: number;
  isTest: boolean;
  radius: number;
  inCycle: boolean;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  kind: 'static' | 'dynamic';
}

export function DependencyGraph({
  data,
  height = 640,
  className = '',
  onSelectNode,
}: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View & UI controls
  const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');
  const [colorMode, setColorMode] = useState<'language' | 'size' | 'fanIn'>('language');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [hideTests, setHideTests] = useState(false);
  const [focusDepth, setFocusDepth] = useState<number>(1);
  const [showInsights, setShowInsights] = useState(false);

  // Interactive selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number | null>(null);
  const [hoverCard, setHoverCard] = useState<{
    node: SimNode;
    x: number;
    y: number;
  } | null>(null);

  // Transform (pan & zoom)
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimNode | null>(null);

  // Cycle membership map
  const cycleMap = useMemo(() => {
    const map = new Map<string, number[]>();
    data.stats.cycles.forEach((cycle, cycleIdx) => {
      for (const node of cycle) {
        if (!map.has(node)) map.set(node, []);
        map.get(node)!.push(cycleIdx);
      }
    });
    return map;
  }, [data.stats.cycles]);

  // Top languages for categorical palette
  const topLanguages = useMemo(() => {
    const fakeFiles = data.nodes.map((n) => ({
      path: n.id,
      size: n.size,
      language: n.language,
      isTest: n.isTest,
    }));
    return getTopLanguages(fakeFiles);
  }, [data.nodes]);

  // Unique folders for filter dropdown
  const uniqueFolders = useMemo(() => {
    const set = new Set<string>();
    for (const n of data.nodes) {
      if (n.folder) set.add(n.folder);
    }
    return Array.from(set).sort();
  }, [data.nodes]);

  // Filtered nodes and edges
  const { filteredNodes, filteredEdges } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    for (const node of data.nodes) {
      if (hideTests && node.isTest) continue;
      if (filterFolder !== 'all' && node.folder !== filterFolder) continue;
      nodeMap.set(node.id, node);
    }

    const validEdges = data.edges.filter(
      (e) => nodeMap.has(e.source) && nodeMap.has(e.target),
    );

    return {
      filteredNodes: Array.from(nodeMap.values()),
      filteredEdges: validEdges,
    };
  }, [data.nodes, data.edges, hideTests, filterFolder]);

  // Compute neighborhood set if a node is focused
  const focusedNeighborhood = useMemo(() => {
    if (!focusedNodeId) return null;
    const visited = new Set<string>([focusedNodeId]);
    let currentLevel = [focusedNodeId];

    // Build undirected adjacency
    const adj = new Map<string, Set<string>>();
    for (const e of filteredEdges) {
      if (!adj.has(e.source)) adj.set(e.source, new Set());
      if (!adj.has(e.target)) adj.set(e.target, new Set());
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);
    }

    for (let depth = 0; depth < focusDepth; depth++) {
      const nextLevel: string[] = [];
      for (const u of currentLevel) {
        const neighbors = adj.get(u);
        if (neighbors) {
          for (const v of neighbors) {
            if (!visited.has(v)) {
              visited.add(v);
              nextLevel.push(v);
            }
          }
        }
      }
      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }

    return visited;
  }, [focusedNodeId, focusDepth, filteredEdges]);

  // Simulation references
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const simulationRef = useRef<d3Force.Simulation<SimNode, SimLink> | null>(null);

  // Initialize and run D3 Force simulation
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 900;
    const currentHeight = height;

    // Reset center transform
    transformRef.current = { x: width / 2, y: currentHeight / 2, k: 0.9 };

    const nodes: SimNode[] = filteredNodes.map((n) => {
      const inCycle = cycleMap.has(n.id);
      const radius = Math.max(
        4,
        Math.min(18, 3.5 * Math.sqrt((n.fanIn || 0) + (n.fanOut || 0) + 1)),
      );
      return {
        ...n,
        radius,
        inCycle,
        x: (Math.random() - 0.5) * width * 0.6,
        y: (Math.random() - 0.5) * currentHeight * 0.6,
      };
    });

    const links: SimLink[] = filteredEdges.map((e) => ({
      source: e.source,
      target: e.target,
      kind: e.kind,
    }));

    simNodesRef.current = nodes;
    simLinksRef.current = links;

    // Folder centroid map for cluster force
    const folderCenterForce = () => {
      const folderCentroids = new Map<string, { x: number; y: number; count: number }>();
      for (const n of nodes) {
        if (n.x === undefined || n.y === undefined) continue;
        const c = folderCentroids.get(n.folder) || { x: 0, y: 0, count: 0 };
        c.x += n.x;
        c.y += n.y;
        c.count++;
        folderCentroids.set(n.folder, c);
      }

      for (const c of folderCentroids.values()) {
        c.x /= c.count;
        c.y /= c.count;
      }

      const strength = 0.04;
      for (const n of nodes) {
        const c = folderCentroids.get(n.folder);
        if (c && n.x !== undefined && n.y !== undefined) {
          n.vx = (n.vx || 0) + (c.x - n.x) * strength;
          n.vy = (n.vy || 0) + (c.y - n.y) * strength;
        }
      }
    };

    const manyBodyStrength = nodes.length > 500 ? -40 : -80;

    const sim = d3Force
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3Force
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(35),
      )
      .force('charge', d3Force.forceManyBody().strength(manyBodyStrength))
      .force(
        'collision',
        d3Force.forceCollide<SimNode>().radius((d) => d.radius + 3),
      )
      .force('x', d3Force.forceX(0).strength(0.06))
      .force('y', d3Force.forceY(0).strength(0.06))
      .force('folderCluster', folderCenterForce)
      .alphaDecay(0.035)
      .alphaMin(0.02);

    simulationRef.current = sim;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const render = () => {
      drawCanvas();
      if (sim.alpha() >= sim.alphaMin()) {
        animId = requestAnimationFrame(render);
      }
    };

    sim.on('tick', () => {
      drawCanvas();
    });

    render();

    return () => {
      sim.stop();
      cancelAnimationFrame(animId);
    };
  }, [filteredNodes, filteredEdges, cycleMap, height]);

  // Main Canvas drawing function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const clientHeight = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== clientHeight * dpr) {
      canvas.width = width * dpr;
      canvas.height = clientHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, clientHeight);

    const { x: tx, y: ty, k } = transformRef.current;
    ctx.translate(tx, ty);
    ctx.scale(k, k);

    const nodes = simNodesRef.current;
    const links = simLinksRef.current;

    // 1. Draw Folder Hulls in background
    const folderPoints = new Map<string, [number, number][]>();
    for (const n of nodes) {
      if (n.x === undefined || n.y === undefined) continue;
      if (!folderPoints.has(n.folder)) folderPoints.set(n.folder, []);
      folderPoints.get(n.folder)!.push([n.x, n.y]);
    }

    ctx.save();
    for (const [folder, pts] of folderPoints.entries()) {
      if (pts.length >= 3) {
        const hull = polygonHull(pts);
        if (hull && hull.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(hull[0][0], hull[0][1]);
          for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i][0], hull[i][1]);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(74, 158, 222, 0.04)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(74, 158, 222, 0.12)';
          ctx.lineWidth = 1 / k;
          ctx.stroke();

          // Folder label at top of hull
          const minY = Math.min(...hull.map((p) => p[1]));
          const avgX = hull.reduce((sum, p) => sum + p[0], 0) / hull.length;
          ctx.fillStyle = 'rgba(120, 130, 140, 0.45)';
          ctx.font = `${Math.max(9, 11 / k)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(folder, avgX, minY - 4);
        }
      }
    }
    ctx.restore();

    // 2. Determine node opacity & highlighting
    const isNodeDimmed = (nodeId: string): boolean => {
      if (focusedNeighborhood && !focusedNeighborhood.has(nodeId)) return true;
      if (activeCycleIndex !== null) {
        const activeCycle = data.stats.cycles[activeCycleIndex];
        if (activeCycle && !activeCycle.includes(nodeId)) return true;
      }
      if (hoveredNodeId && hoveredNodeId !== nodeId) {
        // If hovered, dim everything except direct neighbors
        const isNeighbor = links.some((l) => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return (s === hoveredNodeId && t === nodeId) || (t === hoveredNodeId && s === nodeId);
        });
        if (!isNeighbor) return true;
      }
      if (searchQuery.trim()) {
        return !nodeId.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    };

    // 3. Draw Edges
    for (const link of links) {
      const s = typeof link.source === 'object' ? link.source : null;
      const t = typeof link.target === 'object' ? link.target : null;
      if (!s || !t || s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined) {
        continue;
      }

      const sDimmed = isNodeDimmed(s.id);
      const tDimmed = isNodeDimmed(t.id);
      const isEdgeDimmed = sDimmed || tDimmed;

      const isCycleEdge =
        activeCycleIndex !== null &&
        data.stats.cycles[activeCycleIndex]?.includes(s.id) &&
        data.stats.cycles[activeCycleIndex]?.includes(t.id);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (isCycleEdge) {
        ctx.strokeStyle = '#e05252';
        ctx.lineWidth = 2.5 / k;
        ctx.stroke();
      } else if (isEdgeDimmed) {
        ctx.strokeStyle = 'rgba(180, 190, 200, 0.08)';
        ctx.lineWidth = 1 / k;
        ctx.stroke();
      } else {
        ctx.strokeStyle = link.kind === 'dynamic' ? 'rgba(74, 158, 222, 0.45)' : 'rgba(120, 140, 160, 0.28)';
        ctx.lineWidth = (hoveredNodeId && (s.id === hoveredNodeId || t.id === hoveredNodeId)) ? 1.8 / k : 1 / k;
        if (link.kind === 'dynamic') {
          ctx.setLineDash([3 / k, 3 / k]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 4. Draw Nodes
    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) continue;

      const dimmed = isNodeDimmed(node.id);
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isFocused = focusedNodeId === node.id;

      let fillColor = '#999999';
      if (node.inCycle) {
        fillColor = '#e05252'; // Danger color for cycles per spec
      } else if (colorMode === 'language') {
        fillColor = getLanguageColor(node.language, topLanguages);
      } else if (colorMode === 'size') {
        fillColor = getSizeColor(node.size);
      } else if (colorMode === 'fanIn') {
        fillColor = node.fanIn > 8 ? '#0072b2' : node.fanIn > 3 ? '#56b4e9' : '#a1dab4';
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      if (dimmed) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = fillColor;
        ctx.fill();
      } else {
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Stroke ring
        if (isSelected || isFocused) {
          ctx.strokeStyle = '#0072b2';
          ctx.lineWidth = 3 / k;
          ctx.stroke();
        } else if (isHovered) {
          ctx.strokeStyle = '#222222';
          ctx.lineWidth = 2 / k;
          ctx.stroke();
        } else if (node.inCycle) {
          ctx.strokeStyle = '#a82a2a';
          ctx.lineWidth = 1.5 / k;
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1 / k;
          ctx.stroke();
        }

        // Label on larger nodes or when selected/hovered/zoomed in
        if (isHovered || isSelected || k > 1.4 || node.radius >= 10) {
          const fileName = node.id.split('/').pop() || node.id;
          ctx.fillStyle = isSelected ? '#0072b2' : '#222222';
          ctx.font = `${isSelected ? 'bold ' : ''}${Math.max(8, 10 / k)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(fileName, node.x, node.y + node.radius + 11 / k);
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }, [
    colorMode,
    topLanguages,
    hoveredNodeId,
    selectedNodeId,
    focusedNodeId,
    focusedNeighborhood,
    activeCycleIndex,
    searchQuery,
    data.stats.cycles,
  ]);

  // Redraw when state updates
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Find node under canvas cursor
  const getNodeAtPoint = (clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const { x: tx, y: ty, k } = transformRef.current;
    const graphX = (px - tx) / k;
    const graphY = (py - ty) / k;

    // Test nodes from top radius down
    for (const node of simNodesRef.current) {
      if (node.x === undefined || node.y === undefined) continue;
      const dx = graphX - node.x;
      const dy = graphY - node.y;
      if (dx * dx + dy * dy <= (node.radius + 4) * (node.radius + 4)) {
        return node;
      }
    }
    return null;
  };

  // Mouse wheel pan & zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newK = Math.max(0.2, Math.min(6, transformRef.current.k * zoomFactor));

    // Zoom centered on cursor
    transformRef.current.x = px - (px - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = py - (py - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;

    drawCanvas();
  };

  // Mouse down: start node dragging or canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    const node = getNodeAtPoint(e.clientX, e.clientY);
    if (node) {
      draggedNodeRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
      simulationRef.current?.alphaTarget(0.3).restart();
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Mouse move: hover detection, hover card, or panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { x: tx, y: ty, k } = transformRef.current;

      draggedNodeRef.current.fx = (px - tx) / k;
      draggedNodeRef.current.fy = (py - ty) / k;
      drawCanvas();
      return;
    }

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      drawCanvas();
      return;
    }

    // Hover detection
    const node = getNodeAtPoint(e.clientX, e.clientY);
    if (node) {
      setHoveredNodeId(node.id);
      const canvas = canvasRef.current;
      const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      setHoverCard({
        node,
        x: e.clientX - rect.left + 16,
        y: e.clientY - rect.top + 16,
      });
    } else {
      if (hoveredNodeId !== null) {
        setHoveredNodeId(null);
        setHoverCard(null);
      }
    }
  };

  // Mouse up: unpin or finish drag
  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current = null;
      simulationRef.current?.alphaTarget(0);
    }
    isDraggingRef.current = false;
  };

  // Single click: select node
  const handleClick = (e: React.MouseEvent) => {
    const node = getNodeAtPoint(e.clientX, e.clientY);
    if (node) {
      setSelectedNodeId(node.id);
      if (onSelectNode) onSelectNode(node.id);
    } else {
      setSelectedNodeId(null);
      if (onSelectNode) onSelectNode(null);
    }
  };

  // Double click: focus neighborhood or unpin
  const handleDoubleClick = (e: React.MouseEvent) => {
    const node = getNodeAtPoint(e.clientX, e.clientY);
    if (node) {
      // Toggle focus neighborhood
      if (focusedNodeId === node.id) {
        setFocusedNodeId(null);
      } else {
        setFocusedNodeId(node.id);
      }
      // Unpin
      node.fx = null;
      node.fy = null;
      simulationRef.current?.alpha(0.2).restart();
    } else {
      // Reset zoom
      const canvas = canvasRef.current;
      if (!canvas) return;
      transformRef.current = {
        x: canvas.clientWidth / 2,
        y: canvas.clientHeight / 2,
        k: 1,
      };
      setFocusedNodeId(null);
      setActiveCycleIndex(null);
      drawCanvas();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col border border-line rounded-panel bg-surface overflow-hidden ${className}`}
    >
      {/* Top Toolbar */}
      <div className="p-3 border-b border-line bg-paper/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search & Folder Filters */}
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file in graph..."
              className="w-full h-8 pl-8 pr-3 bg-surface border border-line rounded-control text-ink text-xs focus:outline-none focus:border-teal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Folder filter */}
          <select
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
            className="h-8 px-2 bg-surface border border-line rounded-control text-ink text-xs focus:outline-none focus:border-teal"
          >
            <option value="all">All folders ({uniqueFolders.length})</option>
            {uniqueFolders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Hide tests toggle */}
          <button
            type="button"
            onClick={() => setHideTests(!hideTests)}
            className={`h-8 px-2.5 rounded-control border text-xs font-medium inline-flex items-center space-x-1.5 transition-colors ${
              hideTests
                ? 'bg-teal/15 border-teal text-teal'
                : 'bg-surface border-line text-ink-muted hover:text-ink'
            }`}
            title="Hide test files from graph"
          >
            {hideTests ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideTests ? 'Tests hidden' : 'Hide tests'}</span>
          </button>
        </div>

        {/* Right Controls: Color mode, view toggle, insights */}
        <div className="flex items-center space-x-2">
          {/* Color Mode */}
          <div className="flex items-center border border-line rounded-control bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setColorMode('language')}
              className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors ${
                colorMode === 'language' ? 'bg-paper text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Language
            </button>
            <button
              type="button"
              onClick={() => setColorMode('size')}
              className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors ${
                colorMode === 'size' ? 'bg-paper text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Size
            </button>
            <button
              type="button"
              onClick={() => setColorMode('fanIn')}
              className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors ${
                colorMode === 'fanIn' ? 'bg-paper text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Fan-In
            </button>
          </div>

          {/* Focus depth slider if neighborhood is active */}
          {focusedNodeId && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-control bg-surface border border-line text-[11px]">
              <span className="text-ink-muted font-medium">Hops:</span>
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFocusDepth(d)}
                  className={`w-5 h-5 rounded-xs font-mono font-semibold ${
                    focusDepth === d ? 'bg-teal text-white' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFocusedNodeId(null)}
                className="ml-1 text-teal hover:underline text-[10px]"
              >
                Reset
              </button>
            </div>
          )}

          {/* Insights Button */}
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className={`h-8 px-2.5 rounded-control border text-xs font-medium inline-flex items-center space-x-1.5 transition-colors ${
              showInsights
                ? 'bg-teal/15 border-teal text-teal'
                : 'bg-surface border-line text-ink-muted hover:text-ink'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Insights ({data.stats.cycles.length} cycles)</span>
          </button>

          {/* Table / Canvas Mode */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'canvas' ? 'table' : 'canvas')}
            className="h-8 px-2.5 rounded-control border border-line bg-surface text-ink-muted hover:text-ink text-xs font-medium inline-flex items-center space-x-1"
            title="Toggle accessible table view"
          >
            {viewMode === 'canvas' ? <TableIcon className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
            <span>{viewMode === 'canvas' ? 'Table' : 'Canvas'}</span>
          </button>
        </div>
      </div>

      {/* Main Graph Content Area */}
      <div className="relative w-full flex-1 min-h-[500px]" style={{ height }}>
        {viewMode === 'canvas' ? (
          <>
            <canvas
              ref={canvasRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              className="w-full h-full cursor-grab active:cursor-grabbing block"
              tabIndex={0}
              aria-label="Force directed dependency graph. Tab to focus, double-click a node to focus its neighborhood."
            />

            {/* Hover Tooltip Card */}
            {hoverCard && (
              <div
                className="absolute pointer-events-none p-3 rounded-control border border-line bg-paper/95 shadow-md backdrop-blur-xs text-xs z-20 space-y-1.5 max-w-xs font-sans"
                style={{
                  left: Math.min(hoverCard.x, (containerRef.current?.clientWidth || 800) - 240),
                  top: Math.min(hoverCard.y, height - 140),
                }}
              >
                <div className="font-semibold text-ink font-mono truncate">{hoverCard.node.id}</div>
                <div className="flex items-center space-x-2 text-[11px] text-ink-muted">
                  <span>{hoverCard.node.language}</span>
                  <span>•</span>
                  <span>{formatBytes(hoverCard.node.size)}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] pt-1 border-t border-line font-mono">
                  <span>In: {hoverCard.node.fanIn}</span>
                  <span>Out: {hoverCard.node.fanOut}</span>
                  {hoverCard.node.inCycle && (
                    <span className="text-danger-text font-bold">⚠️ In Cycle</span>
                  )}
                </div>
              </div>
            )}

            {/* Canvas overlay buttons */}
            <div className="absolute left-3 bottom-3 flex items-center space-x-1 bg-surface/90 border border-line p-1 rounded-control shadow-xs backdrop-blur-xs text-xs">
              <button
                type="button"
                onClick={() => {
                  transformRef.current.k *= 1.25;
                  drawCanvas();
                }}
                className="p-1.5 rounded-xs hover:bg-paper text-ink"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  transformRef.current.k *= 0.8;
                  drawCanvas();
                }}
                className="p-1.5 rounded-xs hover:bg-paper text-ink"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    transformRef.current = {
                      x: canvas.clientWidth / 2,
                      y: canvas.clientHeight / 2,
                      k: 1,
                    };
                    drawCanvas();
                  }
                }}
                className="p-1.5 rounded-xs hover:bg-paper text-ink"
                title="Reset view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapsed Warning if applicable */}
            {data.collapsedToFolders && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-control border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Collapsed to folders ({data.nodes.length} folders) to maintain 60 fps budget.</span>
              </div>
            )}
          </>
        ) : (
          /* Accessible Table View */
          <div className="w-full h-full overflow-auto p-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="py-2 px-3 font-semibold">File path</th>
                  <th className="py-2 px-3 font-semibold">Folder</th>
                  <th className="py-2 px-3 font-semibold">Language</th>
                  <th className="py-2 px-3 font-semibold">Fan-In</th>
                  <th className="py-2 px-3 font-semibold">Fan-Out</th>
                  <th className="py-2 px-3 font-semibold">Size</th>
                  <th className="py-2 px-3 font-semibold">Cycle?</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setViewMode('canvas');
                    }}
                    className="border-b border-line/60 hover:bg-paper cursor-pointer font-mono text-[11px]"
                  >
                    <td className="py-2 px-3 text-ink font-medium">{node.id}</td>
                    <td className="py-2 px-3 text-ink-muted">{node.folder}</td>
                    <td className="py-2 px-3 text-ink-muted">{node.language}</td>
                    <td className="py-2 px-3 text-teal font-semibold">{node.fanIn}</td>
                    <td className="py-2 px-3 text-ink-muted">{node.fanOut}</td>
                    <td className="py-2 px-3 text-ink-muted">{formatBytes(node.size)}</td>
                    <td className="py-2 px-3">
                      {cycleMap.has(node.id) ? (
                        <span className="text-danger-text font-bold">Yes</span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Insights Slide-Over Panel */}
        {showInsights && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-paper/95 border-l border-line shadow-lg backdrop-blur-xs p-4 overflow-y-auto space-y-5 text-xs z-30">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-teal" />
                <h3 className="font-heading font-semibold text-ink">Graph Insights</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInsights(false)}
                className="text-ink-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Dependencies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Circular Dependencies</span>
                <span className="px-1.5 py-0.5 rounded-xs bg-danger/15 text-danger-text font-mono font-bold">
                  {data.stats.cycles.length}
                </span>
              </div>
              {data.stats.cycles.length > 0 ? (
                <div className="space-y-2">
                  {data.stats.cycles.map((cycle, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveCycleIndex(activeCycleIndex === idx ? null : idx);
                        setViewMode('canvas');
                      }}
                      className={`p-2 rounded-control border cursor-pointer transition-colors ${
                        activeCycleIndex === idx
                          ? 'border-danger bg-danger/10 text-danger-text'
                          : 'border-line bg-surface hover:border-danger/50 text-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>Cycle #{idx + 1} ({cycle.length} files)</span>
                        <span className="text-[10px] font-mono">
                          {activeCycleIndex === idx ? 'Highlighted' : 'Click to highlight'}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-0.5 text-[11px] font-mono text-ink-muted">
                        {cycle.map((f) => (
                          <li key={f} className="truncate">• {f.split('/').pop()}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink-muted text-[11px]">No circular dependencies found in parsed code.</p>
              )}
            </div>

            {/* Top 10 Depended On (Fan-In) */}
            <div className="space-y-2 pt-2 border-t border-line">
              <span className="font-semibold text-ink">Most Depended On (Fan-In)</span>
              <ul className="space-y-1">
                {data.stats.topFanIn.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setSelectedNodeId(item.id);
                      setFocusedNodeId(item.id);
                      setViewMode('canvas');
                    }}
                    className="flex items-center justify-between p-1.5 rounded-control bg-surface hover:bg-paper border border-line cursor-pointer font-mono text-[11px]"
                  >
                    <span className="truncate flex-1 mr-2 text-ink">{item.id.split('/').pop()}</span>
                    <span className="text-teal font-bold">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Orphans */}
            {data.stats.orphans.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Possibly Unused Files</span>
                  <span className="text-ink-muted font-mono">{data.stats.orphans.length}</span>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {data.stats.orphans.slice(0, 15).map((orphan) => (
                    <li
                      key={orphan}
                      onClick={() => {
                        setSelectedNodeId(orphan);
                        setViewMode('canvas');
                      }}
                      className="p-1 rounded-control bg-surface text-ink-muted hover:text-ink font-mono text-[11px] truncate cursor-pointer"
                    >
                      {orphan}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status / Legend Bar */}
      <div className="px-4 py-2 border-t border-line bg-paper/60 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex items-center space-x-3">
          <span>{filteredNodes.length} files</span>
          <span>•</span>
          <span>{filteredEdges.length} import edges</span>
          <span>•</span>
          <span>{data.stats.cycles.length} cycles</span>
          {data.stats.unresolvedCount > 0 && (
            <>
              <span>•</span>
              <span>{data.stats.unresolvedCount} unresolved</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e05252]" />
            <span>Cycle</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e69f00]" />
            <span>TypeScript / JS</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009e73]" />
            <span>Python</span>
          </div>
        </div>
      </div>
    </div>
  );
}
