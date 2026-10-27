'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ReadingGuideProps {
  type: 'map' | 'graph' | 'diagram';
  className?: string;
}

const GUIDE_CONTENT: Record<
  'map' | 'graph' | 'diagram',
  { title: string; summary: string; details: { label: string; desc: string }[] }
> = {
  map: {
    title: 'How to read the Repo Map',
    summary: 'Every file is a colorful tile. Bigger tile = bigger file size in bytes.',
    details: [
      { label: 'Area', desc: 'File size in bytes. Subfolders group tiles into nested boxes.' },
      { label: 'Colors', desc: 'Identifies file language using a color-blind safe palette.' },
      { label: 'Navigation', desc: 'Click any folder to zoom into its contents. Use breadcrumbs to zoom out.' },
    ],
  },
  graph: {
    title: 'How to read the Dependency Graph',
    summary: 'A force-directed map of file imports. Arrows show who imports whom.',
    details: [
      { label: 'Nodes', desc: 'Files in your repository. Larger nodes indicate higher import fan-in.' },
      { label: 'Edges', desc: 'Import relationships between files. Dashed red edges mark circular dependencies.' },
      { label: 'Navigation', desc: 'Drag nodes to rearrange, scroll wheel to zoom, click to inspect connections.' },
    ],
  },
  diagram: {
    title: 'How to read the Architecture Diagram',
    summary: 'Deterministic flowchart grouping your components into architectural layers.',
    details: [
      { label: 'Layers', desc: 'Client, Server, Core, Data, and Shared subgraphs derived from folder heuristics.' },
      { label: 'Connections', desc: 'Import volume between modules. Counts >= 5 are labelled on the arrows.' },
      { label: 'Externals', desc: 'Third-party packages, databases, and APIs classified with teal borders.' },
    ],
  },
};

export function ReadingGuide({ type, className = '' }: ReadingGuideProps) {
  const [open, setOpen] = useState(false);
  const info = GUIDE_CONTENT[type];

  return (
    <div
      className={`rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-3 text-xs text-ink transition-all shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-ink">{info.title}:</span>
          <span className="text-ink-muted hidden sm:inline">{info.summary}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center space-x-1 text-ink-muted hover:text-ink font-medium"
          aria-expanded={open}
        >
          <span>{open ? 'Hide guide' : 'How to read this'}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-ink">
          {info.details.map((d, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-paper-2 border border-slate-200/70 dark:border-slate-800/70">
              <span className="font-semibold block text-ink">{d.label}:</span>
              <span className="text-ink-muted text-[11px] leading-relaxed block mt-0.5">
                {d.desc}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
