import type { FileNode, GraphData } from '../../../src/types';

/**
 * 1. Monorepo fixture: apps/web, packages/core, packages/viz
 */
export const monorepoFiles: FileNode[] = [
  { path: 'apps/web/package.json', size: 500, language: 'JSON', isTest: false },
  { path: 'apps/web/src/app/page.tsx', size: 1200, language: 'TypeScript', isTest: false },
  { path: 'apps/web/src/components/Header.tsx', size: 800, language: 'TypeScript', isTest: false },
  { path: 'packages/core/package.json', size: 400, language: 'JSON', isTest: false },
  { path: 'packages/core/src/index.ts', size: 1500, language: 'TypeScript', isTest: false },
  { path: 'packages/core/src/engine.ts', size: 2100, language: 'TypeScript', isTest: false },
  { path: 'packages/viz/package.json', size: 450, language: 'JSON', isTest: false },
  { path: 'packages/viz/src/RepoMap.tsx', size: 3000, language: 'TypeScript', isTest: false },
  {
    path: 'packages/viz/src/DependencyGraph.tsx',
    size: 4000,
    language: 'TypeScript',
    isTest: false,
  },
];

export const monorepoGraph: GraphData = {
  nodes: [
    {
      id: 'apps/web/src/app/page.tsx',
      folder: 'apps/web/src/app',
      language: 'TypeScript',
      size: 1200,
      fanIn: 0,
      fanOut: 2,
      isTest: false,
    },
    {
      id: 'packages/viz/src/RepoMap.tsx',
      folder: 'packages/viz/src',
      language: 'TypeScript',
      size: 3000,
      fanIn: 1,
      fanOut: 1,
      isTest: false,
    },
    {
      id: 'packages/core/src/index.ts',
      folder: 'packages/core/src',
      language: 'TypeScript',
      size: 1500,
      fanIn: 2,
      fanOut: 0,
      isTest: false,
    },
  ],
  edges: [
    { source: 'apps/web/src/app/page.tsx', target: 'packages/viz/src/RepoMap.tsx', kind: 'static' },
    { source: 'apps/web/src/app/page.tsx', target: 'packages/core/src/index.ts', kind: 'static' },
    {
      source: 'packages/viz/src/RepoMap.tsx',
      target: 'packages/core/src/index.ts',
      kind: 'static',
    },
  ],
  externals: [
    { name: 'react', importedBy: 4 },
    { name: 'next', importedBy: 2 },
  ],
  externalEdges: [
    { source: 'apps/web/src/app/page.tsx', target: 'react' },
    { source: 'apps/web/src/app/page.tsx', target: 'next' },
  ],
  stats: {
    nodeCount: 3,
    edgeCount: 3,
    unresolvedCount: 0,
    cycles: [],
    orphans: [],
    topFanIn: [],
    topFanOut: [],
  },
  truncated: false,
  collapsedToFolders: false,
};

/**
 * 2. Next.js app with src/app and src/lib
 */
export const nextjsFiles: FileNode[] = [
  { path: 'package.json', size: 600, language: 'JSON', isTest: false },
  { path: 'src/app/page.tsx', size: 900, language: 'TypeScript', isTest: false },
  { path: 'src/app/layout.tsx', size: 850, language: 'TypeScript', isTest: false },
  { path: 'src/app/api/users/route.ts', size: 1200, language: 'TypeScript', isTest: false },
  { path: 'src/components/Button.tsx', size: 600, language: 'TypeScript', isTest: false },
  { path: 'src/lib/db.ts', size: 1400, language: 'TypeScript', isTest: false },
  { path: 'src/lib/auth.ts', size: 1100, language: 'TypeScript', isTest: false },
];

