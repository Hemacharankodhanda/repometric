'use client';

import React, { useState } from 'react';
import { StickerBadge } from './StickerBadge';
import { ChunkyButton } from './ChunkyButton';
import { Check, Copy, ChevronRight, Folder, Terminal, RotateCcw } from 'lucide-react';

/* 1. Score with Receipts Interactive Demo */
export function DemoScoreReceipts() {
  const [activeTab, setActiveTab] = useState<'docs' | 'hygiene' | 'activity'>('docs');

  const data = {
    docs: {
      score: '17.5 / 20 pts',
      items: [
        {
          label: 'README length & sections',
          pts: '+10.0',
          pass: true,
          desc: 'Install, usage, and quickstart detected.',
        },
        {
          label: 'Open-source License',
          pts: '+5.0',
          pass: true,
          desc: 'Standard MIT License found in root.',
        },
        {
          label: 'Contributing guide',
          pts: '+2.5',
          pass: false,
          desc: 'CONTRIBUTING.md lacks PR template.',
        },
      ],
    },
    hygiene: {
      score: '16.0 / 20 pts',
      items: [
        {
          label: 'Automated CI workflow',
          pts: '+10.0',
          pass: true,
          desc: 'GitHub Actions running tests on pull requests.',
        },
        {
          label: '.gitignore hygiene',
          pts: '+4.0',
          pass: true,
          desc: 'Node modules and environment files ignored.',
        },
        {
          label: 'Branch protection',
          pts: '+2.0',
          pass: false,
          desc: 'Direct pushes allowed on main branch.',
        },
      ],
    },
    activity: {
      score: '19.0 / 20 pts',
      items: [
        {
          label: 'Commit cadence (90d)',
          pts: '+10.0',
          pass: true,
          desc: '52 commits across 11 active weeks.',
        },
        {
          label: 'Issue resolution rate',
          pts: '+5.0',
          pass: true,
          desc: 'Median issue close time: 3.2 days.',
        },
        {
          label: 'Recent tag / release',
          pts: '+4.0',
          pass: true,
          desc: 'v1.4.0 tagged 18 days ago.',
        },
      ],
    },
  };

  const current = data[activeTab];

  return (
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2.5">
        <div className="flex gap-1.5 bg-paper-2 p-1 rounded-control border-2 border-ink shadow-card-sm">
          {(['docs', 'hygiene', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-control text-xs capitalize transition-all duration-[120ms] ${
                activeTab === tab
                  ? 'bg-primary text-white border-2 border-ink shadow-card-sm font-bold -translate-x-px -translate-y-px'
                  : 'text-ink font-semibold hover:bg-card/60'
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
            className="flex items-start justify-between gap-2 p-2.5 rounded-control border-2 border-ink bg-paper-2 text-xs shadow-card-sm"
          >
            <div className="space-y-0.5">
              <div className="font-bold text-ink">{item.label}</div>
              <p className="text-[11px] text-ink-muted">{item.desc}</p>
            </div>
            <StickerBadge variant={item.pass ? 'lime' : 'sun'} size="sm" dot={false}>
              {item.pts}
            </StickerBadge>
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
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-ink-muted uppercase">Health:</span>
          <span className="font-display font-extrabold text-xl text-ink">
            {projected.toFixed(1)}
          </span>
          {done && (
            <StickerBadge variant="lime" size="sm" rotate="right">
              +4.5 pts gained!
            </StickerBadge>
          )}
        </div>
        <span className="text-xs font-bold text-primary-text">Click checkbox to preview</span>
      </div>

      <div
        className={`p-3.5 rounded-control border-2 border-ink bg-paper-2 transition-all shadow-card-sm ${
          done ? 'opacity-70 bg-card' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setDone(!done)}
              aria-label="Toggle sample fix"
              className={`w-5 h-5 rounded-md border-2 border-ink flex items-center justify-center transition-all cursor-pointer shadow-card-sm ${
                done
                  ? 'bg-lime text-ink'
                  : 'bg-card hover:bg-paper-2'
              }`}
            >
              {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div>
              <span
                className={`text-xs sm:text-sm font-bold text-ink ${done ? 'line-through text-ink-muted' : ''}`}
              >
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
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2 text-xs">
        <div className="flex items-center space-x-1.5 font-bold font-mono">
          <button
            type="button"
            onClick={() => setFolder('root')}
            className={`hover:underline ${folder === 'root' ? 'text-primary-text font-bold' : 'text-ink-muted'}`}
          >
            root
          </button>
          {folder === 'src' && (
            <>
              <span>/</span>
              <span className="text-primary-text font-bold">src</span>
            </>
          )}
        </div>
        {folder === 'src' && (
          <button
            type="button"
            onClick={() => setFolder('root')}
            className="flex items-center space-x-1 text-primary-text font-bold text-xs hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zoom out</span>
          </button>
        )}
      </div>

      <div className="h-44 rounded-control border-2 border-ink bg-paper-2 p-2 grid grid-cols-3 gap-2 shadow-card-sm">
        {folder === 'root' ? (
          <>
            <div
              onClick={() => setFolder('src')}
              className="col-span-2 rounded-tile border-2 border-ink bg-sun p-2.5 flex flex-col justify-between cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-card shadow-card-sm transition-all"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-ink">
                <Folder className="w-4 h-4 text-ink" />
                <span>src/ (click to zoom)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-ink">14 files • 84 KB</span>
            </div>
            <div className="col-span-1 rounded-tile border-2 border-ink bg-lime p-2.5 flex flex-col justify-between shadow-card-sm">
              <span className="text-xs font-bold text-ink">README.md</span>
              <span className="text-[10px] font-mono font-bold text-ink">4.2 KB</span>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2 rounded-tile border-2 border-ink bg-sky p-2.5 flex flex-col justify-between shadow-card-sm">
              <span className="text-xs font-bold text-ink">index.ts</span>
              <span className="text-[10px] font-mono font-bold text-ink">38.4 KB • TypeScript</span>
            </div>
            <div className="col-span-1 rounded-tile border-2 border-ink bg-coral text-white p-2.5 flex flex-col justify-between shadow-card-sm">
              <span className="text-xs font-bold text-white">utils.ts</span>
              <span className="text-[10px] font-mono font-bold text-white/90">12.1 KB</span>
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
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2 text-xs">
        <span className="font-bold text-ink">Interactive Import Graph</span>
        <StickerBadge variant="lime" size="sm" dot={false}>
          0 circular loops
        </StickerBadge>
      </div>

      <div className="h-44 rounded-control border-2 border-ink bg-paper-2 p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto shadow-card-sm relative">
        <button
          type="button"
          onClick={() => setSelectedNode('page.tsx')}
          className={`px-3 py-1.5 rounded-control border-2 border-ink font-mono text-xs font-bold transition-all shrink-0 ${
            selectedNode === 'page.tsx'
              ? 'bg-primary text-white shadow-card -translate-x-px -translate-y-px'
              : 'bg-card text-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px'
          }`}
        >
          page.tsx
        </button>

        <ChevronRight className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />

        <button
          type="button"
          onClick={() => setSelectedNode('core.ts')}
          className={`px-3 py-1.5 rounded-control border-2 border-ink font-mono text-xs font-bold transition-all shrink-0 ${
            selectedNode === 'core.ts'
              ? 'bg-sun text-ink shadow-card -translate-x-px -translate-y-px'
              : 'bg-card text-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px'
          }`}
        >
          core.ts (Hub)
        </button>

        <ChevronRight className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />

        <button
          type="button"
          onClick={() => setSelectedNode('utils.ts')}
          className={`px-3 py-1.5 rounded-control border-2 border-ink font-mono text-xs font-bold transition-all shrink-0 ${
            selectedNode === 'utils.ts'
              ? 'bg-sky text-ink shadow-card -translate-x-px -translate-y-px'
              : 'bg-card text-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px'
          }`}
        >
          utils.ts
        </button>
      </div>

      <div className="text-xs font-mono text-ink-muted flex justify-between">
        <span>
          Selected: <span className="font-bold text-ink">{selectedNode}</span>
        </span>
        <span className="font-bold text-ink">Fan-in: 18 • Fan-out: 4</span>
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
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-2 text-xs">
        <span className="font-bold text-ink">Deterministic Architecture</span>
        <button
          type="button"
          onClick={copySnippet}
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-control border-2 border-ink bg-paper-2 hover:bg-card text-xs font-bold text-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card transition-all duration-[120ms]"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy README snippet'}</span>
        </button>
      </div>

      <div className="p-4 rounded-control border-2 border-ink bg-paper-2 flex flex-col items-center space-y-2 shadow-card-sm">
        <div className="w-full max-w-xs p-2.5 rounded-control border-2 border-ink bg-sky text-ink text-center text-xs font-bold shadow-card-sm">
          Client Layer (React UI &amp; Pages)
        </div>
        <div className="text-ink font-mono font-bold text-xs">&darr; imports</div>
        <div className="w-full max-w-xs p-2.5 rounded-control border-2 border-ink bg-sun text-ink text-center text-xs font-bold shadow-card-sm">
          Core Engine &amp; Scorer
        </div>
        <div className="text-ink font-mono font-bold text-xs">&darr; calls</div>
        <div className="w-full max-w-xs p-2.5 rounded-control border-2 border-ink border-dashed bg-card text-ink text-center text-xs font-bold shadow-card-sm">
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
    <div className="w-full rounded-card border-2 border-ink bg-card p-5 shadow-card space-y-4">
      {/* Live Badge Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink/10 pb-3">
        <div>
          <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            README Badge
          </span>
          <div className="pt-2 flex items-center space-x-2">
            <span className="inline-flex rounded-control border-2 border-ink overflow-hidden font-mono text-xs shadow-card-sm">
              <span className="bg-ink text-white px-2.5 py-1 font-bold">repometric</span>
              <span className="bg-lime text-ink px-2.5 py-1 font-bold border-l-2 border-ink">
                92 • excellent
              </span>
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
          icon={copiedBadge ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedBadge ? 'Copied' : 'Copy badge snippet'}
        </ChunkyButton>
      </div>

      {/* CLI terminal command */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Terminal CLI
          </span>
          <div className="pt-2 font-mono text-xs text-ink flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <code className="bg-paper-2 px-3 py-1.5 rounded-control border-2 border-ink font-bold shadow-card-sm">
              {cliCommand}
            </code>
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
          icon={copiedCli ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedCli ? 'Copied' : 'Copy command'}
        </ChunkyButton>
      </div>
    </div>
  );
}
