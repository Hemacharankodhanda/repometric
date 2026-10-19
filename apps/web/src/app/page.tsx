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

          <div className="flex items-center space-x-2 text-xs text-ink-muted pt-1">
            <span>Try an example:</span>
            <Link href="/r/facebook/react" className="text-teal hover:underline font-mono">
              facebook/react
            </Link>
          </div>
        </section>

        {/* Live Example Map */}
        <section className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium text-ink">
              Live preview: interactive treemap of a React codebase
            </span>
            <span>Click any folder to zoom into its contents</span>
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
