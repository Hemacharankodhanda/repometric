import type { FileNode, MapNode } from './types';

export function buildHierarchy(files: FileNode[]): MapNode {
  const root: MapNode = {
    name: 'root',
    path: '',
    size: 0,
    children: [],
  };

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLeaf = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (isLeaf) {
        current.children = current.children ?? [];
        current.children.push({
          name: part,
          path: file.path,
          size: Math.max(1, file.size),
          language: file.language,
          isTest: file.isTest,
        });
      } else {
        current.children = current.children ?? [];
        let folder = current.children.find((c) => c.name === part && c.children !== undefined);
        if (!folder) {
          folder = {
            name: part,
            path: currentPath,
            size: 0,
            children: [],
          };
          current.children.push(folder);
        }
        current = folder;
      }
    }
  }

  // Calculate sizes bottom-up
  function calculateSize(node: MapNode): number {
    if (!node.children || node.children.length === 0) {
      return node.size;
    }
    const sum = node.children.reduce((acc, child) => acc + calculateSize(child), 0);
    node.size = sum;
    return sum;
  }

  calculateSize(root);
  return root;
}
