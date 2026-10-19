import type { FileNode } from '@repometric/core';

// Okabe-Ito categorical palette
export const OKABE_ITO_PALETTE = [
  '#e69f00', // orange
  '#56b4e9', // sky blue
  '#009e73', // bluish green
  '#f0e442', // yellow
  '#0072b2', // blue
  '#d55e00', // vermilion
  '#cc79a7', // reddish purple
];

export const OTHER_LANG_COLOR = '#999999';

// YlGnBu 5 classes for size
export const YL_GN_BU_PALETTE = ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'];

export function getTopLanguages(files: FileNode[]): string[] {
  const counts: Record<string, number> = {};
  for (const file of files) {
    if (file.language) {
      counts[file.language] = (counts[file.language] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([lang]) => lang);
}

export function getLanguageColor(
  language: string | null | undefined,
  topLanguages: string[],
): string {
  if (!language) return OTHER_LANG_COLOR;
  const index = topLanguages.indexOf(language);
  if (index !== -1 && index < OKABE_ITO_PALETTE.length) {
    return OKABE_ITO_PALETTE[index]!;
  }
  return OTHER_LANG_COLOR;
}

export function getSizeColor(size: number, minSize = 1, maxSize = 50000): string {
  if (maxSize <= minSize) return YL_GN_BU_PALETTE[0]!;
  // Logarithmic scale for file sizes
  const logMin = Math.log10(Math.max(1, minSize));
  const logMax = Math.log10(Math.max(2, maxSize));
  const logVal = Math.log10(Math.max(1, size));
  const ratio = Math.min(1, Math.max(0, (logVal - logMin) / (logMax - logMin)));

  const index = Math.min(4, Math.floor(ratio * 5));
  return YL_GN_BU_PALETTE[index] ?? YL_GN_BU_PALETTE[0]!;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
