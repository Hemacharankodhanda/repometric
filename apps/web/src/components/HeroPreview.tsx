'use client';

import React, { useState } from 'react';
import { Tilly } from './Tilly';
import { StickerBadge } from './StickerBadge';

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
    color: 'var(--lang-2)',
    colSpan: 'col-span-2 sm:col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    id: 't2',
    name: 'apps/web',
    path: 'apps/web/src/app/page.tsx',
    size: '9.8 KB',
    lang: 'TypeScript',
    color: 'var(--lang-5)',
    colSpan: 'col-span-2 sm:col-span-3',
    rowSpan: 'row-span-1',
  },
  {
    id: 't3',
    name: 'README.md',
    path: 'README.md',
    size: '4.6 KB',
    lang: 'Markdown',
    color: 'var(--lang-1)',
    colSpan: 'col-span-1 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    id: 't4',
    name: 'packages/viz',
    path: 'packages/viz/src/RepoMap.tsx',
    size: '12.4 KB',
    lang: 'TypeScript',
    color: 'var(--lang-3)',
    colSpan: 'col-span-1 sm:col-span-2',
    rowSpan: 'row-span-2',
  },
  {
    id: 't5',
    name: 'packages/cli',
    path: 'packages/cli/src/index.ts',
    size: '3.1 KB',
    lang: 'TypeScript',
    color: 'var(--lang-4)',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    id: 't6',
    name: 'tests/scoring.test.ts',
    path: 'tests/scoring.test.ts',
    size: '6.5 KB',
    lang: 'TypeScript',
    color: 'var(--lang-7)',
    colSpan: 'col-span-2 sm:col-span-2',
    rowSpan: 'row-span-1',
  },
];

export function HeroPreview() {
  const [hoveredTile, setHoveredTile] = useState<SampleTile | null>(null);

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 sm:p-6 shadow-[6px_6px_0_var(--ink)] space-y-4 select-none">
      {/* Top preview header with score sticker and Tilly */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <Tilly mood="neutral" size={48} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-2xl text-ink">68</span>
              <StickerBadge variant="sun" size="sm" rotate="right">
                Needs work
              </StickerBadge>
            </div>
            <p className="text-xs text-ink-muted">student-portfolio/react-app</p>
          </div>
        </div>

        <StickerBadge variant="paper" size="sm" rotate="left">
          Sample
        </StickerBadge>
      </div>

      {/* Interactive mini treemap grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 h-56 sm:h-64 p-2 rounded-control border-2 border-ink bg-paper-2">
        {SAMPLE_TILES.map((tile) => {
          const isHovered = hoveredTile?.id === tile.id;
          return (
            <div
              key={tile.id}
              onMouseEnter={() => setHoveredTile(tile)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{ backgroundColor: tile.color }}
              className={`${tile.colSpan} ${tile.rowSpan} rounded-tile border-2 border-ink p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 ${
                isHovered
                  ? '-translate-x-0.5 -translate-y-1 shadow-[3px_3px_0_var(--ink)] z-10 scale-[1.02]'
                  : 'shadow-[1px_1px_0_var(--ink)] hover:-translate-y-0.5'
              }`}
            >
              <span className="font-bold text-[11px] sm:text-xs text-ink truncate bg-card/75 px-1 py-0.5 rounded border border-ink/40 inline-block w-fit max-w-full">
                {tile.name}
              </span>
              <span className="font-mono text-[10px] text-ink font-semibold">
                {tile.size}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic hover caption strip */}
      <div className="flex items-center justify-between text-xs text-ink-muted min-h-[22px]">
        {hoveredTile ? (
          <span className="font-mono text-ink font-medium">
            <span className="font-bold">{hoveredTile.path}</span> ({hoveredTile.size} • {hoveredTile.lang})
          </span>
        ) : (
          <span>Sample output. Hover the tiles.</span>
        )}
        <span className="hidden sm:inline font-bold text-primary-text">
          Interactive treemap preview &rarr;
        </span>
      </div>
    </div>
  );
}
