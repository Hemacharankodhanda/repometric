const EXTENSION_MAP: Record<string, string> = {
  // TypeScript & JavaScript
  ts: 'TypeScript',
  tsx: 'TypeScript',
  mts: 'TypeScript',
  cts: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',

  // Python
  py: 'Python',
  pyi: 'Python',
  pyw: 'Python',

  // System & compiled
  rs: 'Rust',
  go: 'Go',
  c: 'C',
  h: 'C',
  cpp: 'C++',
  hpp: 'C++',
  cc: 'C++',
  cxx: 'C++',
  cs: 'C#',
  java: 'Java',
  kt: 'Kotlin',
  kts: 'Kotlin',
  swift: 'Swift',

  // Dynamic / Scripting
  rb: 'Ruby',
  php: 'PHP',
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',

  // Web & Data
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  mdx: 'Markdown',
  sql: 'SQL',
};

const TEST_FILE_PATTERNS = [
  /\.(test|spec)\.[a-z0-9]+$/i,
  /(^|\/)test_[^/]+\.py$/i,
  /(^|\/)[^/]+_test\.[a-z0-9]+$/i,
  /(^|\/)(__tests__|tests|test|specs|spec)\//i,
];

const VENDOR_PATTERNS = [
  /(^|\/)(node_modules|\.git|dist|build|\.next|vendor)\//i,
  /\.min\.(js|css)$/i,
];

/**
 * Determines the programming language of a file path based on extension.
 */
export function getLanguageForPath(filePath: string): string | null {
  const parts = filePath.split('.');
  if (parts.length < 2) return null;
  const ext = parts.pop()?.toLowerCase();
  return ext ? (EXTENSION_MAP[ext] ?? null) : null;
}

/**
 * Checks if a file path is a test file.
 */
export function isTestPath(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Checks if a file path is vendor or generated (to be excluded from graph parsing).
 */
export function isVendorPath(filePath: string): boolean {
  return VENDOR_PATTERNS.some((pattern) => pattern.test(filePath));
}
