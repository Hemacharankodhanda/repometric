# Architecture

## 1. Packages and boundaries
```
apps/web  ──imports──>  packages/viz  ──imports──>  packages/core
packages/cli ─────────────────────────────────────>  packages/core
```
- `core`: pure TypeScript. Scoring, parsers, graph builder, GitHub client. No React, no Next.js, no `fs`. Runs in Node, browsers and web workers.
- `viz`: React + Canvas components (`RepoMap`, `DependencyGraph`), the selection store, color scales. No data fetching.
- `web`: routes, pages, API route handlers, Supabase access, design system. Only the server code touches Supabase and the GitHub token.
- `cli`: argument parsing and terminal output around `core`.

## 2. Data flow
```
Browser                         Next.js server (Vercel)                 External
-------                         ----------------------                  --------
POST /api/analyze  ──────────>  normalize repo, get head SHA  ────────> GitHub API
                                lookup (repo, sha) in Supabase
                                  hit  -> return report
                                  miss -> build RepoSnapshot  ────────> GitHub API,
                                          scoreSnapshot()               raw.githubusercontent.com,
                                          store analysis                npm registry, PyPI
          <──────────────────   report (+ file list if graph missing)

Web Worker (browser)
  fetch source files (raw.githubusercontent.com, pinned to SHA, concurrency 8)
  parse imports -> buildGraph()
POST /api/graph    ──────────>  validate, store graph JSON
GET  /api/graph/:analysisId ->  cached graph on later visits
```
Why this split: scoring needs trusted GitHub metadata and must be consistent for the badge, so it runs on the server. Graph building parses many files and is CPU-heavy, so it runs in a browser web worker and is stored for later visitors.

## 3. Core contracts (TypeScript)
These are the source of truth. Put them in `packages/core/src/types.ts`.

```ts
export type CategoryId =
  | 'activity' | 'maintenance' | 'community'
  | 'documentation' | 'hygiene' | 'dependencies';

export type Grade = 'excellent' | 'good' | 'needs-work' | 'at-risk';
export type SignalStatus = 'pass' | 'partial' | 'fail' | 'na' | 'no_data';
export type Effort = 'S' | 'M' | 'L';

export interface FileNode {
  path: string;            // posix, relative to repo root
  size: number;            // bytes
  language: string | null; // from extension map in core
  isTest: boolean;
}

export interface RepoMeta {
  owner: string; name: string; defaultBranch: string;
  description: string | null; topics: string[]; homepage: string | null;
  license: string | null; stars: number; hasWiki: boolean; archived: boolean;
}

/** Normalized input to scoring. Built by a RepoDataSource. Pure data. */
export interface RepoSnapshot {
  meta: RepoMeta;
  commitSha: string;
  now: string;                         // ISO, injected, never Date.now() in scoring
  tree: FileNode[];
  readme: string | null;
  commits: { date: string; authorLogin: string | null }[];      // newest first, last 365 days, max 500
  issues: { number: number; author: string | null; createdAt: string; updatedAt: string;
            state: 'open' | 'closed'; firstResponseAt: string | null }[];
  pulls:  { number: number; author: string | null; createdAt: string; closedAt: string | null;
            merged: boolean; firstResponseAt: string | null }[];
  releases: { publishedAt: string }[];                           // releases and tags, last 365 days
  sampledSources: { path: string; content: string }[];           // up to 40 files for comment density
  manifests: ManifestInfo[];
  registry: Record<string, { latest: string; deprecated: boolean }>; // key: "npm:name" or "pypi:name"
}

export interface ManifestInfo {
  ecosystem: 'npm' | 'pypi';
  path: string;
  dependencies: Record<string, string>;   // name -> declared range
  devDependencies: Record<string, string>;
  hasLockfile: boolean;
}

export interface SignalResult {
  id: string;               // e.g. "activity.commits_90d"
  categoryId: CategoryId;
  label: string;
  earned: number;           // points before category normalization
  max: number;
  status: SignalStatus;
  evidence: string;         // one plain sentence, shown to the user
}

export interface CategoryResult {
  id: CategoryId; label: string;
  weight: number;           // 20, 20, 15, 20, 15, 10
  earned: number;           // normalized points out of weight (or excluded)
  excluded: boolean;
  signals: SignalResult[];
}

export interface Fix {
  id: string; signalId: string; title: string;
  why: string; how: string;
  pointsGain: number;       // real score points after normalization
  effort: Effort;
  priority: number;         // pointsGain / effortWeight
}

export interface AnalysisReport {
  repo: RepoMeta;
  commitSha: string;
  score: number;            // 0-100 integer
  grade: Grade;
  categories: CategoryResult[];
  fixes: Fix[];             // sorted by priority desc
  projectedScore: number;
  analyzedAt: string;
  coreVersion: string;
}

export interface GraphNode {
  id: string;               // file path
  folder: string;           // parent folder path
  language: string;
  size: number;             // bytes
  fanIn: number; fanOut: number;
  isTest: boolean;
}
export interface GraphEdge { source: string; target: string; kind: 'static' | 'dynamic'; }

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  externals?: { name: string; importedBy: number }[];
  stats: {
    nodeCount: number; edgeCount: number; unresolvedCount: number;
    cycles: string[][];             // each cycle is a list of file paths
    orphans: string[];
    topFanIn: { id: string; count: number }[];   // top 10
    topFanOut: { id: string; count: number }[];  // top 10
  };
  truncated: boolean;       // true if file cap was hit
  collapsedToFolders: boolean;
}

/** Everything the scorer and graph builder need from the outside world. */
export interface RepoDataSource {
  getSnapshot(): Promise<RepoSnapshot>;
  getFile(path: string): Promise<string | null>;
}
```

## 4. Core public API
```ts
scoreSnapshot(snapshot: RepoSnapshot): AnalysisReport        // pure, deterministic
buildGraph(files: FileNode[], read: (p: string) => Promise<string | null>,
           opts?: { maxFiles?: number; concurrency?: number }): Promise<GraphData>
buildHierarchy(files: FileNode[]): MapNode                    // for the Repo Map
parseImports(path: string, source: string): RawImport[]
resolveImports(raw: RawImport[], ctx: ResolveContext): { edges: GraphEdge[]; unresolved: number }
```
`MapNode` is `{ name, path, size, language?, isTest?, children?: MapNode[] }` where folder `size` is the sum of descendants.

## 5. Caching
- Analysis cache key: `(repo_id, commit_sha)`. Unique constraint in the database.
- Graph cache key: `analysis_id`. Served with immutable cache headers.
- Badge responses cache at the edge for 24 h (`s-maxage=86400, stale-while-revalidate`).
- GitHub calls use ETags where possible; metadata calls within one analysis are batched with GraphQL.

## 6. Error model
`core` throws typed errors: `RepoNotFoundError`, `PrivateRepoError`, `RateLimitError(resetAt)`, `TooLargeError`, `UpstreamError`. The API maps them to codes in `API_SPEC.md`.

## 7. Security notes
- Never `eval`, `new Function` or dynamically import anything derived from a repo.
- Cap fetched file size at 200 KB, skip binaries, minified files (`.min.js`) and vendor folders (`node_modules`, `dist`, `build`, `vendor`, `.next`).
- Validate every request body with Zod. Limit graph payloads to 4 MB and 5,000 nodes.
- Sanitize repo-derived text in the UI. React escaping is the default; never inject raw HTML.
