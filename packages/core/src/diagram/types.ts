export type LayerId = 'client' | 'server' | 'core' | 'data' | 'shared' | 'other';

export interface DiagramComponent {
  id: string;
  label: string;
  path: string;
  fileCount: number;
  layer: LayerId;
}

export interface DiagramExternal {
  id: string;
  label: string;
  kind: 'database' | 'service' | 'library';
  importedBy: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  weight: number;
  cyclic: boolean;
}

export interface DiagramSpec {
  components: DiagramComponent[];
  externals: DiagramExternal[];
  edges: DiagramEdge[];
  externalEdges: { from: string; to: string; weight: number }[];
  notes: string[];
}

export interface ThemeColors {
  paper: string;
  surface: string;
  fog: string;
  ink: string;
  inkMuted: string;
  teal: string;
  danger: string;
  moss: string;
}

export interface DiagramContext {
  owner: string;
  repo: string;
  sha: string;
}

export interface DiagramNodeMeta {
  kind: 'component' | 'external';
  path?: string;
  url?: string;
  label?: string;
}

export interface CompiledDiagram {
  mermaid: string;
  nodeMap: Record<string, DiagramNodeMeta>;
}
