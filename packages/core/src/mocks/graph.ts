import type { GraphData, GraphNode, GraphEdge } from '../types';

const nodes: GraphNode[] = [
  // Core entries & store
  { id: 'src/main.tsx', folder: 'src', language: 'TypeScript', size: 1120, fanIn: 0, fanOut: 3, isTest: false },
  { id: 'src/App.tsx', folder: 'src', language: 'TypeScript', size: 2450, fanIn: 1, fanOut: 6, isTest: false },
  { id: 'src/store/selectionStore.ts', folder: 'src/store', language: 'TypeScript', size: 3800, fanIn: 6, fanOut: 2, isTest: false },
  { id: 'src/store/themeStore.ts', folder: 'src/store', language: 'TypeScript', size: 1700, fanIn: 4, fanOut: 1, isTest: false },
  { id: 'src/types/index.ts', folder: 'src/types', language: 'TypeScript', size: 1980, fanIn: 12, fanOut: 0, isTest: false },
  { id: 'src/types/models.ts', folder: 'src/types', language: 'TypeScript', size: 3400, fanIn: 9, fanOut: 1, isTest: false },

  // Pages
  { id: 'src/pages/Home.tsx', folder: 'src/pages', language: 'TypeScript', size: 4200, fanIn: 1, fanOut: 5, isTest: false },
  { id: 'src/pages/Report.tsx', folder: 'src/pages', language: 'TypeScript', size: 6100, fanIn: 1, fanOut: 7, isTest: false },
  { id: 'src/pages/Methodology.tsx', folder: 'src/pages', language: 'TypeScript', size: 5400, fanIn: 1, fanOut: 3, isTest: false },

  // Layout components
  { id: 'src/components/layout/Header.tsx', folder: 'src/components/layout', language: 'TypeScript', size: 3200, fanIn: 3, fanOut: 4, isTest: false },
  { id: 'src/components/layout/Footer.tsx', folder: 'src/components/layout', language: 'TypeScript', size: 2100, fanIn: 3, fanOut: 2, isTest: false },
  { id: 'src/components/layout/Sidebar.tsx', folder: 'src/components/layout', language: 'TypeScript', size: 3900, fanIn: 2, fanOut: 4, isTest: false },
  { id: 'src/components/layout/Navigation.tsx', folder: 'src/components/layout', language: 'TypeScript', size: 2700, fanIn: 2, fanOut: 3, isTest: false },

  // Visualizer components
  { id: 'src/components/visualizers/RepoMap.tsx', folder: 'src/components/visualizers', language: 'TypeScript', size: 7800, fanIn: 2, fanOut: 6, isTest: false },
  { id: 'src/components/visualizers/DependencyGraph.tsx', folder: 'src/components/visualizers', language: 'TypeScript', size: 8400, fanIn: 2, fanOut: 6, isTest: false },
  { id: 'src/components/visualizers/Legend.tsx', folder: 'src/components/visualizers', language: 'TypeScript', size: 2600, fanIn: 3, fanOut: 2, isTest: false },
  { id: 'src/components/visualizers/HoverCard.tsx', folder: 'src/components/visualizers', language: 'TypeScript', size: 2800, fanIn: 3, fanOut: 3, isTest: false },
  { id: 'src/components/visualizers/SidePanel.tsx', folder: 'src/components/visualizers', language: 'TypeScript', size: 4600, fanIn: 2, fanOut: 4, isTest: false },
  { id: 'src/components/visualizers/ColorScale.ts', folder: 'src/components/visualizers', language: 'TypeScript', size: 2100, fanIn: 4, fanOut: 1, isTest: false },
  { id: 'src/components/visualizers/LayoutEngine.ts', folder: 'src/components/visualizers', language: 'TypeScript', size: 5400, fanIn: 3, fanOut: 2, isTest: false },

  // UI Components
  { id: 'src/components/ui/Button.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 2850, fanIn: 9, fanOut: 2, isTest: false },
  { id: 'src/components/ui/Input.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 2200, fanIn: 4, fanOut: 1, isTest: false },
  { id: 'src/components/ui/Tabs.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 3100, fanIn: 4, fanOut: 2, isTest: false },
  { id: 'src/components/ui/Dialog.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 3900, fanIn: 2, fanOut: 2, isTest: false },
  { id: 'src/components/ui/Tooltip.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 2400, fanIn: 5, fanOut: 1, isTest: false },
  { id: 'src/components/ui/Popover.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 2800, fanIn: 3, fanOut: 2, isTest: false },
  { id: 'src/components/ui/Badge.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 1400, fanIn: 4, fanOut: 1, isTest: false },
  { id: 'src/components/ui/Card.tsx', folder: 'src/components/ui', language: 'TypeScript', size: 1950, fanIn: 4, fanOut: 1, isTest: false },

  // Hooks
  { id: 'src/hooks/useTheme.ts', folder: 'src/hooks', language: 'TypeScript', size: 1950, fanIn: 4, fanOut: 2, isTest: false },
  { id: 'src/hooks/useDebounce.ts', folder: 'src/hooks', language: 'TypeScript', size: 980, fanIn: 3, fanOut: 0, isTest: false },
  { id: 'src/hooks/useSelection.ts', folder: 'src/hooks', language: 'TypeScript', size: 2400, fanIn: 4, fanOut: 2, isTest: false },
  { id: 'src/hooks/useZoom.ts', folder: 'src/hooks', language: 'TypeScript', size: 3100, fanIn: 3, fanOut: 2, isTest: false },
  { id: 'src/hooks/useKeyboard.ts', folder: 'src/hooks', language: 'TypeScript', size: 2200, fanIn: 2, fanOut: 1, isTest: false },

  // Services
  { id: 'src/services/api.ts', folder: 'src/services', language: 'TypeScript', size: 4800, fanIn: 5, fanOut: 3, isTest: false },
  { id: 'src/services/github.ts', folder: 'src/services', language: 'TypeScript', size: 5900, fanIn: 3, fanOut: 2, isTest: false },
  { id: 'src/services/cache.ts', folder: 'src/services', language: 'TypeScript', size: 2800, fanIn: 2, fanOut: 1, isTest: false },

  // Utils (helpers.ts and format.ts form a cycle)
  { id: 'src/utils/helpers.ts', folder: 'src/utils', language: 'TypeScript', size: 3100, fanIn: 8, fanOut: 4, isTest: false },
  { id: 'src/utils/format.ts', folder: 'src/utils', language: 'TypeScript', size: 2900, fanIn: 7, fanOut: 3, isTest: false },
  { id: 'src/utils/color.ts', folder: 'src/utils', language: 'TypeScript', size: 3400, fanIn: 4, fanOut: 1, isTest: false },
  { id: 'src/utils/math.ts', folder: 'src/utils', language: 'TypeScript', size: 1900, fanIn: 3, fanOut: 0, isTest: false },
  { id: 'src/utils/storage.ts', folder: 'src/utils', language: 'TypeScript', size: 1600, fanIn: 3, fanOut: 0, isTest: false },
  { id: 'src/utils/clamp.ts', folder: 'src/utils', language: 'TypeScript', size: 600, fanIn: 0, fanOut: 0, isTest: false }, // orphan
];

const edges: GraphEdge[] = [
  // App & Entry
  { source: 'src/main.tsx', target: 'src/App.tsx', kind: 'static' },
  { source: 'src/main.tsx', target: 'src/types/index.ts', kind: 'static' },
  { source: 'src/main.tsx', target: 'src/store/themeStore.ts', kind: 'static' },

  { source: 'src/App.tsx', target: 'src/pages/Home.tsx', kind: 'static' },
  { source: 'src/App.tsx', target: 'src/pages/Report.tsx', kind: 'static' },
  { source: 'src/App.tsx', target: 'src/pages/Methodology.tsx', kind: 'static' },
  { source: 'src/App.tsx', target: 'src/components/layout/Header.tsx', kind: 'static' },
  { source: 'src/App.tsx', target: 'src/components/layout/Footer.tsx', kind: 'static' },
  { source: 'src/App.tsx', target: 'src/hooks/useTheme.ts', kind: 'static' },

  // Pages to components & services
  { source: 'src/pages/Home.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },
  { source: 'src/pages/Home.tsx', target: 'src/components/ui/Input.tsx', kind: 'static' },
  { source: 'src/pages/Home.tsx', target: 'src/components/visualizers/RepoMap.tsx', kind: 'dynamic' },
  { source: 'src/pages/Home.tsx', target: 'src/services/api.ts', kind: 'static' },
  { source: 'src/pages/Home.tsx', target: 'src/types/index.ts', kind: 'static' },

  { source: 'src/pages/Report.tsx', target: 'src/components/ui/Tabs.tsx', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/components/ui/Badge.tsx', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/components/visualizers/RepoMap.tsx', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/components/visualizers/DependencyGraph.tsx', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/components/visualizers/SidePanel.tsx', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/services/api.ts', kind: 'static' },
  { source: 'src/pages/Report.tsx', target: 'src/store/selectionStore.ts', kind: 'static' },

  { source: 'src/pages/Methodology.tsx', target: 'src/components/ui/Card.tsx', kind: 'static' },
  { source: 'src/pages/Methodology.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },
  { source: 'src/pages/Methodology.tsx', target: 'src/types/index.ts', kind: 'static' },

  // Layout
  { source: 'src/components/layout/Header.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },
  { source: 'src/components/layout/Header.tsx', target: 'src/components/layout/Navigation.tsx', kind: 'static' },
  { source: 'src/components/layout/Header.tsx', target: 'src/hooks/useTheme.ts', kind: 'static' },

  { source: 'src/components/layout/Footer.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },

  { source: 'src/components/layout/Sidebar.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },
  { source: 'src/components/layout/Sidebar.tsx', target: 'src/components/layout/Navigation.tsx', kind: 'static' },

  { source: 'src/components/layout/Navigation.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },

  // Visualizers
  { source: 'src/components/visualizers/RepoMap.tsx', target: 'src/components/visualizers/Legend.tsx', kind: 'static' },
  { source: 'src/components/visualizers/RepoMap.tsx', target: 'src/components/visualizers/HoverCard.tsx', kind: 'static' },
  { source: 'src/components/visualizers/RepoMap.tsx', target: 'src/components/visualizers/ColorScale.ts', kind: 'static' },
  { source: 'src/components/visualizers/RepoMap.tsx', target: 'src/hooks/useZoom.ts', kind: 'static' },
  { source: 'src/components/visualizers/RepoMap.tsx', target: 'src/utils/helpers.ts', kind: 'static' },

  { source: 'src/components/visualizers/DependencyGraph.tsx', target: 'src/components/visualizers/Legend.tsx', kind: 'static' },
  { source: 'src/components/visualizers/DependencyGraph.tsx', target: 'src/components/visualizers/HoverCard.tsx', kind: 'static' },
  { source: 'src/components/visualizers/DependencyGraph.tsx', target: 'src/components/visualizers/LayoutEngine.ts', kind: 'static' },
  { source: 'src/components/visualizers/DependencyGraph.tsx', target: 'src/components/visualizers/ColorScale.ts', kind: 'static' },
  { source: 'src/components/visualizers/DependencyGraph.tsx', target: 'src/store/selectionStore.ts', kind: 'static' },

  { source: 'src/components/visualizers/Legend.tsx', target: 'src/components/visualizers/ColorScale.ts', kind: 'static' },

  { source: 'src/components/visualizers/HoverCard.tsx', target: 'src/components/ui/Card.tsx', kind: 'static' },
  { source: 'src/components/visualizers/HoverCard.tsx', target: 'src/utils/format.ts', kind: 'static' },

  { source: 'src/components/visualizers/SidePanel.tsx', target: 'src/components/ui/Button.tsx', kind: 'static' },
  { source: 'src/components/visualizers/SidePanel.tsx', target: 'src/components/ui/Tabs.tsx', kind: 'static' },
  { source: 'src/components/visualizers/SidePanel.tsx', target: 'src/utils/format.ts', kind: 'static' },

  { source: 'src/components/visualizers/ColorScale.ts', target: 'src/utils/color.ts', kind: 'static' },
  { source: 'src/components/visualizers/LayoutEngine.ts', target: 'src/utils/math.ts', kind: 'static' },
  { source: 'src/components/visualizers/LayoutEngine.ts', target: 'src/types/models.ts', kind: 'static' },

  // Hooks dependencies
  { source: 'src/hooks/useTheme.ts', target: 'src/store/themeStore.ts', kind: 'static' },
  { source: 'src/hooks/useTheme.ts', target: 'src/utils/storage.ts', kind: 'static' },

  { source: 'src/hooks/useSelection.ts', target: 'src/store/selectionStore.ts', kind: 'static' },
  { source: 'src/hooks/useSelection.ts', target: 'src/types/models.ts', kind: 'static' },

  { source: 'src/hooks/useZoom.ts', target: 'src/utils/math.ts', kind: 'static' },
  { source: 'src/hooks/useZoom.ts', target: 'src/hooks/useDebounce.ts', kind: 'static' },

  { source: 'src/hooks/useKeyboard.ts', target: 'src/hooks/useSelection.ts', kind: 'static' },

  // Services dependencies
  { source: 'src/services/api.ts', target: 'src/services/github.ts', kind: 'static' },
  { source: 'src/services/api.ts', target: 'src/services/cache.ts', kind: 'static' },
  { source: 'src/services/api.ts', target: 'src/types/models.ts', kind: 'static' },

  { source: 'src/services/github.ts', target: 'src/services/cache.ts', kind: 'static' },
  { source: 'src/services/github.ts', target: 'src/types/index.ts', kind: 'static' },

  { source: 'src/services/cache.ts', target: 'src/utils/storage.ts', kind: 'static' },

  // Store dependencies
  { source: 'src/store/selectionStore.ts', target: 'src/types/models.ts', kind: 'static' },
  { source: 'src/store/selectionStore.ts', target: 'src/utils/helpers.ts', kind: 'static' },

  { source: 'src/store/themeStore.ts', target: 'src/utils/storage.ts', kind: 'static' },

  // Cycle: helpers.ts imports format.ts AND format.ts imports helpers.ts!
  { source: 'src/utils/helpers.ts', target: 'src/utils/format.ts', kind: 'static' },
  { source: 'src/utils/helpers.ts', target: 'src/utils/math.ts', kind: 'static' },
  { source: 'src/utils/helpers.ts', target: 'src/types/index.ts', kind: 'static' },
  { source: 'src/utils/helpers.ts', target: 'src/types/models.ts', kind: 'static' },

  { source: 'src/utils/format.ts', target: 'src/utils/helpers.ts', kind: 'static' },
  { source: 'src/utils/format.ts', target: 'src/types/index.ts', kind: 'static' },
  { source: 'src/utils/format.ts', target: 'src/types/models.ts', kind: 'static' },

  { source: 'src/utils/color.ts', target: 'src/types/index.ts', kind: 'static' },
  { source: 'src/types/models.ts', target: 'src/types/index.ts', kind: 'static' },
];

export const mockGraph: GraphData = {
  nodes,
  edges,
  externals: [
    { name: 'react', importedBy: 18 },
    { name: 'd3-hierarchy', importedBy: 2 },
    { name: 'd3-force', importedBy: 2 },
    { name: 'zustand', importedBy: 4 },
  ],
  stats: {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    unresolvedCount: 3,
    cycles: [['src/utils/helpers.ts', 'src/utils/format.ts']],
    orphans: ['src/utils/clamp.ts'],
    topFanIn: [
      { id: 'src/types/index.ts', count: 12 },
      { id: 'src/types/models.ts', count: 9 },
      { id: 'src/components/ui/Button.tsx', count: 9 },
      { id: 'src/utils/helpers.ts', count: 8 },
      { id: 'src/utils/format.ts', count: 7 },
      { id: 'src/store/selectionStore.ts', count: 6 },
      { id: 'src/services/api.ts', count: 5 },
      { id: 'src/components/ui/Tooltip.tsx', count: 5 },
      { id: 'src/components/ui/Input.tsx', count: 4 },
      { id: 'src/components/ui/Tabs.tsx', count: 4 },
    ],
    topFanOut: [
      { id: 'src/pages/Report.tsx', count: 7 },
      { id: 'src/App.tsx', count: 6 },
      { id: 'src/components/visualizers/RepoMap.tsx', count: 6 },
      { id: 'src/components/visualizers/DependencyGraph.tsx', count: 6 },
      { id: 'src/pages/Home.tsx', count: 5 },
      { id: 'src/components/layout/Header.tsx', count: 4 },
      { id: 'src/components/layout/Sidebar.tsx', count: 4 },
      { id: 'src/components/visualizers/SidePanel.tsx', count: 4 },
      { id: 'src/utils/helpers.ts', count: 4 },
      { id: 'src/services/api.ts', count: 3 },
    ],
  },
  truncated: false,
  collapsedToFolders: false,
};
