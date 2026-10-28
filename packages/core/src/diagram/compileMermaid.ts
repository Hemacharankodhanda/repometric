import type {
  CompiledDiagram,
  DiagramContext,
  DiagramNodeMeta,
  DiagramSpec,
  LayerId,
  ThemeColors,
} from './types';

const LAYER_DISPLAY_NAMES: Record<LayerId, string> = {
  client: 'Client',
  server: 'Server',
  core: 'Core',
  data: 'Data',
  shared: 'Shared',
  other: 'Other',
};

const LAYER_ORDER: LayerId[] = ['client', 'server', 'core', 'data', 'shared', 'other'];

/**
 * Strict escaping function for Mermaid node labels.
 * Strips HTML tags, removes problematic punctuation (" ' [ ] ( ) { } < > ` | \),
 * collapses whitespace, and strictly truncates to 40 characters.
 */
export function escapeMermaidLabel(text: string): string {
  let clean = text
    .replace(/<[^>]*>/g, '') // strip html/xml tags like <script>
    .replace(/["'`[\](){}<>|\\]/g, ' ') // replace dangerous symbols with spaces
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();

  if (clean.length > 40) {
    clean = clean.slice(0, 37) + '...';
  }
  return clean || 'unnamed';
}

/**
 * Compiles a DiagramSpec into a deterministic Mermaid flowchart TD string and metadata nodeMap.
 * Security: Strict label escaping, synthetic IDs, no Mermaid click directives.
 */
export function compileMermaid(
  spec: DiagramSpec,
  ctx: DiagramContext,
  theme?: ThemeColors,
): CompiledDiagram {
  const lines: string[] = ['flowchart TD'];
  const nodeMap: Record<string, DiagramNodeMeta> = {};

  // 1. Group components by layer
  const componentsByLayer = new Map<LayerId, typeof spec.components>();
  for (const layer of LAYER_ORDER) {
    componentsByLayer.set(layer, []);
  }

  for (const comp of spec.components) {
    const list = componentsByLayer.get(comp.layer) || componentsByLayer.get('other')!;
    list.push(comp);

    const safePath = comp.path === '.' ? '' : comp.path;
    const url = `https://github.com/${ctx.owner}/${ctx.repo}/tree/${ctx.sha}/${encodeURI(safePath)}`;

    nodeMap[comp.id] = {
      kind: 'component',
      path: comp.path,
      label: comp.label,
      url,
    };
  }

  // 2. Generate Subgraphs for each non-empty layer in strict order
  for (const layer of LAYER_ORDER) {
    const comps = componentsByLayer.get(layer) || [];
    if (comps.length === 0) continue;

    const layerName = LAYER_DISPLAY_NAMES[layer];
    lines.push(`  subgraph ${layerName}["${layerName}"]`);

    for (const c of comps) {
      const safeLabel = escapeMermaidLabel(c.label);
      const fileText = c.fileCount === 1 ? '1 file' : `${c.fileCount} files`;
      lines.push(`    ${c.id}["${safeLabel} (${fileText})"]`);
    }

    lines.push('  end');
  }

  // 3. Subgraph for Externals if present
  if (spec.externals && spec.externals.length > 0) {
    lines.push('  subgraph External["External"]');
    for (const ext of spec.externals) {
      const safeLabel = escapeMermaidLabel(ext.label);
      lines.push(`    ${ext.id}["${safeLabel}"]`);

      nodeMap[ext.id] = {
        kind: 'external',
        label: ext.label,
      };
    }
    lines.push('  end');
  }

  // 4. Edges (Component-to-Component & Component-to-External)
  let edgeIndex = 0;
  const cyclicEdgeIndices: number[] = [];

  // Internal edges
  if (spec.edges && spec.edges.length > 0) {
    for (const edge of spec.edges) {
      if (edge.cyclic) {
        cyclicEdgeIndices.push(edgeIndex);
      }
      edgeIndex++;

      if (edge.weight >= 5) {
        lines.push(`  ${edge.from} -->|${edge.weight}| ${edge.to}`);
      } else {
        lines.push(`  ${edge.from} --> ${edge.to}`);
      }
    }
  }

  // External edges
  if (spec.externalEdges && spec.externalEdges.length > 0) {
    for (const extEdge of spec.externalEdges) {
      edgeIndex++;
      if (extEdge.weight >= 5) {
        lines.push(`  ${extEdge.from} -->|${extEdge.weight}| ${extEdge.to}`);
      } else {
        lines.push(`  ${extEdge.from} --> ${extEdge.to}`);
      }
    }
  }

  // 5. Cyclic edge styling via linkStyle
  const dangerColor = theme?.danger || '#D6352F';
  for (const idx of cyclicEdgeIndices) {
    lines.push(
      `  linkStyle ${idx} stroke:${dangerColor},stroke-width:2.5px,stroke-dasharray: 5 5;`,
    );
  }

  // 6. Layer ClassDef and Class assignments
  if (theme) {
    for (const layer of LAYER_ORDER) {
      const comps = componentsByLayer.get(layer) || [];
      if (comps.length === 0) continue;

      const className = `${layer}Layer`;
      lines.push(
        `  classDef ${className} fill:${theme.fog},stroke:${theme.ink},stroke-width:1.5px,color:${theme.ink};`,
      );
      lines.push(`  class ${comps.map((c) => c.id).join(',')} ${className};`);
    }

    if (spec.externals && spec.externals.length > 0) {
      lines.push(
        `  classDef externalNode fill:${theme.surface},stroke:${theme.teal},stroke-width:2px,color:${theme.ink};`,
      );
      lines.push(`  class ${spec.externals.map((e) => e.id).join(',')} externalNode;`);
    }
  }

  return {
    mermaid: lines.join('\n') + '\n',
    nodeMap,
  };
}
