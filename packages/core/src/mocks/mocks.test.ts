import { describe, expect, it } from 'vitest';
import { mockReport, mockFiles, mockGraph } from '../index';

describe('mock fixtures (T1.1)', () => {
  it('validates mock AnalysisReport structure and priority sorting', () => {
    expect(mockReport.score).toBe(68);
    expect(mockReport.grade).toBe('needs-work');
    expect(mockReport.categories).toHaveLength(6);
    expect(mockReport.fixes).toHaveLength(6);

    // Verify fixes are sorted by priority descending
    for (let i = 0; i < mockReport.fixes.length - 1; i++) {
      const current = mockReport.fixes[i]!;
      const next = mockReport.fixes[i + 1]!;
      expect(current.priority).toBeGreaterThanOrEqual(next.priority);
    }
  });

  it('validates mock FileNode[] has ~150 files', () => {
    expect(mockFiles.length).toBeGreaterThan(120);
    expect(mockFiles.length).toBeLessThan(180);
    const hasTests = mockFiles.some((f) => f.isTest);
    const hasSource = mockFiles.some((f) => !f.isTest);
    expect(hasTests).toBe(true);
    expect(hasSource).toBe(true);
  });

  it('validates mock GraphData has ~40 nodes, ~70 edges, and one cycle', () => {
    expect(mockGraph.nodes.length).toBeGreaterThanOrEqual(35);
    expect(mockGraph.nodes.length).toBeLessThanOrEqual(50);
    expect(mockGraph.edges.length).toBeGreaterThanOrEqual(60);
    expect(mockGraph.edges.length).toBeLessThanOrEqual(80);
    expect(mockGraph.stats.cycles).toHaveLength(1);
    expect(mockGraph.stats.cycles[0]).toEqual(['src/utils/helpers.ts', 'src/utils/format.ts']);
  });
});
