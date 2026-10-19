import type { TsConfigPaths } from './types';

const JS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

export function posixNormalize(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

export function posixDirname(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return normalized.slice(0, lastSlash);
}

export function posixJoin(...parts: string[]): string {
  return posixNormalize(parts.filter(Boolean).join('/'));
}

/**
 * Tries resolving a candidate file path with extensions or index files.
 */
function tryExtensions(baseCandidate: string, fileSet: Set<string>): string | null {
  if (fileSet.has(baseCandidate)) {
    return baseCandidate;
  }
  for (const ext of JS_EXTENSIONS) {
    const withExt = baseCandidate + ext;
    if (fileSet.has(withExt)) return withExt;
  }
  for (const ext of JS_EXTENSIONS) {
    const withIndex = posixJoin(baseCandidate, `index${ext}`);
    if (fileSet.has(withIndex)) return withIndex;
  }
  return null;
}

/**
 * Resolves a JS/TS specifier to a repository file path or identifies it as external.
 */
export function resolveJsImport(
  fromFile: string,
  specifier: string,
  fileSet: Set<string>,
  tsconfig?: TsConfigPaths,
): { target: string | null; external: string | null } {
  const trimmed = specifier.trim();
  const dir = posixDirname(fromFile);

  // 1. Relative imports (./ or ../)
  if (trimmed.startsWith('./') || trimmed.startsWith('../')) {
    const candidate = posixJoin(dir, trimmed);
    const resolved = tryExtensions(candidate, fileSet);
    if (resolved) {
      return { target: resolved, external: null };
    }
    return { target: null, external: null }; // Unresolved relative
  }

  // 2. Path Aliases in tsconfig.json / jsconfig.json
  if (tsconfig?.paths) {
    const baseUrl = tsconfig.baseUrl || '';
    for (const [pattern, replacements] of Object.entries(tsconfig.paths)) {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (trimmed.startsWith(prefix)) {
          const suffix = trimmed.slice(prefix.length);
          for (const rep of replacements) {
            const repPrefix = rep.endsWith('*') ? rep.slice(0, -1) : rep;
            const candidate = posixJoin(baseUrl, repPrefix + suffix);
            const resolved = tryExtensions(candidate, fileSet);
            if (resolved) {
              return { target: resolved, external: null };
            }
          }
        }
      } else if (trimmed === pattern) {
        for (const rep of replacements) {
          const candidate = posixJoin(baseUrl, rep);
          const resolved = tryExtensions(candidate, fileSet);
          if (resolved) {
            return { target: resolved, external: null };
          }
        }
      }
    }
  }

  // 3. Check if bare specifier matches a root folder or file directly
  const directResolved = tryExtensions(trimmed, fileSet);
  if (directResolved) {
    return { target: directResolved, external: null };
  }

  // 4. Otherwise, it is an external package
  // e.g. "@repometric/core/utils" -> "repometric/core" or "react"
  let extName = trimmed;
  if (trimmed.startsWith('@')) {
    const parts = trimmed.split('/');
    extName = parts.slice(0, 2).join('/');
  } else {
    extName = trimmed.split('/')[0];
  }

  return { target: null, external: extName };
}

/**
 * Resolves a Python specifier to a repository file or external module.
 */
export function resolvePythonImport(
  fromFile: string,
  specifier: string,
  fileSet: Set<string>,
): { target: string | null; external: string | null } {
  const trimmed = specifier.trim();
  const dir = posixDirname(fromFile);

  // 1. Relative imports (. or ..)
  if (trimmed.startsWith('.')) {
    let dotCount = 0;
    while (trimmed[dotCount] === '.') {
      dotCount++;
    }

    const rest = trimmed.slice(dotCount).replace(/\./g, '/');
    let targetDir = dir;

    // 1 dot = same dir, 2 dots = parent, 3 dots = grandparent
    for (let i = 1; i < dotCount; i++) {
      targetDir = posixDirname(targetDir);
    }

    const candidate = rest ? posixJoin(targetDir, rest) : targetDir;

    // Check <candidate>.py
    if (fileSet.has(`${candidate}.py`)) {
      return { target: `${candidate}.py`, external: null };
    }
    // Check <candidate>/__init__.py
    if (fileSet.has(posixJoin(candidate, '__init__.py'))) {
      return { target: posixJoin(candidate, '__init__.py'), external: null };
    }

    return { target: null, external: null };
  }

  // 2. Absolute imports (e.g. "pkg.sub.mod")
  const pathLike = trimmed.replace(/\./g, '/');

  // Try relative to repo root
  if (fileSet.has(`${pathLike}.py`)) {
    return { target: `${pathLike}.py`, external: null };
  }
  if (fileSet.has(posixJoin(pathLike, '__init__.py'))) {
    return { target: posixJoin(pathLike, '__init__.py'), external: null };
  }

  // Try inside src/ (common Python layout)
  if (fileSet.has(`src/${pathLike}.py`)) {
    return { target: `src/${pathLike}.py`, external: null };
  }
  if (fileSet.has(posixJoin('src', pathLike, '__init__.py'))) {
    return { target: posixJoin('src', pathLike, '__init__.py'), external: null };
  }

  // Try relative to current directory
  if (dir) {
    const localCand = posixJoin(dir, pathLike);
    if (fileSet.has(`${localCand}.py`)) {
      return { target: `${localCand}.py`, external: null };
    }
    if (fileSet.has(posixJoin(localCand, '__init__.py'))) {
      return { target: posixJoin(localCand, '__init__.py'), external: null };
    }
  }

  // 3. Otherwise external package
  const topPackage = trimmed.split('.')[0];
  return { target: null, external: topPackage };
}
