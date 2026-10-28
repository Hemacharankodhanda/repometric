'use client';

import React, { useState } from 'react';
import { Tilly } from './Tilly';
import { StickerBadge } from './StickerBadge';
import { Layers } from 'lucide-react';

interface SampleTile {
  id: string;
  name: string;
  path: string;
  size: string;
  lang: string;
  color: string;
  colSpan: string;
  rowSpan: string;
}

const SAMPLE_TILES: SampleTile[] = [
  {
    id: 't1',
    name: 'packages/core',
    path: 'packages/core/src/engine.ts',
    size: '14.2 KB',
    lang: 'TypeScript',
    color: '#6366f1',
    colSpan: 'col-span-2 sm:col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    id: 't2',
    name: 'apps/web',
    path: 'apps/web/src/app/page.tsx',
    size: '9.8 KB',
    lang: 'TypeScript',
    color: '#06b6d4',
    colSpan: 'col-span-2 sm:col-span-3',
    rowSpan: 'row-span-1',
  },
  {
    id: 't3',
    name: 'README.md',
    path: 'README.md',
    size: '4.6 KB',
    lang: 'Markdown',
    color: '#f59e0b',
    colSpan: 'col-span-1 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    id: 't4',
    name: 'packages/viz',
    path: 'packages/viz/src/RepoMap.tsx',
    size: '12.4 KB',
    lang: 'TypeScript',
    color: '#10b981',
    colSpan: 'col-span-1 sm:col-span-2',
    rowSpan: 'row-span-2',
  },
  {
    id: 't5',
    name: 'packages/cli',
    path: 'packages/cli/src/index.ts',
    size: '3.1 KB',
    lang: 'TypeScript',
    color: '#8b5cf6',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    id: 't6',
    name: 'tests/scoring.test.ts',
    path: 'tests/scoring.test.ts',
    size: '6.5 KB',
    lang: 'TypeScript',
    color: '#ec4899',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
];

export function HeroPreview() {
  const [hoveredTile, setHoveredTile] = useState<SampleTile | null>(null);

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 sm:p-6 shadow-md dark:shadow-2xl dark:shadow-indigo-950/20 space-y-4 select-none relative overflow-hidden backdrop-blur-sm">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />

      {/* Top preview header with score badge and Tilly */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-display font-extrabold text-lg text-ink">
            68
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-ink">Health: 68/100</span>
              <StickerBadge variant="sun" size="sm">
                Needs work
              </StickerBadge>
            </div>
            <p className="text-xs font-mono text-ink-muted">student-portfolio/react-app</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StickerBadge variant="paper" size="sm" dot={false}>
            SAMPLE DATA
          </StickerBadge>
          <div className="hidden sm:block">
            <Tilly mood="neutral" size={32} />
          </div>
        </div>
      </div>

      {/* Interactive mini treemap grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 h-56 sm:h-60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        {SAMPLE_TILES.map((tile) => {
          const isHovered = hoveredTile?.id === tile.id;
          return (
            <div
              key={tile.id}
              onMouseEnter={() => setHoveredTile(tile)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{ backgroundColor: tile.color }}
              className={`${tile.colSpan} ${tile.rowSpan} rounded-lg border border-black/10 dark:border-white/10 p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isHovered
                  ? 'scale-[1.02] shadow-lg z-10 brightness-105'
                  : 'hover:brightness-105 opacity-90'
              }`}
            >
              <span className="font-medium text-[11px] sm:text-xs text-white truncate bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded inline-block w-fit max-w-full">
                {tile.name}
              </span>
              <span className="font-mono text-[10px] text-white/90 font-medium">{tile.size}</span>
            </div>
          );
        })}
      </div>

      {/* Dynamic hover caption strip */}
      <div className="flex items-center justify-between text-xs text-ink-muted min-h-[22px]">
        {hoveredTile ? (
          <span className="font-mono text-ink font-medium">
            <span className="font-semibold text-primary">{hoveredTile.path}</span> (
            {hoveredTile.size} • {hoveredTile.lang})
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Treemap preview. Hover tiles to inspect.</span>
          </span>
        )}
        <span className="hidden sm:inline font-semibold text-primary text-xs">
          Live treemap &rarr;
        </span>
      </div>
    </div>
  );
}
