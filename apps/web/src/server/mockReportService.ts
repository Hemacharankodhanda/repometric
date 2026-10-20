import type { AnalysisReport, FileNode, GraphData } from '@repometric/core';
import { mockReport } from '@repometric/core';

export interface MockRepoData {
  report: AnalysisReport;
  files: FileNode[];
  graph: GraphData;
}

const PRESET_REPOS: Record<
  string,
  { score: number; grade: 'excellent' | 'good' | 'needs-work' | 'at-risk'; projected: number }
> = {
  'facebook/react': { score: 68, grade: 'needs-work', projected: 86 },
  'expressjs/express': { score: 82, grade: 'good', projected: 92 },
  'tailwindlabs/tailwindcss': { score: 94, grade: 'excellent', projected: 98 },
  'pallets/flask': { score: 88, grade: 'good', projected: 95 },
  'shadcn-ui/ui': { score: 91, grade: 'excellent', projected: 97 },
  'astral-sh/uv': { score: 96, grade: 'excellent', projected: 100 },
};

function generateFlaskMock(): { files: FileNode[]; graph: GraphData } {
  const pyFiles = [
    { path: 'src/flask/__init__.py', size: 1240, fanIn: 8, fanOut: 12 },
    { path: 'src/flask/app.py', size: 54200, fanIn: 14, fanOut: 16 },
    { path: 'src/flask/blueprints.py', size: 18400, fanIn: 4, fanOut: 6 },
    { path: 'src/flask/cli.py', size: 24300, fanIn: 2, fanOut: 8 },
    { path: 'src/flask/config.py', size: 9800, fanIn: 5, fanOut: 2 },
    { path: 'src/flask/ctx.py', size: 12600, fanIn: 6, fanOut: 5 },
    { path: 'src/flask/globals.py', size: 2100, fanIn: 12, fanOut: 2 },
    { path: 'src/flask/helpers.py', size: 28900, fanIn: 7, fanOut: 8 },
    { path: 'src/flask/json/__init__.py', size: 3400, fanIn: 3, fanOut: 4 },
    { path: 'src/flask/json/provider.py', size: 7600, fanIn: 2, fanOut: 3 },
    { path: 'src/flask/logging.py', size: 2900, fanIn: 2, fanOut: 1 },
    { path: 'src/flask/scaffold.py', size: 22400, fanIn: 5, fanOut: 6 },
    { path: 'src/flask/sessions.py', size: 13500, fanIn: 4, fanOut: 4 },
    { path: 'src/flask/signals.py', size: 3100, fanIn: 5, fanOut: 2 },
    { path: 'src/flask/templating.py', size: 6800, fanIn: 3, fanOut: 5 },
    { path: 'src/flask/testing.py', size: 8400, fanIn: 2, fanOut: 4 },
    { path: 'src/flask/typing.py', size: 1900, fanIn: 8, fanOut: 1 },
    { path: 'src/flask/views.py', size: 5200, fanIn: 3, fanOut: 3 },
    { path: 'src/flask/wrappers.py', size: 4800, fanIn: 6, fanOut: 3 },
  ];

  const testFiles = [
    { path: 'tests/conftest.py', size: 3200 },
    { path: 'tests/test_basic.py', size: 14800 },
    { path: 'tests/test_blueprints.py', size: 11200 },
    { path: 'tests/test_cli.py', size: 19500 },
    { path: 'tests/test_config.py', size: 8700 },
    { path: 'tests/test_helpers.py', size: 10400 },
    { path: 'tests/test_templating.py', size: 9100 },
    { path: 'tests/test_views.py', size: 6400 },
  ];

  const docFiles = [
    { path: 'docs/conf.py', size: 4100, language: 'Python' },
    { path: 'docs/index.rst', size: 6500, language: 'reStructuredText' },
    { path: 'docs/quickstart.rst', size: 12400, language: 'reStructuredText' },
    { path: 'docs/tutorial.rst', size: 18200, language: 'reStructuredText' },
    { path: 'README.md', size: 3200, language: 'Markdown' },
    { path: 'LICENSE.txt', size: 1500, language: 'Text' },
    { path: 'pyproject.toml', size: 2800, language: 'TOML' },
    { path: '.github/workflows/tests.yml', size: 1900, language: 'YAML' },
    { path: '.github/workflows/publish.yml', size: 1200, language: 'YAML' },
  ];

  const files: FileNode[] = [
    ...pyFiles.map((f) => ({ path: f.path, size: f.size, language: 'Python', isTest: false })),
    ...testFiles.map((f) => ({ path: f.path, size: f.size, language: 'Python', isTest: true })),
    ...docFiles.map((f) => ({ path: f.path, size: f.size, language: f.language, isTest: false })),
  ];

  const nodes = pyFiles.map((f) => {
    const parts = f.path.split('/');
    parts.pop();
    const folder = parts.join('/');
    return {
      id: f.path,
      folder,
      language: 'Python',
      size: f.size,
      fanIn: f.fanIn,
      fanOut: f.fanOut,
      isTest: false,
    };
  });

  const edges = [
    { source: 'src/flask/app.py', target: 'src/flask/config.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/ctx.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/helpers.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/scaffold.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/sessions.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/signals.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/templating.py', kind: 'static' as const },
    { source: 'src/flask/app.py', target: 'src/flask/wrappers.py', kind: 'static' as const },
    { source: 'src/flask/blueprints.py', target: 'src/flask/scaffold.py', kind: 'static' as const },
    { source: 'src/flask/blueprints.py', target: 'src/flask/helpers.py', kind: 'static' as const },
    { source: 'src/flask/cli.py', target: 'src/flask/app.py', kind: 'static' as const },
    { source: 'src/flask/cli.py', target: 'src/flask/helpers.py', kind: 'static' as const },
    { source: 'src/flask/ctx.py', target: 'src/flask/globals.py', kind: 'static' as const },
    { source: 'src/flask/ctx.py', target: 'src/flask/signals.py', kind: 'static' as const },
    { source: 'src/flask/helpers.py', target: 'src/flask/globals.py', kind: 'static' as const },
    { source: 'src/flask/helpers.py', target: 'src/flask/signals.py', kind: 'static' as const },
    { source: 'src/flask/templating.py', target: 'src/flask/globals.py', kind: 'static' as const },
    { source: 'src/flask/templating.py', target: 'src/flask/signals.py', kind: 'static' as const },
    { source: 'src/flask/views.py', target: 'src/flask/globals.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/app.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/blueprints.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/config.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/ctx.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/globals.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/helpers.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/sessions.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/signals.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/templating.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/views.py', kind: 'static' as const },
    { source: 'src/flask/__init__.py', target: 'src/flask/wrappers.py', kind: 'static' as const },
  ];

  return {
    files,
    graph: {
      nodes,
      edges,
      externals: [
        { name: 'werkzeug', importedBy: 18 },
        { name: 'jinja2', importedBy: 12 },
        { name: 'click', importedBy: 8 },
        { name: 'itsdangerous', importedBy: 4 },
        { name: 'blinker', importedBy: 6 },
      ],
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [],
      },
      truncated: false,
      collapsedToFolders: false,
    },
  };
}

