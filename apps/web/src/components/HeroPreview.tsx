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
    color: '#4f46e5',
    colSpan: 'col-span-2 sm:col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    id: 't2',
    name: 'apps/web',
    path: 'apps/web/src/app/page.tsx',
    size: '9.8 KB',
    lang: 'TypeScript',
    color: '#38bdf8',
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
    color: '#a3e635',
    colSpan: 'col-span-1 sm:col-span-2',
    rowSpan: 'row-span-2',
  },
  {
    id: 't5',
    name: 'packages/cli',
    path: 'packages/cli/src/index.ts',
    size: '3.1 KB',
    lang: 'TypeScript',
    color: '#f43f5e',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    id: 't6',
    name: 'tests/scoring.test.ts',
    path: 'tests/scoring.test.ts',
    size: '6.5 KB',
    lang: 'TypeScript',
    color: '#e69f00',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
];

export function HeroPreview() {
  const [hoveredTile, setHoveredTile] = useState<SampleTile | null>(null);

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 sm:p-6 shadow-card select-none">
      {/* Header: score badge + Tilly */}
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3.5 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-control border-2 border-ink bg-sun flex items-center justify-center font-display font-extrabold text-lg text-ink shadow-card-sm">
            68
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">Health: 68/100</span>
              <StickerBadge variant="sun" size="sm" rotate="right">
                Needs work
              </StickerBadge>
            </div>
            <p className="text-xs font-mono text-ink-muted">student-portfolio/react-app</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StickerBadge variant="paper" size="sm" dot={false}>
            SAMPLE
          </StickerBadge>
          <div className="hidden sm:block">
            <Tilly mood="neutral" size={32} />
          </div>
        </div>
      </div>

      {/* Interactive mini treemap */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 h-56 sm:h-60 p-2 mt-4 rounded-control border-2 border-ink bg-paper-2">
        {SAMPLE_TILES.map((tile) => {
          const isHovered = hoveredTile?.id === tile.id;
          return (
            <div
              key={tile.id}
              onMouseEnter={() => setHoveredTile(tile)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{ backgroundColor: tile.color }}
              className={`${tile.colSpan} ${tile.rowSpan} rounded-tile border-2 border-ink p-2 flex flex-col justify-between cursor-pointer transition-all duration-[120ms] ${
                isHovered
                  ? '-translate-x-px -translate-y-px shadow-card z-10'
                  : 'shadow-card-sm'
              }`}
            >
              <span className="font-bold text-[11px] sm:text-xs text-white truncate bg-black/40 px-1.5 py-0.5 rounded-[3px] inline-block w-fit max-w-full">
                {tile.name}
              </span>
              <span className="font-mono text-[10px] text-white/90 font-medium">{tile.size}</span>
            </div>
          );
        })}
      </div>

      {/* Hover caption strip */}
      <div className="flex items-center justify-between text-xs text-ink-muted min-h-[22px] mt-3">
        {hoveredTile ? (
          <span className="font-mono text-ink font-medium">
            <span className="font-bold text-primary">{hoveredTile.path}</span> (
            {hoveredTile.size} • {hoveredTile.lang})
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Interactive treemap preview. Hover tiles to inspect.</span>
          </span>
        )}
        <span className="hidden sm:inline font-bold text-primary text-xs">
          Live treemap &rarr;
        </span>
      </div>
    </div>
  );
}
