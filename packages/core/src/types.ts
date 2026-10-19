export type CategoryId =
  | 'activity'
  | 'maintenance'
  | 'community'
  | 'documentation'
  | 'hygiene'
  | 'dependencies';

export type Grade = 'excellent' | 'good' | 'needs-work' | 'at-risk';
export type SignalStatus = 'pass' | 'partial' | 'fail' | 'na' | 'no_data';
export type Effort = 'S' | 'M' | 'L';

export interface FileNode {
  path: string; // posix, relative to repo root
  size: number; // bytes
  language: string | null; // from extension map in core
  isTest: boolean;
}

export interface RepoMeta {
  owner: string;
  name: string;
  defaultBranch: string;
  description: string | null;
  topics: string[];
  homepage: string | null;
  license: string | null;
  stars: number;
  hasWiki: boolean;
  archived: boolean;
}

/** Normalized input to scoring. Built by a RepoDataSource. Pure data. */
export interface RepoSnapshot {
  meta: RepoMeta;
  commitSha: string;
  now: string; // ISO, injected, never Date.now() in scoring
  tree: FileNode[];
  readme: string | null;
  commits: { date: string; authorLogin: string | null }[]; // newest first, last 365 days, max 500
  issues: {
    number: number;
    author: string | null;
    createdAt: string;
    updatedAt: string;
    state: 'open' | 'closed';
    firstResponseAt: string | null;
  }[];
  pulls: {
    number: number;
    author: string | null;
    createdAt: string;
    closedAt: string | null;
    merged: boolean;
    firstResponseAt: string | null;
  }[];
  releases: { publishedAt: string }[]; // releases and tags, last 365 days
  sampledSources: { path: string; content: string }[]; // up to 40 files for comment density
  manifests: ManifestInfo[];
  registry: Record<string, { latest: string; deprecated: boolean }>; // key: "npm:name" or "pypi:name"
}

export interface ManifestInfo {
  ecosystem: 'npm' | 'pypi';
  path: string;
  dependencies: Record<string, string>; // name -> declared range
  devDependencies: Record<string, string>;
  hasLockfile: boolean;
}

export interface SignalResult {
  id: string; // e.g. "activity.commits_90d"
  categoryId: CategoryId;
  label: string;
  earned: number; // points before category normalization
  max: number;
  status: SignalStatus;
  evidence: string; // one plain sentence, shown to the user
}

export interface CategoryResult {
  id: CategoryId;
  label: string;
  weight: number; // 20, 20, 15, 20, 15, 10
  earned: number; // normalized points out of weight (or excluded)
  excluded: boolean;
  signals: SignalResult[];
}

export interface Fix {
  id: string;
  signalId: string;
  title: string;
  why: string;
  how: string;
  pointsGain: number; // real score points after normalization
  effort: Effort;
  priority: number; // pointsGain / effortWeight
}

export interface AnalysisReport {
  repo: RepoMeta;
  commitSha: string;
  score: number; // 0-100 integer
  grade: Grade;
  categories: CategoryResult[];
  fixes: Fix[]; // sorted by priority desc
  projectedScore: number;
  analyzedAt: string;
  coreVersion: string;
}

export interface GraphNode {
  id: string; // file path
  folder: string; // parent folder path
  language: string;
  size: number; // bytes
  fanIn: number;
  fanOut: number;
  isTest: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind: 'static' | 'dynamic';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  externals?: { name: string; importedBy: number }[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    unresolvedCount: number;
    cycles: string[][]; // each cycle is a list of file paths
    orphans: string[];
    topFanIn: { id: string; count: number }[]; // top 10
    topFanOut: { id: string; count: number }[]; // top 10
  };
  truncated: boolean; // true if file cap was hit
  collapsedToFolders: boolean;
}

export interface MapNode {
  name: string;
  path: string;
  size: number;
  language?: string | null;
  isTest?: boolean;
  children?: MapNode[];
}

/** Everything the scorer and graph builder need from the outside world. */
export interface RepoDataSource {
  getSnapshot(): Promise<RepoSnapshot>;
  getFile(path: string): Promise<string | null>;
}
