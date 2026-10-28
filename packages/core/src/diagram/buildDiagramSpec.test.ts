import { describe, expect, it } from 'vitest';
import { buildDiagramSpec, determineLayer } from './buildDiagramSpec';
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
import type { FileNode, GraphData } from '../types';

describe('buildDiagramSpec', () => {
  it('correctly discovers monorepo workspace packages as components', () => {
    const spec = buildDiagramSpec(monorepoFiles, monorepoGraph);
    expect(spec.components.length).toBe(3);
    const labels = spec.components.map((c) => c.label);
    expect(labels).toContain('web');
    expect(labels).toContain('core');
    expect(labels).toContain('viz');

    // web is client, core is core, viz is other/client
    const web = spec.components.find((c) => c.label === 'web')!;
    expect(web.layer).toBe('client'); // apps/web contains 'app'
    const core = spec.components.find((c) => c.label === 'core')!;
    expect(core.layer).toBe('core'); // packages/core contains 'core'

    // Externals resolved
    expect(spec.externals.length).toBe(2);
    expect(spec.externals.map((e) => e.label)).toContain('React');
    expect(spec.externals.map((e) => e.label)).toContain('Next.js');

    // Edges present
    expect(spec.edges.length).toBeGreaterThan(0);
  });

  it('correctly categorizes layers by folder name heuristics in Next.js app', () => {
    const spec = buildDiagramSpec(nextjsFiles, nextjsGraph);
    const layerByLabel = new Map(spec.components.map((c) => [c.label, c.layer]));
    expect(layerByLabel.get('app')).toBe('client');
    expect(layerByLabel.get('components')).toBe('client');
    expect(layerByLabel.get('lib')).toBe('core');

    // External @supabase/supabase-js mapped to database
    const supabase = spec.externals.find((e) => e.label === 'Supabase');
    expect(supabase).toBeDefined();
    expect(supabase?.kind).toBe('database');
  });

  it('detects cycles between components and sets cyclic = true', () => {
    const spec = buildDiagramSpec(pythonCycleFiles, pythonCycleGraph);
    // Cycle between services and models
    const cyclicEdges = spec.edges.filter((e) => e.cyclic);
    expect(cyclicEdges.length).toBe(2);
    for (const edge of cyclicEdges) {
      expect(edge.cyclic).toBe(true);
    }
  });

  it('handles null graph gracefully with informational note', () => {
    const spec = buildDiagramSpec(noGraphFiles, null);
    expect(spec.edges).toEqual([]);
    expect(spec.externals).toEqual([]);
    expect(spec.externalEdges).toEqual([]);
    expect(spec.notes).toContain(
      'No dependency data for this repository, so connections are not shown.',
    );
    expect(spec.components.length).toBe(3);
  });

  it('is 100% deterministic: running twice yields identical results', () => {
    const spec1 = buildDiagramSpec(monorepoFiles, monorepoGraph);
    const spec2 = buildDiagramSpec(monorepoFiles, monorepoGraph);
    expect(JSON.stringify(spec1)).toBe(JSON.stringify(spec2));
  });

  it('performs transitive reduction on non-cyclic edges', () => {
    // A -> B (weight 10), B -> C (weight 10), A -> C (weight 1, < 25% of 10)
    const files: FileNode[] = [
      { path: 'src/app/page.tsx', size: 100, language: 'TypeScript', isTest: false },
      { path: 'src/lib/calc.ts', size: 100, language: 'TypeScript', isTest: false },
      { path: 'src/utils/math.ts', size: 100, language: 'TypeScript', isTest: false },
    ];
    const graph: GraphData = {
      nodes: [
        {
          id: 'src/app/page.tsx',
          folder: 'src/app',
          language: 'TypeScript',
          size: 100,
          fanIn: 0,
          fanOut: 2,
          isTest: false,
        },
        {
          id: 'src/lib/calc.ts',
          folder: 'src/lib',
          language: 'TypeScript',
          size: 100,
          fanIn: 1,
          fanOut: 1,
          isTest: false,
        },
        {
          id: 'src/utils/math.ts',
          folder: 'src/utils',
          language: 'TypeScript',
          size: 100,
          fanIn: 2,
          fanOut: 0,
          isTest: false,
        },
      ],
      edges: [
        // 10 imports from app to lib
        ...Array.from({ length: 10 }, () => ({
          source: 'src/app/page.tsx',
          target: 'src/lib/calc.ts',
          kind: 'static' as const,
        })),
        // 10 imports from lib to utils
        ...Array.from({ length: 10 }, () => ({
          source: 'src/lib/calc.ts',
          target: 'src/utils/math.ts',
          kind: 'static' as const,
        })),
        // 1 import from app to utils (transitive bypass with weight 1 < 0.25 * 10)
        {
          source: 'src/app/page.tsx',
          target: 'src/utils/math.ts',
          kind: 'static' as const,
        },
      ],
      stats: {
        nodeCount: 3,
        edgeCount: 21,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [],
      },
      truncated: false,
      collapsedToFolders: false,
    };

    const spec = buildDiagramSpec(files, graph);
    // Find components
    const appComp = spec.components.find((c) => c.label === 'app')!;
    const utilsComp = spec.components.find((c) => c.label === 'utils')!;

    // Direct edge app -> utils should have been reduced away
    const directEdge = spec.edges.find((e) => e.from === appComp.id && e.to === utilsComp.id);
    expect(directEdge).toBeUndefined();
  });

  it('enforces the 25-component cap by merging minor components into other', () => {
    // Generate 30 folders, with module_00 holding 200 files and minor modules holding 1 file each (< 2%)
    const files: FileNode[] = [];
    for (let f = 0; f < 200; f++) {
      files.push({
        path: `src/module_00/file_${f}.ts`,
        size: 100,
        language: 'TypeScript',
        isTest: false,
      });
    }
    for (let i = 1; i < 30; i++) {
      files.push({
        path: `src/module_${String(i).padStart(2, '0')}/index.ts`,
        size: 100 + i * 10,
        language: 'TypeScript',
        isTest: false,
      });
    }

    const spec = buildDiagramSpec(files, null);
    expect(spec.components.length).toBeLessThanOrEqual(25);
    const hasOther = spec.components.some((c) => c.label === 'other');
    expect(hasOther).toBe(true);
  });

  it('enforces the 40-node cap (components + externals) and trims externals first', () => {
    const files: FileNode[] = [];
    for (let i = 0; i < 35; i++) {
      files.push({
        path: `src/mod_${i}/index.ts`,
        size: 200,
        language: 'TypeScript',
        isTest: false,
      });
    }

    const externalsList = [
      { name: 'react', importedBy: 10 },
      { name: 'next', importedBy: 9 },
      { name: 'express', importedBy: 8 },
      { name: 'prisma', importedBy: 7 },
      { name: 'redis', importedBy: 6 },
      { name: 'stripe', importedBy: 5 },
      { name: 'openai', importedBy: 4 },
      { name: 'axios', importedBy: 3 },
    ];

    const graph: GraphData = {
      nodes: files.map((f) => ({
        id: f.path,
        folder: f.path.split('/')[1],
        language: 'TypeScript',
        size: 200,
        fanIn: 0,
        fanOut: 0,
        isTest: false,
      })),
      edges: [],
      externals: externalsList,
      stats: {
        nodeCount: files.length,
        edgeCount: 0,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [],
      },
      truncated: false,
      collapsedToFolders: false,
    };

    const spec = buildDiagramSpec(files, graph);
    expect(spec.components.length + spec.externals.length).toBeLessThanOrEqual(40);
    expect(spec.notes.some((n) => n.includes('40-node cap'))).toBe(true);
  });

  it('sanitizes and identifies hostile fixture paths safely', () => {
    const spec = buildDiagramSpec(hostileFiles, null);
    expect(spec.components.length).toBeGreaterThan(0);
  });

  it('layer assignment tests for all layer categories', () => {
    expect(determineLayer('src/components/common')).toBe('client');
    expect(determineLayer('src/routes/api')).toBe('server');
    expect(determineLayer('src/domain/billing')).toBe('core');
    expect(determineLayer('src/database/schema')).toBe('data');
    expect(determineLayer('src/helpers/string')).toBe('shared');
    expect(determineLayer('src/unknown_folder')).toBe('other');
  });
});
