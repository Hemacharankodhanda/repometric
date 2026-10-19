import { describe, expect, it } from 'vitest';
import { buildHierarchy } from './hierarchy';
import type { FileNode } from './types';

describe('buildHierarchy', () => {
  it('builds a nested MapNode tree with correct descendant sums', () => {
    const files: FileNode[] = [
      { path: 'src/components/Button.tsx', size: 100, language: 'TypeScript', isTest: false },
      { path: 'src/components/Input.tsx', size: 200, language: 'TypeScript', isTest: false },
      { path: 'src/utils/helpers.ts', size: 300, language: 'TypeScript', isTest: false },
      { path: 'README.md', size: 50, language: 'Markdown', isTest: false },
    ];

    const tree = buildHierarchy(files);
    expect(tree.size).toBe(650);
    expect(tree.children?.map((c) => c.name)).toContain('src');
    expect(tree.children?.map((c) => c.name)).toContain('README.md');

    const src = tree.children?.find((c) => c.name === 'src');
    expect(src?.size).toBe(600);

    const components = src?.children?.find((c) => c.name === 'components');
    expect(components?.size).toBe(300);
    expect(components?.children).toHaveLength(2);
  });
});
