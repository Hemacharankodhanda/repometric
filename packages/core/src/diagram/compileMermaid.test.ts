import { describe, expect, it } from 'vitest';
import { compileMermaid, escapeMermaidLabel } from './compileMermaid';
import { buildDiagramSpec } from './buildDiagramSpec';
import {
  hostileFiles,
  monorepoFiles,
  monorepoGraph,
  nextjsFiles,
  nextjsGraph,
  noGraphFiles,
  pythonCycleFiles,
  pythonCycleGraph,
} from '../../test/fixtures/diagram/fixtures';
import type { ThemeColors } from './types';

const mockCtx = {
  owner: 'repometric',
  repo: 'test-repo',
  sha: '1234567890abcdef',
};

const mockTheme: ThemeColors = {
  paper: '#E9EEF0',
  surface: '#F5F8F9',
  fog: '#C9D3D8',
  ink: '#14213D',
  inkMuted: '#4A5872',
  teal: '#2A7F87',
  danger: '#D6352F',
  moss: '#5E8C4A',
};

describe('compileMermaid', () => {
  it('strictly escapes labels, removing brackets, quotes, and HTML tags', () => {
    expect(escapeMermaidLabel('<script>alert("hack")</script>')).toBe('alert hack');
    expect(escapeMermaidLabel('["evil_brackets"]')).toBe('evil_brackets');
    expect(escapeMermaidLabel('`backticks`|pipes|')).toBe('backticks pipes');
    expect(escapeMermaidLabel('a'.repeat(60))).toHaveLength(40);
  });

  it('compiles monorepo fixture to valid Mermaid diagram with nodeMap', () => {
    const spec = buildDiagramSpec(monorepoFiles, monorepoGraph);
    const result = compileMermaid(spec, mockCtx, mockTheme);

    expect(result.mermaid).toContain('flowchart TD');
    expect(result.mermaid).toContain('subgraph Client["Client"]');
    expect(result.mermaid).toContain('subgraph Core["Core"]');
    expect(result.mermaid).toContain('subgraph External["External"]');

    // NodeMap verification
    const cKeys = Object.keys(result.nodeMap);
    expect(cKeys.length).toBeGreaterThanOrEqual(3);
    const webNode = Object.values(result.nodeMap).find((n) => n.path === 'apps/web');
    expect(webNode).toBeDefined();
    expect(webNode?.url).toContain('https://github.com/repometric/test-repo/tree/1234567890abcdef/apps/web');
  });

  it('compiles nextjs fixture with subgraphs and database external', () => {
    const spec = buildDiagramSpec(nextjsFiles, nextjsGraph);
    const result = compileMermaid(spec, mockCtx, mockTheme);

    expect(result.mermaid).toContain('subgraph Client["Client"]');
    expect(result.mermaid).toContain('subgraph Core["Core"]');
    expect(result.mermaid).toContain('subgraph External["External"]');
    expect(result.mermaid).toContain('Supabase');
  });

  it('compiles python-cycle fixture with linkStyle for cyclic edges', () => {
    const spec = buildDiagramSpec(pythonCycleFiles, pythonCycleGraph);
    const result = compileMermaid(spec, mockCtx, mockTheme);

    // Cyclic edge linkStyle should be present
    expect(result.mermaid).toContain('linkStyle');
    expect(result.mermaid).toContain('stroke-dasharray: 5 5');
    expect(result.mermaid).toContain(mockTheme.danger);
  });

  it('compiles no-graph fixture with components only', () => {
    const spec = buildDiagramSpec(noGraphFiles, null);
    const result = compileMermaid(spec, mockCtx, mockTheme);

    expect(result.mermaid).toContain('flowchart TD');
    expect(result.mermaid).not.toContain('-->');
    expect(result.mermaid).not.toContain('subgraph External');
  });

  it('SECURITY: hostile fixture contains no dangerous raw characters and no click directives', () => {
    const spec = buildDiagramSpec(hostileFiles, null);
    const result = compileMermaid(spec, mockCtx, mockTheme);

    // No raw unescaped script tag or execution syntax
    expect(result.mermaid).not.toContain('<script>');
    expect(result.mermaid).not.toContain('</script>');
    expect(result.mermaid).not.toContain('["evil_brackets"]');
    expect(result.mermaid).not.toContain('`');
    // Must never contain Mermaid click directives per spec
    expect(result.mermaid).not.toContain('click ');
  });

  it('only labels edges with weight when weight >= 5', () => {
    const spec = {
      components: [
        { id: 'c0', label: 'compA', path: 'src/a', fileCount: 1, layer: 'client' as const },
        { id: 'c1', label: 'compB', path: 'src/b', fileCount: 1, layer: 'server' as const },
        { id: 'c2', label: 'compC', path: 'src/c', fileCount: 1, layer: 'core' as const },
      ],
      externals: [],
      edges: [
        { from: 'c0', to: 'c1', weight: 8, cyclic: false },
        { from: 'c1', to: 'c2', weight: 3, cyclic: false },
      ],
      externalEdges: [],
      notes: [],
    };

    const result = compileMermaid(spec, mockCtx);
    expect(result.mermaid).toContain('c0 -->|8| c1');
    expect(result.mermaid).toContain('c1 --> c2');
    expect(result.mermaid).not.toContain('-->|3|');
  });

  it('maintains strict subgraph layer ordering: Client, Server, Core, Data, Shared, Other, External', () => {
    const spec = {
      components: [
        { id: 'c0', label: 'otherC', path: 'other', fileCount: 1, layer: 'other' as const },
        { id: 'c1', label: 'clientC', path: 'client', fileCount: 1, layer: 'client' as const },
        { id: 'c2', label: 'serverC', path: 'server', fileCount: 1, layer: 'server' as const },
      ],
      externals: [{ id: 'e0', label: 'React', kind: 'library' as const, importedBy: 1 }],
      edges: [],
      externalEdges: [],
      notes: [],
    };

    const result = compileMermaid(spec, mockCtx);
    const clientIdx = result.mermaid.indexOf('subgraph Client');
    const serverIdx = result.mermaid.indexOf('subgraph Server');
    const otherIdx = result.mermaid.indexOf('subgraph Other');
    const extIdx = result.mermaid.indexOf('subgraph External');

    expect(clientIdx).toBeLessThan(serverIdx);
    expect(serverIdx).toBeLessThan(otherIdx);
    expect(otherIdx).toBeLessThan(extIdx);
  });

  it('produces 100% byte-for-byte deterministic output across repeated executions', () => {
    const spec = buildDiagramSpec(monorepoFiles, monorepoGraph);
    const res1 = compileMermaid(spec, mockCtx, mockTheme);
    const res2 = compileMermaid(spec, mockCtx, mockTheme);
    expect(res1.mermaid).toBe(res2.mermaid);
    expect(JSON.stringify(res1.nodeMap)).toBe(JSON.stringify(res2.nodeMap));
  });
});
