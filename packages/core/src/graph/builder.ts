import type {
  FileNode,
  GraphData,
  GraphEdge,
  GraphNode,
} from '../types';
import type { TsConfigPaths } from './types';
import { parseJsImports } from './jsParser';
import { parsePythonImports } from './pyParser';
import { posixDirname, resolveJsImport, resolvePythonImport } from './resolver';
import { findCycles } from './tarjan';

export interface BuildGraphOptions {
  maxFiles?: number;
  collapseThreshold?: number;
  tsconfig?: TsConfigPaths;
}

const ENTRY_LIKE_REGEX = /(?:^|\/)(index|main|app|cli|server|mod|__main__)\b/i;
const CONFIG_LIKE_REGEX = /(?:config|\.rc$|\.config\.[a-z]+$)/i;

/**
 * Builds deterministic GraphData from repository files and parsed source contents.
 */
export async function buildGraphData(
  allFiles: FileNode[],
  sourceContents: Map<string, string> | Record<string, string>,
  options: BuildGraphOptions = {},
): Promise<GraphData> {
  const maxFiles = options.maxFiles ?? 3000;
  const collapseThreshold = options.collapseThreshold ?? 2000;
  const tsconfig = options.tsconfig;

  const fileSet = new Set(allFiles.map((f) => f.path));
  const fileMetaMap = new Map(allFiles.map((f) => [f.path, f]));

  const getSourceContent = (path: string): string | undefined => {
    if (sourceContents instanceof Map) {
      return sourceContents.get(path);
    }
    return sourceContents[path];
  };

  // 1. Identify JS/TS and Python source files (cap at 200 KB per file)
  const candidateFiles = allFiles
    .filter((f) => {
      const ext = f.path.slice(f.path.lastIndexOf('.')).toLowerCase();
      const isJsTsPy = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'].includes(ext);
      const isUnder200Kb = f.size <= 204800;
      return isJsTsPy && isUnder200Kb;
    })
    .sort((a, b) => a.size - b.size); // prefer smaller files first per spec

  const truncated = candidateFiles.length > maxFiles;
  const filesToParse = candidateFiles.slice(0, maxFiles);

  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();
  const externalsMap = new Map<string, number>();
  let unresolvedCount = 0;

  const adj = new Map<string, Set<string>>();
  const nodeIds = new Set<string>();

  // Helper to record an edge
  const addEdge = (source: string, target: string, kind: 'static' | 'dynamic') => {
    if (source === target) return; // avoid self-loop edge spam
    const edgeKey = `${source}->${target}`;
    if (!seenEdges.has(edgeKey)) {
      seenEdges.add(edgeKey);
      edges.push({ source, target, kind });

      if (!adj.has(source)) adj.set(source, new Set());
      adj.get(source)!.add(target);

      nodeIds.add(source);
      nodeIds.add(target);
    }
  };

  // 2. Parse imports for files that have source content
  for (const file of filesToParse) {
    const content = getSourceContent(file.path);
    if (!content) continue;

    nodeIds.add(file.path);
    if (!adj.has(file.path)) adj.set(file.path, new Set());

    const isPython = file.path.endsWith('.py');
    const rawImports = isPython
      ? parsePythonImports(content)
      : await parseJsImports(content);

    for (const raw of rawImports) {
      const resolved = isPython
        ? resolvePythonImport(file.path, raw.specifier, fileSet)
        : resolveJsImport(file.path, raw.specifier, fileSet, tsconfig);

      if (resolved.target) {
        addEdge(file.path, resolved.target, raw.kind);
      } else if (resolved.external) {
        externalsMap.set(resolved.external, (externalsMap.get(resolved.external) || 0) + 1);
      } else {
        unresolvedCount++;
      }
    }
  }

  // 3. Ensure candidate source files are included in nodeIds (up to 500)
  for (const f of filesToParse.slice(0, 500)) {
    nodeIds.add(f.path);
  }

  // 4. Compute fan-in and fan-out
  const fanInMap = new Map<string, number>();
  const fanOutMap = new Map<string, number>();

  for (const edge of edges) {
    fanOutMap.set(edge.source, (fanOutMap.get(edge.source) || 0) + 1);
    fanInMap.set(edge.target, (fanInMap.get(edge.target) || 0) + 1);
  }

  // 4. Assemble GraphNodes
  let nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
    const meta = fileMetaMap.get(id);
    const folder = posixDirname(id) || '.';
    const language = meta?.language || (id.endsWith('.py') ? 'Python' : 'JavaScript');
    const size = meta?.size || 0;
    const isTest = meta?.isTest || false;

    return {
      id,
      folder,
      language,
      size,
      fanIn: fanInMap.get(id) || 0,
      fanOut: fanOutMap.get(id) || 0,
      isTest,
    };
  });

  // 5. Detect cycles using Tarjan
  const cycles = findCycles(adj);

  // 6. Detect orphans (fanIn === 0 && fanOut === 0, or fanIn === 0 for non-entry, non-test files)
  const orphans = nodes
    .filter((n) => {
      if (n.fanIn === 0 && n.fanOut === 0) return true;
      if (n.fanIn === 0) {
        const isEntry = ENTRY_LIKE_REGEX.test(n.id);
        const isConfig = CONFIG_LIKE_REGEX.test(n.id);
        return !isEntry && !isConfig && !n.isTest;
      }
      return false;
    })
    .map((n) => n.id);

  // 7. Folder collapse if node count exceeds collapseThreshold (2,000)
  let collapsedToFolders = false;
  let finalEdges = edges;

  if (nodes.length > collapseThreshold) {
    collapsedToFolders = true;
    const folderNodesMap = new Map<string, GraphNode>();
    const folderEdgesMap = new Map<string, GraphEdge>();

    for (const node of nodes) {
      const folderPath = node.folder === '.' ? 'root' : node.folder;
      const existing = folderNodesMap.get(folderPath);
      if (!existing) {
        folderNodesMap.set(folderPath, {
          id: folderPath,
          folder: posixDirname(folderPath) || '.',
          language: node.language,
          size: node.size,
          fanIn: 0,
          fanOut: 0,
          isTest: false,
        });
      } else {
        existing.size += node.size;
      }
    }

    // Map edges to folder-level edges
    for (const edge of edges) {
      const sourceFolder = (posixDirname(edge.source) || '.') === '.' ? 'root' : posixDirname(edge.source);
      const targetFolder = (posixDirname(edge.target) || '.') === '.' ? 'root' : posixDirname(edge.target);

      if (sourceFolder !== targetFolder) {
        const key = `${sourceFolder}->${targetFolder}`;
        if (!folderEdgesMap.has(key)) {
          folderEdgesMap.set(key, {
            source: sourceFolder,
            target: targetFolder,
            kind: edge.kind,
          });
        }
      }
    }

    nodes = Array.from(folderNodesMap.values());
    finalEdges = Array.from(folderEdgesMap.values());

    // Recompute folder fan-in/fan-out
    const folderFanIn = new Map<string, number>();
    const folderFanOut = new Map<string, number>();
    for (const e of finalEdges) {
      folderFanOut.set(e.source, (folderFanOut.get(e.source) || 0) + 1);
      folderFanIn.set(e.target, (folderFanIn.get(e.target) || 0) + 1);
    }
    for (const n of nodes) {
      n.fanIn = folderFanIn.get(n.id) || 0;
      n.fanOut = folderFanOut.get(n.id) || 0;
    }
  }

  // 8. Compute top 10 fan-in and fan-out
  const topFanIn = [...nodes]
    .sort((a, b) => b.fanIn - a.fanIn)
    .slice(0, 10)
    .map((n) => ({ id: n.id, count: n.fanIn }));

  const topFanOut = [...nodes]
    .sort((a, b) => b.fanOut - a.fanOut)
    .slice(0, 10)
    .map((n) => ({ id: n.id, count: n.fanOut }));

  // Format externals list
  const externals = Array.from(externalsMap.entries())
    .map(([name, importedBy]) => ({ name, importedBy }))
    .sort((a, b) => b.importedBy - a.importedBy);

  return {
    nodes,
    edges: finalEdges,
    externals,
    stats: {
      nodeCount: nodes.length,
      edgeCount: finalEdges.length,
      unresolvedCount,
      cycles,
      orphans,
      topFanIn,
      topFanOut,
    },
    truncated,
    collapsedToFolders,
  };
}