function generateReactMock(): { files: FileNode[]; graph: GraphData } {
  const jsFiles = [
    { path: 'packages/react/index.js', size: 1800, fanIn: 2, fanOut: 8 },
    { path: 'packages/react/src/React.js', size: 8400, fanIn: 6, fanOut: 6 },
    { path: 'packages/react/src/ReactHooks.js', size: 14200, fanIn: 4, fanOut: 3 },
    { path: 'packages/react/src/ReactElement.js', size: 11600, fanIn: 5, fanOut: 2 },
    { path: 'packages/react/src/ReactSharedInternals.js', size: 3200, fanIn: 10, fanOut: 1 },
    { path: 'packages/react-dom/index.js', size: 2100, fanIn: 1, fanOut: 4 },
    { path: 'packages/react-dom/src/client/ReactDOM.js', size: 19400, fanIn: 4, fanOut: 5 },
    { path: 'packages/react-dom/src/client/ReactDOMRoot.js', size: 9800, fanIn: 3, fanOut: 4 },
    { path: 'packages/react-reconciler/src/ReactFiber.js', size: 36200, fanIn: 8, fanOut: 6 },
    { path: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', size: 68400, fanIn: 4, fanOut: 8 },
    { path: 'packages/scheduler/src/Scheduler.js', size: 16800, fanIn: 6, fanOut: 2 },
  ];

  const testFiles = [
    { path: 'packages/react/__tests__/ReactElement-test.js', size: 12400 },
    { path: 'packages/react/__tests__/ReactHooks-test.js', size: 22100 },
    { path: 'packages/react-dom/__tests__/ReactDOM-test.js', size: 18700 },
  ];

  const metaFiles = [
    { path: 'package.json', size: 2400, language: 'JSON' },
    { path: 'README.md', size: 4800, language: 'Markdown' },
    { path: 'LICENSE', size: 1100, language: 'Text' },
    { path: '.github/workflows/runtime.yml', size: 2600, language: 'YAML' },
  ];

  const files: FileNode[] = [
    ...jsFiles.map((f) => ({ path: f.path, size: f.size, language: 'JavaScript', isTest: false })),
    ...testFiles.map((f) => ({ path: f.path, size: f.size, language: 'JavaScript', isTest: true })),
    ...metaFiles.map((f) => ({ path: f.path, size: f.size, language: f.language, isTest: false })),
  ];

  const nodes = jsFiles.map((f) => {
    const parts = f.path.split('/');
    parts.pop();
    const folder = parts.join('/');
    return {
      id: f.path,
      folder,
      language: 'JavaScript',
      size: f.size,
      fanIn: f.fanIn,
      fanOut: f.fanOut,
      isTest: false,
    };
  });

  const edges = [
    { source: 'packages/react/index.js', target: 'packages/react/src/React.js', kind: 'static' as const },
    { source: 'packages/react/src/React.js', target: 'packages/react/src/ReactHooks.js', kind: 'static' as const },
    { source: 'packages/react/src/React.js', target: 'packages/react/src/ReactElement.js', kind: 'static' as const },
    { source: 'packages/react/src/ReactHooks.js', target: 'packages/react/src/ReactSharedInternals.js', kind: 'static' as const },
    { source: 'packages/react-dom/index.js', target: 'packages/react-dom/src/client/ReactDOM.js', kind: 'static' as const },
    { source: 'packages/react-dom/src/client/ReactDOM.js', target: 'packages/react-dom/src/client/ReactDOMRoot.js', kind: 'static' as const },
    { source: 'packages/react-dom/src/client/ReactDOMRoot.js', target: 'packages/react-reconciler/src/ReactFiber.js', kind: 'static' as const },
    { source: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', target: 'packages/react-reconciler/src/ReactFiber.js', kind: 'static' as const },
    { source: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', target: 'packages/scheduler/src/Scheduler.js', kind: 'static' as const },
  ];

  return {
    files,
    graph: {
      nodes,
      edges,
      externals: [],
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [],
      },
      truncated: false,
      collapsedToFolders: false,
    },
  };
}

function generateGenericMock(owner: string, repo: string): { files: FileNode[]; graph: GraphData } {
  const tsFiles = [
    { path: 'src/index.ts', size: 1400, fanIn: 0, fanOut: 4 },
    { path: `src/core/${repo}.ts`, size: 18200, fanIn: 4, fanOut: 3 },
    { path: 'src/core/config.ts', size: 4800, fanIn: 3, fanOut: 1 },
    { path: 'src/utils/helpers.ts', size: 6200, fanIn: 4, fanOut: 1 },
    { path: 'src/api/client.ts', size: 9400, fanIn: 2, fanOut: 2 },
    { path: 'src/types.ts', size: 3600, fanIn: 6, fanOut: 0 },
  ];

  const files: FileNode[] = [
    ...tsFiles.map((f) => ({ path: f.path, size: f.size, language: 'TypeScript', isTest: false })),
    { path: `tests/${repo}.test.ts`, size: 8400, language: 'TypeScript', isTest: true },
    { path: 'package.json', size: 1200, language: 'JSON', isTest: false },
    { path: 'README.md', size: 2800, language: 'Markdown', isTest: false },
    { path: 'LICENSE', size: 1060, language: 'Text', isTest: false },
    { path: '.github/workflows/ci.yml', size: 1400, language: 'YAML', isTest: false },
  ];

  const nodes = tsFiles.map((f) => {
    const parts = f.path.split('/');
    parts.pop();
    const folder = parts.join('/');
    return {
      id: f.path,
      folder,
      language: 'TypeScript',
      size: f.size,
      fanIn: f.fanIn,
      fanOut: f.fanOut,
      isTest: false,
    };
  });

  const edges = [
    { source: 'src/index.ts', target: `src/core/${repo}.ts`, kind: 'static' as const },
    { source: 'src/index.ts', target: 'src/core/config.ts', kind: 'static' as const },
    { source: `src/core/${repo}.ts`, target: 'src/utils/helpers.ts', kind: 'static' as const },
    { source: `src/core/${repo}.ts`, target: 'src/types.ts', kind: 'static' as const },
    { source: 'src/api/client.ts', target: 'src/types.ts', kind: 'static' as const },
    { source: 'src/api/client.ts', target: 'src/utils/helpers.ts', kind: 'static' as const },
  ];

  return {
    files,
    graph: {
      nodes,
      edges,
      externals: [{ name: `${owner}-core`, importedBy: 2 }],
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [],
      },
      truncated: false,
      collapsedToFolders: false,
    },
  };
}

export function getMockAnalysis(owner: string, repo: string): MockRepoData {
  const repoKey = `${owner}/${repo}`.toLowerCase();
  const preset = PRESET_REPOS[repoKey];

  // Base clone of mockReport
  const base = JSON.parse(JSON.stringify(mockReport)) as AnalysisReport;
  base.repo.owner = owner;
  base.repo.name = repo;
  base.repo.description = `${owner}/${repo} - Repository analyzed with RepoMetric.`;

  if (preset) {
    base.score = preset.score;
    base.grade = preset.grade;
    base.projectedScore = preset.projected;
  } else {
    // Generate deterministic score from string hash
    let hash = 0;
    for (let i = 0; i < repoKey.length; i++) {
      hash = (hash << 5) - hash + repoKey.charCodeAt(i);
      hash |= 0;
    }
    const derivedScore = 65 + (Math.abs(hash) % 30); // 65 - 94
    base.score = derivedScore;
    base.grade =
      derivedScore >= 90
        ? 'excellent'
        : derivedScore >= 75
          ? 'good'
          : derivedScore >= 55
            ? 'needs-work'
            : 'at-risk';
    base.projectedScore = Math.min(100, derivedScore + 12);
  }

  let generated: { files: FileNode[]; graph: GraphData };
  if (repoKey === 'pallets/flask' || repo.toLowerCase() === 'flask') {
    generated = generateFlaskMock();
  } else if (repoKey === 'facebook/react' || repo.toLowerCase() === 'react') {
    generated = generateReactMock();
  } else {
    generated = generateGenericMock(owner, repo);
  }

  return {
    report: base,
    files: generated.files,
    graph: generated.graph,
  };
}
