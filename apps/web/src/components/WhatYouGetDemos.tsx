'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex gap-1.5 bg-paper-2 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          {(['docs', 'hygiene', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs capitalize transition-all relative ${
                activeTab === tab
                  ? 'bg-card text-ink shadow-sm font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs font-semibold text-ink">{current.score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="space-y-2"
        >
          {current.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-paper-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-ink">{item.label}</div>
                <p className="text-[11px] text-ink-muted">{item.desc}</p>
              </div>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  item.pass
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {item.pts}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* 2. Interactive Fix List Demo with Projected Score update */
export function DemoFixList() {
  const [done, setDone] = useState(false);
  const projected = done ? 78.5 : 74;

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-ink-muted uppercase">Health:</span>
          <span className="font-display font-extrabold text-lg text-ink">
            {projected.toFixed(1)}
          </span>
          {done && (
            <StickerBadge variant="lime" size="sm">
              +4.5 pts gained!
            </StickerBadge>
          )}
        </div>
        <span className="text-[11px] font-medium text-primary">Click checkbox to preview</span>
      </div>

      <div
        className={`p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-paper-2 transition-all ${
          done ? 'opacity-70 bg-emerald-500/5 border-emerald-500/20' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setDone(!done)}
              aria-label="Toggle sample fix"
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-700 bg-card hover:border-primary'
              }`}
            >
              {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </motion.button>
            <div>
              <span
                className={`text-xs sm:text-sm font-semibold text-ink ${done ? 'line-through text-ink-muted' : ''}`}
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
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
        <div className="flex items-center space-x-1.5 font-medium font-mono">
          <button
            type="button"
            onClick={() => setFolder('root')}
            className={`hover:underline ${folder === 'root' ? 'text-primary font-semibold' : 'text-ink-muted'}`}
          >
            root
          </button>
          {folder === 'src' && (
            <>
              <span>/</span>
              <span className="text-primary font-semibold">src</span>
            </>
          )}
        </div>
        {folder === 'src' && (
          <button
            type="button"
            onClick={() => setFolder('root')}
            className="flex items-center space-x-1 text-primary text-xs hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Zoom out</span>
          </button>
        )}
      </div>

      <div className="h-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 grid grid-cols-3 gap-2">
        {folder === 'root' ? (
          <>
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => setFolder('src')}
              className="col-span-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 flex flex-col justify-between cursor-pointer hover:bg-amber-500/15 transition-all"
            >
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-ink">
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>src/ (click to zoom)</span>
              </div>
              <span className="text-[10px] font-mono text-ink-muted">14 files • 84 KB</span>
            </motion.div>
            <div className="col-span-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 flex flex-col justify-between">
              <span className="text-xs font-semibold text-ink">README.md</span>
              <span className="text-[10px] font-mono text-ink-muted">4.2 KB</span>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2 rounded-lg border border-sky-500/20 bg-sky-500/10 p-2.5 flex flex-col justify-between">
              <span className="text-xs font-semibold text-ink">index.ts</span>
              <span className="text-[10px] font-mono text-ink-muted">38.4 KB • TypeScript</span>
            </div>
            <div className="col-span-1 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 flex flex-col justify-between">
              <span className="text-xs font-semibold text-ink">utils.ts</span>
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
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
        <span className="font-semibold text-ink">Interactive Import Graph</span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
          0 circular loops
        </span>
      </div>

      <div className="h-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto relative">
        <button
          type="button"
          onClick={() => setSelectedNode('page.tsx')}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shrink-0 ${
            selectedNode === 'page.tsx'
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card text-ink border-slate-200 dark:border-slate-800'
          }`}
        >
          page.tsx
        </button>

        <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />

        <button
          type="button"
          onClick={() => setSelectedNode('core.ts')}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shrink-0 ${
            selectedNode === 'core.ts'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm'
              : 'bg-card text-ink border-slate-200 dark:border-slate-800'
          }`}
        >
          core.ts (Hub)
        </button>

        <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />

        <button
          type="button"
          onClick={() => setSelectedNode('utils.ts')}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shrink-0 ${
            selectedNode === 'utils.ts'
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 shadow-sm'
              : 'bg-card text-ink border-slate-200 dark:border-slate-800'
          }`}
        >
          utils.ts
        </button>
      </div>

      <div className="text-xs font-mono text-ink-muted flex justify-between">
        <span>
          Selected: <span className="font-semibold text-ink">{selectedNode}</span>
        </span>
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
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
        <span className="font-semibold text-ink">Deterministic Architecture</span>
        <button
          type="button"
          onClick={copySnippet}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-paper-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs font-medium text-ink transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy README snippet'}</span>
        </button>
      </div>

      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center space-y-2">
        <div className="w-full max-w-xs p-2.5 rounded-lg border border-sky-500/20 bg-sky-500/10 text-center text-xs font-semibold text-ink">
          Client Layer (React UI &amp; Pages)
        </div>
        <div className="text-ink-muted text-xs font-mono">&darr; imports</div>
        <div className="w-full max-w-xs p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-center text-xs font-semibold text-ink">
          Core Engine &amp; Scorer
        </div>
        <div className="text-ink-muted text-xs font-mono">&darr; calls</div>
        <div className="w-full max-w-xs p-2.5 rounded-lg border border-primary/20 border-dashed bg-card text-center text-xs font-semibold text-ink">
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
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-5 shadow-sm space-y-4">
      {/* Live Badge Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            README Badge
          </span>
          <div className="pt-2 flex items-center space-x-2">
            <span className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden font-mono text-xs shadow-sm">
              <span className="bg-slate-900 text-white px-2 py-0.5">repometric</span>
              <span className="bg-emerald-500 text-white px-2 py-0.5 font-semibold">
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
          icon={copiedBadge ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedBadge ? 'Copied' : 'Copy badge snippet'}
        </ChunkyButton>
      </div>

      {/* CLI terminal command */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Terminal CLI
          </span>
          <div className="pt-2 font-mono text-xs text-ink flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <code className="bg-paper-2 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 font-semibold">
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
          icon={copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedCli ? 'Copied' : 'Copy command'}
        </ChunkyButton>
      </div>
    </div>
  );
}
