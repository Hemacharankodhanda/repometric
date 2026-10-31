import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { StickerBadge } from '../../components/StickerBadge';
import { mockReport } from '@repometric/core';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body selection:bg-lime selection:text-ink">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-primary-text hover:underline mb-3 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <StickerBadge variant="primary" size="sm">
              Deterministic Arithmetic Rules
            </StickerBadge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink tracking-tight">
            Scoring methodology
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-2 leading-relaxed">
            RepoMetric evaluates repository health across six distinct categories using
            deterministic, arithmetic rules. Every deduction links to concrete, inspectable
            evidence with zero subjective AI hallucination.
          </p>
        </div>

        <div className="space-y-6 pt-2">
          {mockReport.categories.map((category) => (
            <section
              key={category.id}
              className="p-6 rounded-card border-2 border-ink bg-card shadow-card space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-ink">{category.label}</h2>
                </div>
                <StickerBadge variant="sky" size="sm" rotate="none">
                  Weight: {category.weight}%
                </StickerBadge>
              </div>

              <div className="space-y-2.5 pt-1">
                {category.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start space-x-3 text-xs p-3 rounded-control bg-paper-2 border-2 border-ink shadow-card-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink">{signal.label}</div>
                      <div className="text-ink-muted mt-0.5 leading-relaxed">{signal.evidence}</div>
                    </div>
                    <div className="font-mono text-xs font-bold text-ink shrink-0">
                      {signal.earned} / {signal.max} pts
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="py-8 px-4 bg-paper-2 text-ink text-xs border-t-2 border-ink text-center">
        RepoMetric • Precision deterministic code intelligence
      </footer>
    </div>
  );
}
