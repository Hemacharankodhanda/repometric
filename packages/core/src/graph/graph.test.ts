import { describe, expect, it } from 'vitest';
import { parseJsImports } from './jsParser';
import { parsePythonImports } from './pyParser';
import { resolveJsImport, resolvePythonImport } from './resolver';
import { findCycles } from './tarjan';
import { buildGraphData } from './builder';
import type { FileNode } from '../types';

describe('Dependency Graph (T3.2, T3.3, T3.4)', () => {
  describe('JS/TS Import Parser & Resolver (T3.2)', () => {
    it('parses static, dynamic, re-export, and require imports', async () => {
      const source = `
        import React, { useState } from 'react';
        import { Button } from './components/Button';
        import { Header } from '../layout/Header';
        export { Footer } from './layout/Footer';
        const dynamicMod = import('./dynamic/util');
        const legacy = require('./legacy/helper');
      `;

      const imports = await parseJsImports(source);
      const specifiers = imports.map((i) => i.specifier);

      expect(specifiers).toContain('react');
      expect(specifiers).toContain('./components/Button');
      expect(specifiers).toContain('../layout/Header');
      expect(specifiers).toContain('./layout/Footer');
      expect(specifiers).toContain('./dynamic/util');
      expect(specifiers).toContain('./legacy/helper');

      const dynamicImport = imports.find((i) => i.specifier === './dynamic/util');
      expect(dynamicImport?.kind).toBe('dynamic');
    });

    it('resolves relative, parent, index, and extensionless files', () => {
      const fileSet = new Set([
        'src/components/Button.tsx',
        'src/layout/Header.ts',
        'src/utils/index.js',
        'src/main.ts',
      ]);

      // Relative with extension resolution
      const res1 = resolveJsImport('src/main.ts', './components/Button', fileSet);
      expect(res1.target).toBe('src/components/Button.tsx');
      expect(res1.external).toBeNull();

      // Parent relative
      const res2 = resolveJsImport('src/components/Button.tsx', '../layout/Header', fileSet);
      expect(res2.target).toBe('src/layout/Header.ts');

      // Index resolution
      const res3 = resolveJsImport('src/main.ts', './utils', fileSet);
      expect(res3.target).toBe('src/utils/index.js');

      // External resolution
      const res4 = resolveJsImport('src/main.ts', 'react', fileSet);
      expect(res4.target).toBeNull();
      expect(res4.external).toBe('react');

      // Scoped external
      const res5 = resolveJsImport('src/main.ts', '@repometric/core/utils', fileSet);
      expect(res5.target).toBeNull();
      expect(res5.external).toBe('@repometric/core');
    });

    it('resolves path aliases from tsconfig', () => {
      const fileSet = new Set(['src/components/Button.tsx', 'src/hooks/useTheme.ts']);
      const tsconfig = {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@components/*': ['src/components/*'],
        },
      };

      const res1 = resolveJsImport('src/pages/Home.tsx', '@/components/Button', fileSet, tsconfig);
      expect(res1.target).toBe('src/components/Button.tsx');

      const res2 = resolveJsImport('src/pages/Home.tsx', '@components/Button', fileSet, tsconfig);
      expect(res2.target).toBe('src/components/Button.tsx');
    });
  });

  describe('Python Import Parser & Resolver (T3.3)', () => {
    it('parses absolute, relative, and dynamic imports in Python', () => {
      const pySource = `
        import os, sys as system
        from math import sqrt, pi
        from . import utils
        from ..core.auth import verify_token
        dynamic_mod = __import__('plugins.custom')
      `;

      const imports = parsePythonImports(pySource);
      const specifiers = imports.map((i) => i.specifier);

      expect(specifiers).toContain('os');
      expect(specifiers).toContain('sys');
      expect(specifiers).toContain('math');
      expect(specifiers).toContain('.');
      expect(specifiers).toContain('..core.auth');
      expect(specifiers).toContain('plugins.custom');
    });

    it('resolves relative and top-level package imports in Python', () => {
      const fileSet = new Set([
        'mypkg/__init__.py',
        'mypkg/models.py',
        'mypkg/sub/__init__.py',
        'mypkg/sub/utils.py',
        'src/app.py',
      ]);

      // Relative same dir
      const res1 = resolvePythonImport('mypkg/models.py', '.sub.utils', fileSet);
      expect(res1.target).toBe('mypkg/sub/utils.py');

      // Relative parent dir
      const res2 = resolvePythonImport('mypkg/sub/utils.py', '..models', fileSet);
      expect(res2.target).toBe('mypkg/models.py');

      // Absolute top-level package
      const res3 = resolvePythonImport('src/app.py', 'mypkg.models', fileSet);
      expect(res3.target).toBe('mypkg/models.py');

      // External standard/third-party module
      const res4 = resolvePythonImport('src/app.py', 'numpy.linalg', fileSet);
      expect(res4.target).toBeNull();
      expect(res4.external).toBe('numpy');
    });
  });

  describe('Graph Builder and Cycle Detection (T3.4)', () => {
    it('detects cycles using Tarjan algorithm on known cycle fixture', () => {
      const adj = new Map<string, Set<string>>([
        ['a.ts', new Set(['b.ts'])],
        ['b.ts', new Set(['c.ts'])],
        ['c.ts', new Set(['a.ts'])], // cycle: a -> b -> c -> a
        ['d.ts', new Set(['e.ts'])],
        ['e.ts', new Set()],
      ]);

      const cycles = findCycles(adj);
      expect(cycles.length).toBe(1);
      const cycleNodes = cycles[0].sort();
      expect(cycleNodes).toEqual(['a.ts', 'b.ts', 'c.ts']);
    });

    it('builds full GraphData with nodes, edges, fan-in/fan-out, and orphans', async () => {
      const files: FileNode[] = [
        { path: 'src/main.ts', size: 100, language: 'TypeScript', isTest: false },
        { path: 'src/utils/helpers.ts', size: 200, language: 'TypeScript', isTest: false },
        { path: 'src/utils/format.ts', size: 200, language: 'TypeScript', isTest: false },
        { path: 'src/orphan.ts', size: 50, language: 'TypeScript', isTest: false },
      ];

      const sources = {
        'src/main.ts': "import './utils/helpers';",
        // Cycle between helpers and format
        'src/utils/helpers.ts': "import './format';",
        'src/utils/format.ts': "import './helpers';",
        'src/orphan.ts': '// unused lonely file',
      };

      const graph = await buildGraphData(files, sources);

      expect(graph.nodes.length).toBe(4);
      expect(graph.edges.length).toBe(3);
      expect(graph.stats.cycles.length).toBe(1);
      expect(graph.stats.orphans).toContain('src/orphan.ts');

      const helpersNode = graph.nodes.find((n) => n.id === 'src/utils/helpers.ts');
      expect(helpersNode?.fanIn).toBe(2); // main.ts and format.ts
      expect(helpersNode?.fanOut).toBe(1); // format.ts
    });

    it('collapses nodes to folder level when exceeding collapseThreshold', async () => {
      const files: FileNode[] = [];
      const sources: Record<string, string> = {};

      // Create 2,100 files across 10 folders
      for (let i = 0; i < 2100; i++) {
        const folder = `src/module_${i % 10}`;
        const path = `${folder}/file_${i}.ts`;
        files.push({ path, size: 100, language: 'TypeScript', isTest: false });
        // Import next module's file
        sources[path] = `import '../module_${(i + 1) % 10}/file_${(i + 1) % 2100}';`;
      }

      const graph = await buildGraphData(files, sources, { collapseThreshold: 2000 });

      expect(graph.collapsedToFolders).toBe(true);
      expect(graph.nodes.length).toBeLessThanOrEqual(800);
      expect(graph.nodes.every((n) => n.id.startsWith('src/module_'))).toBe(true);
    });
  });
});
