import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { mockReport } from '@repometric/core';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body selection:bg-indigo-500/20 selection:text-ink">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline mb-3 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium border border-[var(--border-color)] bg-[var(--paper)] text-ink-muted">
              Deterministic AST Rules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            Scoring methodology &amp; rules
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
            RepoMetric evaluates repository engineering health across six weighted dimensions using
            deterministic rules. Every point gained or deducted maps directly to inspectable AST
            evidence with zero subjective AI hallucination.
          </p>
        </div>

        <div className="space-y-6 pt-1">
          {mockReport.categories.map((category) => (
            <section
              key={category.id}
              className="gh-box overflow-hidden shadow-sm"
            >
              <div className="gh-box-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-ink">{category.label}</h2>
                </div>
                <span className="gh-counter font-mono">
                  Weight: {category.weight}%
                </span>
              </div>

              <div className="divide-y divide-[var(--border-color)] bg-[var(--card)]">
                {category.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start space-x-3 text-xs p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink">{signal.label}</div>
                      <div className="text-ink-muted text-[11px] mt-0.5 leading-relaxed">{signal.evidence}</div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-ink shrink-0">
                      {signal.earned} / {signal.max} pts
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="py-6 px-4 bg-[var(--paper)] text-ink-muted text-xs border-t border-[var(--border-color)] text-center">
        RepoMetric • Deterministic Code Intelligence &amp; Visualizers
      </footer>
    </div>
  );
}
