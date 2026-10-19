import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { mockFiles } from '@repometric/core';
import { Header } from '../components/Header';
import { RepoInput } from '../components/RepoInput';

// Lazy-load RepoMap for fast first-load JS budget
const RepoMap = dynamic(() => import('@repometric/viz').then((mod) => mod.RepoMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-panel border border-line bg-surface/50 animate-pulse flex items-center justify-center text-xs text-ink-muted">
      Loading interactive map...
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Intro & Repo Input */}
        <section className="max-w-2xl space-y-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            See the shape and health of any public repository
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            RepoMetric produces a deterministic 0–100 health score with evidence for every
            deduction, a zoomable treemap of files, and a dependency graph.
          </p>

          <div className="pt-2">
            <RepoInput />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-ink-muted">Popular repositories:</span>
            {[
              { owner: 'facebook', repo: 'react' },
              { owner: 'expressjs', repo: 'express' },
              { owner: 'vuejs', repo: 'core' },
              { owner: 'astral-sh', repo: 'uv' },
              { owner: 'shadcn-ui', repo: 'ui' },
            ].map((r) => (
              <Link
                key={`${r.owner}/${r.repo}`}
                href={`/r/${r.owner}/${r.repo}`}
                className="px-2 py-0.5 rounded-control bg-surface border border-line text-ink font-mono text-[11px] hover:border-teal hover:text-teal transition-colors"
              >
                {r.owner}/{r.repo}
              </Link>
            ))}
          </div>
        </section>

        {/* Live Treemap Preview */}
        <section className="space-y-2 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-muted">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-ink">
                Interactive codebase treemap
              </span>
              <span>• Click any folder to zoom into its contents</span>
            </div>
            <Link
              href="/r/facebook/react"
              className="text-teal hover:underline font-mono text-[11px]"
            >
              Analyze facebook/react live &rarr;
            </Link>
          </div>

          <RepoMap files={mockFiles} height={560} />
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-muted">
        <p>
          RepoMetric runs deterministically at $0 cost on free tiers. Zero AI APIs. Never executes
          analyzed code.
        </p>
      </footer>
    </div>
  );
}
