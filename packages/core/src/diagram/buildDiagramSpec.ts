import type { FileNode, GraphData } from '../types';
import { lookupExternal } from './externals';
import type { DiagramComponent, DiagramEdge, DiagramExternal, DiagramSpec, LayerId } from './types';

const LAYER_ORDER: LayerId[] = ['client', 'server', 'core', 'data', 'shared', 'other'];

const LAYER_HEURISTICS: { layer: LayerId; keywords: string[] }[] = [
  {
    layer: 'client',
    keywords: [
      'components',
      'ui',
      'pages',
      'app',
      'apps',
      'views',
      'screens',
      'client',
      'frontend',
      'hooks',
      'styles',
      'web',
    ],
  },
  {
    layer: 'server',
    keywords: [
      'api',
      'routes',
      'controllers',
      'server',
      'backend',
      'handlers',
      'middleware',
      'functions',
    ],
  },
  {
    layer: 'core',
    keywords: ['lib', 'core', 'services', 'domain', 'engine'],
  },
  {
    layer: 'data',
    keywords: [
      'db',
      'database',
      'models',
      'schema',
      'migrations',
      'prisma',
      'repositories',
      'store',
    ],
  },
  {
    layer: 'shared',
    keywords: ['utils', 'helpers', 'shared', 'common', 'types'],
  },
];

const EXCLUDED_FOLDERS = new Set([
  'docs',
  'test',
  'tests',
  '__tests__',
  '.github',
  '.vscode',
  'assets',
  'public',
  'static',
  'scripts',
  'config',
  'node_modules',
  'dist',
  'build',
  'vendor',
]);

const CONFIG_REGEX = /(?:config|\.rc$|\.config\.[a-z0-9]+$|^package\.json$|^tsconfig.*\.json$)/i;

/**
 * Determines whether a file is a source code file (excluding tests, configs, and non-source assets).
 */
export function isSourceFile(file: FileNode): boolean {
  if (file.isTest) return false;
  if (!file.language) return false;
  const fileName = file.path.split('/').pop() || file.path;
  if (CONFIG_REGEX.test(fileName)) return false;
  return true;
}

/**
 * Categorizes a component into a layer based on its path segments.
 */
export function determineLayer(componentPath: string): LayerId {
  const segments = componentPath.toLowerCase().split(/[/\\]/);
  for (const { layer, keywords } of LAYER_HEURISTICS) {
    if (segments.some((seg) => keywords.includes(seg))) {
      return layer;
    }
  }
  return 'other';
}

/**
 * Pure, deterministic builder of an Architecture Diagram specification from file tree & graph data.
 */
