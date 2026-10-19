import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { mockReport } from '@repometric/core';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs text-teal hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to home</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Scoring methodology
          </h1>
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">
            RepoMetric evaluates repository health across six distinct categories using
            deterministic, arithmetic rules. Every deduction links to concrete, inspectable
            evidence.
          </p>
        </div>

        <div className="space-y-6 pt-4 border-t border-line">
          {mockReport.categories.map((category) => (
            <section
              key={category.id}
              className="p-5 rounded-panel border border-line bg-surface space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">{category.label}</h2>
                <span className="text-xs font-mono font-medium text-teal px-2 py-0.5 rounded-control bg-teal/10">
                  Weight: {category.weight}%
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {category.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start space-x-2.5 text-xs p-2 rounded-control bg-paper/60 border border-line"
                  >
                    <CheckCircle2 className="w-4 h-4 text-moss-text shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-ink">{signal.label}</div>
                      <div className="text-ink-muted mt-0.5">{signal.evidence}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
