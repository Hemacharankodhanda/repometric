import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { mockFiles, mockGraph } from '@repometric/core';

describe('ArchitectureDiagram', () => {
  it('renders ArchitectureDiagram with toolbar, view toggle, and exports', () => {
    const html = renderToString(
      <ArchitectureDiagram
        files={mockFiles}
        graph={mockGraph}
        owner="repometric"
        repo="repometric"
        sha="abcdef123456"
      />
    );

    expect(html).toContain('Diagram');
    expect(html).toContain('View as list');
    expect(html).toContain('Mermaid');
    expect(html).toContain('README');
    expect(html).toContain('SVG');
    expect(html).toContain('PNG');
    expect(html).toContain('Weights:');
    expect(html).toContain('Component');
    expect(html).toContain('External');
  });
});
