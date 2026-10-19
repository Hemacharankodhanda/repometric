import React from 'react';
import { CORE_VERSION } from '@repo-analyzer/core';
import { VisualizerStub } from '@repo-analyzer/viz';

export default function HomePage() {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-heading text-ink">Repometric</h1>
        <p className="text-ink-muted">
          Public GitHub repository health, map & dependency visualizer
        </p>
      </header>

      <section className="p-4 bg-surface rounded-panel border border-line">
        <VisualizerStub label="Welcome to Repometric" />
        <p className="text-xs text-ink-muted mt-2">Core engine v{CORE_VERSION}</p>
      </section>
    </main>
  );
}
