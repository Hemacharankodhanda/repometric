import 'server-only';

import type { Grade } from '@repometric/core';

export interface BadgeOptions {
  label?: string;
  value: string;
  grade?: Grade | 'unknown';
  style?: 'flat' | 'flat-square';
}

const GRADE_COLORS: Record<Grade | 'unknown', string> = {
  excellent: '#10b981', // --lime
  good: '#06b6d4', // --sky
  'needs-work': '#f59e0b', // --sun
  'at-risk': '#f43f5e', // --coral
  unknown: '#64748b', // grey
};

export function renderBadgeSvg(options: BadgeOptions): string {
  const label = options.label || 'repo health';
  const value = options.value;
  const grade = options.grade || 'unknown';
  const style = options.style || 'flat';

  const fillColor = GRADE_COLORS[grade] || GRADE_COLORS.unknown;
  const radius = style === 'flat-square' ? 0 : 4;

  // Compute widths based on text length
  const labelWidth = Math.round(label.length * 6.8 + 14);
  const valueWidth = Math.round(value.length * 6.8 + 16);
  const totalWidth = labelWidth + valueWidth;
  const height = 20;

  const labelX = Math.round(labelWidth / 2);
  const valueX = Math.round(labelWidth + valueWidth / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#0f172a"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${fillColor}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#f8fafc" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600">
    <text x="${labelX}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelX}" y="14">${label}</text>
    <text x="${valueX}" y="15" fill="#010101" fill-opacity=".2">${value}</text>
    <text x="${valueX}" y="14" fill="#0f172a">${value}</text>
  </g>
</svg>`;
}
