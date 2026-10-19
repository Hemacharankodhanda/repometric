import type { RawImport } from './types';

/**
 * Parses Python imports:
 * - import a.b, c.d as e
 * - from a.b import c
 * - from . import x
 * - from ..pkg import y
 * - __import__('name')
 */
export function parsePythonImports(source: string): RawImport[] {
  const results: RawImport[] = [];
  const seen = new Set<string>();

  // Remove block comments/docstrings to prevent false positives
  const sanitized = source
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '');

  const lines = sanitized.split(/\r?\n/);

  for (const rawLine of lines) {
    // Strip inline comments
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    // 1. from ... import ...
    // Matches: from <pkg> import <anything>
    const fromMatch = line.match(/^from\s+([.\w]+)\s+import\s+/);
    if (fromMatch && fromMatch[1]) {
      const specifier = fromMatch[1].trim();
      if (specifier && !seen.has(specifier)) {
        seen.add(specifier);
        results.push({ specifier, kind: 'static' });
      }
      continue;
    }

    // 2. import a, b as c, d.e
    const importMatch = line.match(/^import\s+(.+)$/);
    if (importMatch && importMatch[1]) {
      const modules = importMatch[1].split(',');
      for (const mod of modules) {
        const parts = mod.trim().split(/\s+as\s+/);
        const specifier = parts[0]?.trim();
        if (specifier && !seen.has(specifier)) {
          seen.add(specifier);
          results.push({ specifier, kind: 'static' });
        }
      }
      continue;
    }

    // 3. Dynamic: __import__('...')
    const dynamicMatch = line.match(/__import__\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (dynamicMatch && dynamicMatch[1]) {
      const specifier = dynamicMatch[1].trim();
      if (specifier && !seen.has(specifier)) {
        seen.add(specifier);
        results.push({ specifier, kind: 'dynamic' });
      }
    }
  }

  return results;
}