export const nextjsGraph: GraphData = {
  nodes: [
    {
      id: 'src/app/page.tsx',
      folder: 'src/app',
      language: 'TypeScript',
      size: 900,
      fanIn: 0,
      fanOut: 2,
      isTest: false,
    },
    {
      id: 'src/components/Button.tsx',
      folder: 'src/components',
      language: 'TypeScript',
      size: 600,
      fanIn: 1,
      fanOut: 0,
      isTest: false,
    },
    {
      id: 'src/lib/db.ts',
      folder: 'src/lib',
      language: 'TypeScript',
      size: 1400,
      fanIn: 1,
      fanOut: 0,
      isTest: false,
    },
  ],
  edges: [
    { source: 'src/app/page.tsx', target: 'src/components/Button.tsx', kind: 'static' },
    { source: 'src/app/page.tsx', target: 'src/lib/db.ts', kind: 'static' },
  ],
  externals: [
    { name: '@supabase/supabase-js', importedBy: 1 },
    { name: 'react', importedBy: 2 },
  ],
  externalEdges: [
    { source: 'src/lib/db.ts', target: '@supabase/supabase-js' },
    { source: 'src/components/Button.tsx', target: 'react' },
  ],
  stats: {
    nodeCount: 3,
    edgeCount: 2,
    unresolvedCount: 0,
    cycles: [],
    orphans: [],
    topFanIn: [],
    topFanOut: [],
  },
  truncated: false,
  collapsedToFolders: false,
};

/**
 * 3. Python package with a cycle between services and models
 */
export const pythonCycleFiles: FileNode[] = [
  { path: 'pyproject.toml', size: 400, language: 'TOML', isTest: false },
  { path: 'app/api/views.py', size: 1200, language: 'Python', isTest: false },
  { path: 'app/services/billing.py', size: 1800, language: 'Python', isTest: false },
  { path: 'app/models/user.py', size: 1400, language: 'Python', isTest: false },
];

export const pythonCycleGraph: GraphData = {
  nodes: [
    {
      id: 'app/api/views.py',
      folder: 'app/api',
      language: 'Python',
      size: 1200,
      fanIn: 0,
      fanOut: 1,
      isTest: false,
    },
    {
      id: 'app/services/billing.py',
      folder: 'app/services',
      language: 'Python',
      size: 1800,
      fanIn: 2,
      fanOut: 1,
      isTest: false,
    },
    {
      id: 'app/models/user.py',
      folder: 'app/models',
      language: 'Python',
      size: 1400,
      fanIn: 1,
      fanOut: 1,
      isTest: false,
    },
  ],
  edges: [
    { source: 'app/api/views.py', target: 'app/services/billing.py', kind: 'static' },
    // Cycle between services and models
    { source: 'app/services/billing.py', target: 'app/models/user.py', kind: 'static' },
    { source: 'app/models/user.py', target: 'app/services/billing.py', kind: 'static' },
  ],
  externals: [
    { name: 'fastapi', importedBy: 1 },
    { name: 'sqlalchemy', importedBy: 2 },
  ],
  externalEdges: [
    { source: 'app/api/views.py', target: 'fastapi' },
    { source: 'app/models/user.py', target: 'sqlalchemy' },
  ],
  stats: {
    nodeCount: 3,
    edgeCount: 3,
    unresolvedCount: 0,
    cycles: [['app/services/billing.py', 'app/models/user.py']],
    orphans: [],
    topFanIn: [],
    topFanOut: [],
  },
  truncated: false,
  collapsedToFolders: false,
};

/**
 * 4. Repo with no graph (null)
 */
export const noGraphFiles: FileNode[] = [
  { path: 'src/client/App.tsx', size: 1100, language: 'TypeScript', isTest: false },
  { path: 'src/server/index.ts', size: 2300, language: 'TypeScript', isTest: false },
  { path: 'src/utils/math.ts', size: 400, language: 'TypeScript', isTest: false },
];

/**
 * 5. Hostile fixture with folder names containing quotes, brackets, angle brackets, and <script>
 */
export const hostileFiles: FileNode[] = [
  {
    path: 'src/<script>alert("hack")</script>/attack.ts',
    size: 500,
    language: 'TypeScript',
    isTest: false,
  },
  {
    path: 'src/["evil_brackets"]/evil.ts',
    size: 600,
    language: 'TypeScript',
    isTest: false,
  },
  {
    path: 'src/`backticks`|pipes|/pipe.ts',
    size: 700,
    language: 'TypeScript',
    isTest: false,
  },
];
