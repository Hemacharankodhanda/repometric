import { init, parse } from 'es-module-lexer';
import type { RawImport } from './types';

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureEsModuleLexerInit(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    const p = typeof init === 'function' ? init() : init;
    initPromise = Promise.resolve(p).then(() => {
      initialized = true;
    });
  }
  return initPromise;
}

// Regex fallback for CommonJS require('...')
const REQUIRE_REGEX = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/**
 * Parses all static, dynamic, and CommonJS imports from a JS/TS source file.
 */
export async function parseJsImports(source: string): Promise<RawImport[]> {
  await ensureEsModuleLexerInit();

  const results: RawImport[] = [];
  const seen = new Set<string>();

  try {
    const [imports] = parse(source);
    for (const rawImp of imports) {
      const imp = rawImp as {
        specifier?: string;
        n?: string;
        type?: string;
        d?: number;
      };
      const spec = imp.specifier ?? imp.n;
      if (spec) {
        const specifier = spec.trim();
        if (specifier && !seen.has(specifier)) {
          seen.add(specifier);
          const isDynamic = imp.type === 'dynamic' || (typeof imp.d === 'number' && imp.d >= 0);
          results.push({
            specifier,
            kind: isDynamic ? 'dynamic' : 'static',
          });
        }
      }
    }
  } catch {
    // If es-module-lexer fails on syntax, regex fallback catches imports
    const STATIC_IMPORT_REGEX = /\b(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = STATIC_IMPORT_REGEX.exec(source)) !== null) {
      const specifier = match[1]?.trim();
      if (specifier && !seen.has(specifier)) {
        seen.add(specifier);
        results.push({ specifier, kind: 'static' });
      }
    }
  }

  // Scan for require('...')
  let reqMatch: RegExpExecArray | null;
  while ((reqMatch = REQUIRE_REGEX.exec(source)) !== null) {
    const specifier = reqMatch[1]?.trim();
    if (specifier && !seen.has(specifier)) {
      seen.add(specifier);
      results.push({ specifier, kind: 'static' });
    }
  }

  return results;
}
