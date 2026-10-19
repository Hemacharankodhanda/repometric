'use client';

import React, { useState } from 'react';
import { StickerBadge } from './StickerBadge';
import { ChunkyButton } from './ChunkyButton';
import {
  Check,
  Copy,
  ChevronRight,
  Folder,
  Terminal,
  RotateCcw,
} from 'lucide-react';

/* 1. Score with Receipts Interactive Demo */
export function DemoScoreReceipts() {
  const [activeTab, setActiveTab] = useState<'docs' | 'hygiene' | 'activity'>('docs');

  const data = {
    docs: {
      score: '17.5 / 20 pts',
      items: [
        { label: 'README length & sections', pts: '+10.0', pass: true, desc: 'Install, usage, and quickstart detected.' },
        { label: 'Open-source License', pts: '+5.0', pass: true, desc: 'Standard MIT License found in root.' },
        { label: 'Contributing guide', pts: '+2.5', pass: false, desc: 'CONTRIBUTING.md lacks PR template.' },
      ],
    },
    hygiene: {
      score: '16.0 / 20 pts',
      items: [
        { label: 'Automated CI workflow', pts: '+10.0', pass: true, desc: 'GitHub Actions running tests on pull requests.' },
        { label: '.gitignore hygiene', pts: '+4.0', pass: true, desc: 'Node modules and environment files ignored.' },
        { label: 'Branch protection', pts: '+2.0', pass: false, desc: 'Direct pushes allowed on main branch.' },
      ],
    },
    activity: {
      score: '19.0 / 20 pts',
      items: [
        { label: 'Commit cadence (90d)', pts: '+10.0', pass: true, desc: '52 commits across 11 active weeks.' },
        { label: 'Issue resolution rate', pts: '+5.0', pass: true, desc: 'Median issue close time: 3.2 days.' },
        { label: 'Recent tag / release', pts: '+4.0', pass: true, desc: 'v1.4.0 tagged 18 days ago.' },
      ],
    },
  };

  const current = data[activeTab];

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2.5">
        <div className="flex gap-1.5">
          {(['docs', 'hygiene', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-control border-2 border-ink text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-sun text-ink shadow-[2px_2px_0_var(--ink)] -translate-y-0.5'
                  : 'bg-paper-2 text-ink-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs font-bold text-ink">{current.score}</span>
      </div>

      <div className="space-y-2">
        {current.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-2 p-2.5 rounded-control border border-ink/40 bg-paper-2 text-xs"
          >
            <div className="space-y-0.5">
              <div className="font-bold text-ink">{item.label}</div>
              <p className="text-[11px] text-ink-muted">{item.desc}</p>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border border-ink/60 shrink-0 ${
                item.pass ? 'bg-lime text-ink' : 'bg-sun/60 text-ink'
              }`}
            >
              {item.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2. Interactive Fix List Demo with Projected Score update */
export function DemoFixList() {
  const [done, setDone] = useState(false);
  const projected = done ? 78.5 : 74;

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-ink-muted uppercase">Health:</span>
          <span className="font-display font-extrabold text-lg text-ink">{projected.toFixed(1)}</span>
          {done && (
            <StickerBadge variant="lime" size="sm" rotate="right">
              +4.5 pts gained!
            </StickerBadge>
          )}
        </div>
        <span className="text-[11px] font-bold text-primary-text">Click checkbox to preview</span>
      </div>

      <div
        className={`p-3.5 rounded-control border-2 border-ink bg-paper-2 transition-all ${
          done ? 'opacity-70 bg-lime/10' : 'shadow-[3px_3px_0_var(--ink)]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setDone(!done)}
              aria-label="Toggle sample fix"
              className={`w-6 h-6 rounded-[6px] border-2 border-ink flex items-center justify-center transition-colors ${
                done ? 'bg-lime text-ink' : 'bg-card hover:bg-lime/30 shadow-[1px_1px_0_var(--ink)]'
              }`}
            >
              {done && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <div>
              <span className={`text-xs sm:text-sm font-bold text-ink ${done ? 'line-through text-ink-muted' : ''}`}>
                Add an open source license (MIT/Apache)
              </span>
              <p className="text-[11px] text-ink-muted">Effort: about 2 minutes</p>
            </div>
          </div>
          <StickerBadge variant={done ? 'card' : 'lime'} size="sm" rotate="none">
            +4.5
          </StickerBadge>
        </div>
      </div>
    </div>
  );
}

/* 3. Interactive Treemap Zoom Demo */
export function DemoTreemapZoom() {
  const [folder, setFolder] = useState<'root' | 'src'>('root');

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2 text-xs">
        <div className="flex items-center space-x-1.5 font-bold font-mono">
          <button
            type="button"
            onClick={() => setFolder('root')}
            className={`hover:underline ${folder === 'root' ? 'text-primary-text' : 'text-ink-muted'}`}
          >
            root
          </button>
          {folder === 'src' && (
            <>
              <span>/</span>
              <span className="text-primary-text">src</span>
            </>
          )}
        </div>
        {folder === 'src' && (
          <button
            type="button"
            onClick={() => setFolder('root')}
            className="flex items-center space-x-1 text-primary-text font-bold hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Zoom out</span>
          </button>
        )}
      </div>

      <div className="h-44 rounded-control border-2 border-ink bg-paper-2 p-2 grid grid-cols-3 gap-2">
        {folder === 'root' ? (
          <>
            <div
              onClick={() => setFolder('src')}
              className="col-span-2 rounded border-2 border-ink bg-sun/40 p-2 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] transition-all"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-ink">
                <Folder className="w-3.5 h-3.5 fill-sun text-ink" />
                <span>src/ (click to zoom)</span>
              </div>
              <span className="text-[10px] font-mono text-ink-muted">14 files • 84 KB</span>
            </div>
            <div className="col-span-1 rounded border-2 border-ink bg-lime/40 p-2 flex flex-col justify-between">
              <span className="text-xs font-bold text-ink">README.md</span>
              <span className="text-[10px] font-mono text-ink-muted">4.2 KB</span>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2 rounded border-2 border-ink bg-sky/40 p-2 flex flex-col justify-between">
              <span className="text-xs font-bold text-ink">index.ts</span>
              <span className="text-[10px] font-mono text-ink-muted">38.4 KB • TypeScript</span>
            </div>
            <div className="col-span-1 rounded border-2 border-ink bg-coral/30 p-2 flex flex-col justify-between">
              <span className="text-xs font-bold text-ink">utils.ts</span>
              <span className="text-[10px] font-mono text-ink-muted">12.1 KB</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* 4. Interactive Dependency Graph Demo */
export function DemoDependencyGraph() {
  const [selectedNode, setSelectedNode] = useState<string>('core.ts');

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2 text-xs">
        <span className="font-bold text-ink">Interactive Import Graph</span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-lime text-ink font-bold border border-ink">
          0 circular loops
        </span>
      </div>

      <div className="h-44 rounded-control border-2 border-ink bg-paper-2 p-2 sm:p-3 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto relative">
        {/* Nodes */}
        <button
          type="button"
          onClick={() => setSelectedNode('page.tsx')}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-control border-2 border-ink font-mono text-[10px] sm:text-xs font-bold transition-transform shrink-0 ${
            selectedNode === 'page.tsx' ? 'bg-primary text-on-primary scale-105 shadow-[2px_2px_0_var(--ink)]' : 'bg-card text-ink'
          }`}
        >
          page.tsx
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-ink-muted shrink-0" />

        <button
          type="button"
          onClick={() => setSelectedNode('core.ts')}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-control border-2 border-ink font-mono text-[10px] sm:text-xs font-bold transition-transform shrink-0 ${
            selectedNode === 'core.ts' ? 'bg-sun text-ink scale-105 shadow-[2px_2px_0_var(--ink)]' : 'bg-card text-ink'
          }`}
        >
          core.ts (Hub)
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-ink-muted shrink-0" />

        <button
          type="button"
          onClick={() => setSelectedNode('utils.ts')}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-control border-2 border-ink font-mono text-[10px] sm:text-xs font-bold transition-transform shrink-0 ${
            selectedNode === 'utils.ts' ? 'bg-sky text-ink scale-105 shadow-[2px_2px_0_var(--ink)]' : 'bg-card text-ink'
          }`}
        >
          utils.ts
        </button>
      </div>

      <div className="text-xs font-mono text-ink-muted flex justify-between">
        <span>Selected: <span className="font-bold text-ink">{selectedNode}</span></span>
        <span>Fan-in: 18 • Fan-out: 4</span>
      </div>
    </div>
  );
}

/* 5. Interactive Architecture Diagram Demo */
export function DemoArchitecture() {
  const [copied, setCopied] = useState(false);

  const snippet = `\`\`\`mermaid
flowchart TD
  subgraph Client["Client"]
    c0["ui (12 files)"]
  end
  subgraph Server["Server"]
    c1["api (8 files)"]
  end
  c0 --> c1
\`\`\``;

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2 text-xs">
        <span className="font-bold text-ink">Deterministic Architecture</span>
        <button
          type="button"
          onClick={copySnippet}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-control border-2 border-ink bg-paper-2 hover:bg-lime text-xs font-bold text-ink shadow-[1px_1px_0_var(--ink)]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-ink" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy README snippet'}</span>
        </button>
      </div>

      <div className="p-3 rounded-control border-2 border-ink bg-paper-2 flex flex-col items-center space-y-2">
        <div className="w-full max-w-xs p-2 rounded border-2 border-ink bg-sky/30 text-center text-xs font-bold text-ink">
          Client Layer (React UI & Pages)
        </div>
        <div className="text-ink-muted text-xs font-mono">&darr; imports</div>
        <div className="w-full max-w-xs p-2 rounded border-2 border-ink bg-sun/30 text-center text-xs font-bold text-ink">
          Core Engine & Scorer
        </div>
        <div className="text-ink-muted text-xs font-mono">&darr; calls</div>
        <div className="w-full max-w-xs p-2 rounded border-2 border-teal border-dashed bg-card text-center text-xs font-bold text-ink">
          External Services (@supabase, redis)
        </div>
      </div>
    </div>
  );
}

/* 6. Show It Off (Badge & CLI Snippet) */
export function DemoShowItOff() {
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const badgeMarkdown = `[![RepoMetric](https://repometric.dev/api/badge/repometric/repometric)](https://repometric.dev/r/repometric/repometric)`;
  const cliCommand = `npx repometric owner/repo`;

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-[4px_4px_0_var(--ink)] space-y-4">
      {/* Live Badge Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <span className="text-xs font-bold text-ink-muted uppercase">README Badge:</span>
          <div className="pt-1.5 flex items-center space-x-2">
            <span className="inline-flex rounded-[4px] border-2 border-ink overflow-hidden font-bold text-xs shadow-[2px_2px_0_var(--ink)]">
              <span className="bg-ink text-paper px-2 py-0.5">repometric</span>
              <span className="bg-lime text-ink px-2 py-0.5">92 • excellent</span>
            </span>
          </div>
        </div>
        <ChunkyButton
          variant="secondary"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(badgeMarkdown);
            setCopiedBadge(true);
            setTimeout(() => setCopiedBadge(false), 2000);
          }}
          icon={copiedBadge ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedBadge ? 'Copied' : 'Copy badge snippet'}
        </ChunkyButton>
      </div>

      {/* CLI terminal command */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-ink-muted uppercase">Terminal CLI:</span>
          <div className="pt-1.5 font-mono text-xs text-ink font-bold flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <code className="bg-paper-2 px-2 py-1 rounded border border-ink/40">{cliCommand}</code>
          </div>
        </div>
        <ChunkyButton
          variant="secondary"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(cliCommand);
            setCopiedCli(true);
            setTimeout(() => setCopiedCli(false), 2000);
          }}
          icon={copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedCli ? 'Copied' : 'Copy command'}
        </ChunkyButton>
      </div>
    </div>
  );
}
