import { describe, expect, it } from 'vitest';
import { DependencyGraph } from './DependencyGraph';
import { mockGraph } from '@repometric/core';

describe('DependencyGraph component (T3.5)', () => {
  it('is a defined component and accepts mockGraph data', () => {
    expect(DependencyGraph).toBeDefined();
    expect(mockGraph.nodes.length).toBeGreaterThan(0);
    expect(mockGraph.edges.length).toBeGreaterThan(0);
  });
});