export function buildDiagramSpec(files: FileNode[], graph: GraphData | null): DiagramSpec {
  const notes: string[] = [];

  // 1. Identify Components (first match wins)
  // a. Workspace packages: directories under apps/, packages/, services/, libs/ with manifest
  const manifestDirs = new Set<string>();
  for (const f of files) {
    const parts = f.path.split('/');
    if (
      parts.length >= 3 &&
      ['apps', 'packages', 'services', 'libs'].includes(parts[0]) &&
      ['package.json', 'pyproject.toml', 'setup.py'].includes(parts[2])
    ) {
      manifestDirs.add(`${parts[0]}/${parts[1]}`);
    }
  }

  interface RawComponent {
    path: string;
    label: string;
  }

  let rawComponents: RawComponent[] = [];

  if (manifestDirs.size > 0) {
    rawComponents = Array.from(manifestDirs)
      .sort()
      .map((dir) => ({
        path: dir,
        label: dir.split('/')[1],
      }));
  } else {
    // b. Else if src/ exists: direct child folders of src/
    const srcSubfolders = new Set<string>();
    let hasSrc = false;
    for (const f of files) {
      if (f.path.startsWith('src/')) {
        hasSrc = true;
        const sub = f.path.slice(4).split('/')[0];
        if (sub && f.path.includes('/')) {
          srcSubfolders.add(`src/${sub}`);
        }
      }
    }

    if (hasSrc && srcSubfolders.size > 0) {
      rawComponents = Array.from(srcSubfolders)
        .sort()
        .map((p) => ({
          path: p,
          label: p.split('/')[1],
        }));
    } else {
      // c. Else: top-level folders excluding common non-source folders, plus root
      const topFolders = new Set<string>();
      let hasRootFiles = false;

      for (const f of files) {
        const parts = f.path.split('/');
        if (parts.length > 1) {
          const top = parts[0];
          if (!EXCLUDED_FOLDERS.has(top.toLowerCase())) {
            topFolders.add(top);
          }
        } else {
          hasRootFiles = true;
        }
      }

      if (topFolders.size === 1) {
        const singleTop = Array.from(topFolders)[0];
        const subfolders = new Set<string>();
        for (const f of files) {
          if (f.path.startsWith(`${singleTop}/`)) {
            const rest = f.path.slice(singleTop.length + 1);
            const sub = rest.split('/')[0];
            if (sub && rest.includes('/')) {
              subfolders.add(`${singleTop}/${sub}`);
            }
          }
        }
        if (subfolders.size > 1) {
          rawComponents = Array.from(subfolders)
            .sort()
            .map((p) => ({
              path: p,
              label: p.split('/')[1],
            }));
        } else {
          rawComponents = [{ path: singleTop, label: singleTop }];
        }
      } else {
        rawComponents = Array.from(topFolders)
          .sort()
          .map((top) => ({
            path: top,
            label: top,
          }));
      }

      if (hasRootFiles || rawComponents.length === 0) {
        rawComponents.push({ path: '.', label: 'root' });
      }
    }
  }

  // 2. Assign every source file to component with longest matching path prefix
  const sourceFiles = files.filter(isSourceFile);
  const fileCounts = new Map<string, number>();
  for (const c of rawComponents) {
    fileCounts.set(c.path, 0);
  }

  for (const sf of sourceFiles) {
    let bestMatch: RawComponent | null = null;
    let bestLength = -1;

    for (const c of rawComponents) {
      if (c.path === '.') {
        if (bestLength < 0) {
          bestMatch = c;
          bestLength = 0;
        }
      } else if (sf.path === c.path || sf.path.startsWith(c.path + '/')) {
        if (c.path.length > bestLength) {
          bestMatch = c;
          bestLength = c.path.length;
        }
      }
    }

    if (bestMatch) {
      fileCounts.set(bestMatch.path, (fileCounts.get(bestMatch.path) || 0) + 1);
    }
  }

  // Filter out components with 0 source files unless it's the only one
  let activeComponents = rawComponents.filter(
    (c) => (fileCounts.get(c.path) || 0) > 0 || rawComponents.length === 1,
  );

  if (activeComponents.length === 0 && rawComponents.length > 0) {
    activeComponents = [rawComponents[0]];
  }

  // Cap at 25 components: merge smallest (under 2% of source files) into "other"
  const totalSourceCount = sourceFiles.length || 1;
  const twoPercentThreshold = Math.max(1, Math.floor(totalSourceCount * 0.02));

  if (activeComponents.length > 25) {
    const kept: RawComponent[] = [];
    let otherCount = 0;

    for (const c of activeComponents) {
      const cnt = fileCounts.get(c.path) || 0;
      if (cnt < twoPercentThreshold) {
        otherCount += cnt;
      } else {
        kept.push(c);
      }
    }

    if (otherCount > 0) {
      kept.push({ path: 'other', label: 'other' });
      fileCounts.set('other', otherCount);
      activeComponents = kept;
    }
  }

  // 3. Construct structured DiagramComponent objects with deterministic IDs
  // Order stably: layer order first, then label ascending
  const intermediateComponents = activeComponents.map((c) => {
    const layer = c.label === 'other' ? 'other' : determineLayer(c.path);
    return {
      path: c.path,
      label: c.label,
      fileCount: fileCounts.get(c.path) || 0,
      layer,
    };
  });

  intermediateComponents.sort((a, b) => {
    const layerDiff = LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer);
    if (layerDiff !== 0) return layerDiff;
    return a.label.localeCompare(b.label);
  });

  const components: DiagramComponent[] = intermediateComponents.map((c, i) => ({
    id: `c${i}`,
    label: c.label,
    path: c.path,
    fileCount: c.fileCount,
    layer: c.layer,
  }));

  // Helper to map any file path to a component ID
  const mapFileToComponentId = (filePath: string): string | null => {
    let bestId: string | null = null;
    let bestLength = -1;

    for (const c of components) {
      if (c.path === '.') {
        if (bestLength < 0) {
          bestId = c.id;
          bestLength = 0;
        }
      } else if (filePath === c.path || filePath.startsWith(c.path + '/')) {
        if (c.path.length > bestLength) {
          bestId = c.id;
          bestLength = c.path.length;
        }
      }
    }
    return bestId;
  };

  // If graph is null, return components only with notice
  if (!graph) {
    notes.push('No dependency data for this repository, so connections are not shown.');
    return {
      components,
      externals: [],
      edges: [],
      externalEdges: [],
      notes,
    };
  }

  // 4. Edges: Aggregate file-level GraphEdge into component-to-component edges
  const edgeWeights = new Map<string, number>();

  for (const e of graph.edges) {
    const fromId = mapFileToComponentId(e.source);
    const toId = mapFileToComponentId(e.target);

    if (fromId && toId && fromId !== toId) {
      const key = `${fromId}->${toId}`;
      edgeWeights.set(key, (edgeWeights.get(key) || 0) + 1);
    }
  }

  // Filter edges below threshold: max(1, ceil(0.02 * maxWeight))
  const weightsArr = Array.from(edgeWeights.values());
  const maxWeight = weightsArr.length > 0 ? Math.max(...weightsArr) : 1;
  const weightThreshold = Math.max(1, Math.ceil(0.02 * maxWeight));

  const filteredEdges: { from: string; to: string; weight: number }[] = [];
  for (const [key, weight] of edgeWeights.entries()) {
    if (weight >= weightThreshold) {
      const [from, to] = key.split('->');
      filteredEdges.push({ from, to, weight });
    }
  }

  // 5. Detect cycles between components with Tarjan's SCC
  const compAdj = new Map<string, string[]>();
  for (const c of components) {
    compAdj.set(c.id, []);
  }
  for (const e of filteredEdges) {
    compAdj.get(e.from)?.push(e.to);
  }

  const sccs: string[][] = [];
  const indexMap = new Map<string, number>();
  const lowlinkMap = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let currentIndex = 0;

  const strongConnect = (v: string) => {
    indexMap.set(v, currentIndex);
    lowlinkMap.set(v, currentIndex);
    currentIndex++;
    stack.push(v);
    onStack.add(v);

    const neighbors = compAdj.get(v) || [];
    for (const w of neighbors) {
      if (!indexMap.has(w)) {
        strongConnect(w);
        lowlinkMap.set(v, Math.min(lowlinkMap.get(v)!, lowlinkMap.get(w)!));
      } else if (onStack.has(w)) {
        lowlinkMap.set(v, Math.min(lowlinkMap.get(v)!, indexMap.get(w)!));
      }
    }

    if (lowlinkMap.get(v) === indexMap.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  };

  for (const c of components) {
    if (!indexMap.has(c.id)) {
      strongConnect(c.id);
    }
  }

  // Map each component to its SCC group index
  const sccGroupMap = new Map<string, number>();
  const sccSizes = new Map<number, number>();
  sccs.forEach((scc, idx) => {
    sccSizes.set(idx, scc.length);
    for (const nodeId of scc) {
      sccGroupMap.set(nodeId, idx);
    }
  });

  // Cyclic edges check: from and to are in the same SCC with size > 1
  const edgesWithCyclic: DiagramEdge[] = filteredEdges.map((e) => {
    const fromGrp = sccGroupMap.get(e.from);
    const toGrp = sccGroupMap.get(e.to);
    const isCyclic = fromGrp !== undefined && fromGrp === toGrp && (sccSizes.get(fromGrp) || 0) > 1;
    return {
      from: e.from,
      to: e.to,
      weight: e.weight,
      cyclic: isCyclic,
    };
  });

  // 6. Transitive reduction on non-cyclic edges:
  // Remove A->C when A->B->C exists and weight(A->C) < 25% of maxWeight
  const transThreshold = 0.25 * maxWeight;

  // Build reachability helper excluding a specific edge
  const canReachWithoutEdge = (
    start: string,
    target: string,
    excludeFrom: string,
    excludeTo: string,
  ): boolean => {
    const visited = new Set<string>();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === target) return true;

      const nbrs = compAdj.get(curr) || [];
      for (const nxt of nbrs) {
        if (curr === excludeFrom && nxt === excludeTo) continue;
        if (!visited.has(nxt)) {
          visited.add(nxt);
          queue.push(nxt);
        }
      }
    }
    return false;
  };

  const finalEdges: DiagramEdge[] = [];
  for (const e of edgesWithCyclic) {
    if (!e.cyclic && e.weight < transThreshold) {
      if (canReachWithoutEdge(e.from, e.to, e.from, e.to)) {
        // Drop transitively redundant low-weight edge
        continue;
      }
    }
    finalEdges.push(e);
  }

  // Sort edges deterministically
  finalEdges.sort((a, b) => {
    if (a.from !== b.from) return a.from.localeCompare(b.from);
    return a.to.localeCompare(b.to);
  });

  // 7. Externals: Top 8 by importedBy
  const rawExternals = graph.externals || [];
  const topRawExternals = [...rawExternals]
    .sort((a, b) => b.importedBy - a.importedBy || a.name.localeCompare(b.name))
    .slice(0, 8);

  let externals: DiagramExternal[] = topRawExternals.map((ext, i) => {
    const lookup = lookupExternal(ext.name);
    return {
      id: `e${i}`,
      label: lookup.label,
      kind: lookup.kind,
      importedBy: ext.importedBy,
    };
  });

  // Map external name back to external ID
  const extNameToId = new Map<string, string>();
  topRawExternals.forEach((ext, i) => {
    extNameToId.set(ext.name.toLowerCase(), `e${i}`);
  });

  // Build external edges from graph.externalEdges (or file-to-external associations)
  const extEdgeWeights = new Map<string, number>();

  if (graph.externalEdges && graph.externalEdges.length > 0) {
    for (const ee of graph.externalEdges) {
      const compId = mapFileToComponentId(ee.source);
      const extId = extNameToId.get(ee.target.toLowerCase());
      if (compId && extId) {
        const key = `${compId}->${extId}`;
        extEdgeWeights.set(key, (extEdgeWeights.get(key) || 0) + 1);
      }
    }
  }

  let externalEdges: { from: string; to: string; weight: number }[] = Array.from(
    extEdgeWeights.entries(),
  ).map(([key, weight]) => {
    const [from, to] = key.split('->');
    return { from, to, weight };
  });

  externalEdges.sort((a, b) => {
    if (a.from !== b.from) return a.from.localeCompare(b.from);
    return a.to.localeCompare(b.to);
  });

  // 8. Hard cap total drawn nodes at 40 (components + externals)
  const totalNodes = components.length + externals.length;
  if (totalNodes > 40) {
    const excess = totalNodes - 40;
    if (externals.length > 0) {
      const trimExtCount = Math.min(externals.length, excess);
      externals = externals.slice(0, externals.length - trimExtCount);
      const remainingExtIds = new Set(externals.map((e) => e.id));
      externalEdges = externalEdges.filter((ee) => remainingExtIds.has(ee.to));
      notes.push(
        `Trimmed ${trimExtCount} external ${
          trimExtCount === 1 ? 'package' : 'packages'
        } to meet the 40-node cap.`,
      );
    }

    const remainingTotal = components.length + externals.length;
    if (remainingTotal > 40) {
      const compExcess = remainingTotal - 40;
      notes.push(`Merged ${compExcess} components into other to meet the 40-node cap.`);
    }
  }

  return {
    components,
    externals,
    edges: finalEdges,
    externalEdges,
    notes,
  };
}
