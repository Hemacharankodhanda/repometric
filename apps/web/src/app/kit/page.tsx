'use client';

import React, { useState } from 'react';
import { Tilly, type TillyMood } from '../../components/Tilly';
import { StickerBadge } from '../../components/StickerBadge';
import { ChunkyButton } from '../../components/ChunkyButton';
import { RepoInput } from '../../components/RepoInput';
import { Stepper, type StepItem } from '../../components/Stepper';
import { ScoreSummary } from '../../components/ScoreSummary';
import { CategoryRow } from '../../components/CategoryRow';
import { FixCard } from '../../components/FixCard';
import { InsightCard } from '../../components/InsightCard';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { ReadingGuide } from '../../components/ReadingGuide';
import { Toast } from '../../components/Toast';
import { ThemeToggle } from '../../components/ThemeToggle';
import type { CategoryResult, Fix } from '@repometric/core';
import { ArrowLeft, Sparkles, Star, FileCode, Shield } from 'lucide-react';
import Link from 'next/link';

const TILLY_MOODS: TillyMood[] = [
  'idle',
  'scanning',
  'happy',
  'celebrating',
  'neutral',
  'worried',
  'lost',
];

const SAMPLE_CATEGORY: CategoryResult = {
  id: 'documentation',
  label: 'Documentation',
  weight: 20,
  earned: 16.5,
  excluded: false,
  signals: [
    {
      id: 'doc-readme',
      categoryId: 'documentation',
      label: 'Comprehensive README',
      status: 'pass',
      earned: 10,
      max: 10,
      evidence: 'Found 1,840-word README with installation, usage, and visual demo screenshot.',
    },
    {
      id: 'doc-license',
      categoryId: 'documentation',
      label: 'Open Source License',
      status: 'pass',
      earned: 4,
      max: 4,
      evidence: 'MIT License identified in root LICENSE file.',
    },
    {
      id: 'doc-contributing',
      categoryId: 'documentation',
      label: 'Contributing Guidelines',
      status: 'partial',
      earned: 2.5,
      max: 6,
      evidence: 'CONTRIBUTING.md exists but lacks local environment setup guide.',
    },
  ],
};

const SAMPLE_FIX: Fix = {
  id: 'fix-1',
  signalId: 'hygiene.ci',
  title: 'Add continuous integration workflow',
  pointsGain: 4.5,
  effort: 'S',
  priority: 1,
  why: 'Automated CI tests catch regression bugs before they reach default branch.',
  how: 'Create .github/workflows/ci.yml running pnpm test on pull requests.',
};

const SAMPLE_STEPS: StepItem[] = [
  { id: '1', label: 'Finding the repo', status: 'completed' },
  { id: '2', label: 'Reading commits and issues', status: 'completed' },
  { id: '3', label: 'Checking docs, tests and CI', status: 'active', progressText: 'Analyzing 4 workflows...' },
  { id: '4', label: 'Drawing the map', status: 'pending' },
];

export default function KitPage() {
  const [showToast, setShowToast] = useState(false);
  const [fixDone, setFixDone] = useState(false);

  return (
    <div className="min-h-screen bg-paper text-ink p-4 sm:p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-text hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight">
              Design System & Component Kit
            </h1>
            <StickerBadge variant="lime" rotate="right">
              Playful Field Guide
            </StickerBadge>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Tactile stickers, 2px ink outlines, hard shadows, and the Tilly mascot.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
        </div>
      </div>

      {/* 1. Mascot: Tilly */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">1. The Mascot: Tilly</h2>
          <span className="text-xs font-mono text-ink-muted">7 mood states</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {TILLY_MOODS.map((mood) => (
            <div
              key={mood}
              className="p-4 rounded-control border-2 border-ink bg-card text-center shadow-[3px_3px_0_var(--ink)] flex flex-col items-center justify-between space-y-2 hover:-translate-y-1 transition-transform"
            >
              <Tilly mood={mood} size={72} />
              <div className="font-mono text-xs font-bold capitalize text-ink">
                {mood}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Sticker Badges */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">2. Sticker Badges</h2>
          <span className="text-xs font-mono text-ink-muted">flat fills + hard shadows</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center p-6 rounded-card border-2 border-ink bg-paper-2 bg-dots">
          <StickerBadge variant="lime" rotate="left">Excellent 92</StickerBadge>
          <StickerBadge variant="sky" rotate="right">Good 81</StickerBadge>
          <StickerBadge variant="sun" rotate="left">Needs work 68</StickerBadge>
          <StickerBadge variant="coral" rotate="right">At risk 42</StickerBadge>
          <StickerBadge variant="primary" rotate="left">Free / Open Source</StickerBadge>
          <StickerBadge variant="card" rotate="right">+4 pts</StickerBadge>
          <StickerBadge variant="sun" size="lg" rotate="none">Featured Sample</StickerBadge>
        </div>
      </section>

      {/* 3. Chunky Buttons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">3. Chunky Buttons</h2>
          <span className="text-xs font-mono text-ink-muted">hover lift & press sink</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center p-6 rounded-card border-2 border-ink bg-card shadow-[4px_4px_0_var(--ink)]">
          <ChunkyButton variant="primary" size="lg" icon={<Sparkles className="w-5 h-5" />}>
            Primary Action
          </ChunkyButton>
          <ChunkyButton variant="secondary" size="md">
            Secondary
          </ChunkyButton>
          <ChunkyButton variant="lime" size="md" icon={<Star className="w-4 h-4" />}>
            Highlight Lime
          </ChunkyButton>
          <ChunkyButton variant="coral" size="sm">
            Warning / Coral
          </ChunkyButton>
          <ChunkyButton variant="ghost" size="sm">
            Ghost Link
          </ChunkyButton>
          <ChunkyButton variant="primary" size="sm" onClick={() => setShowToast(true)}>
            Trigger Toast
          </ChunkyButton>
        </div>
      </section>

      {/* 4. Repo Input */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">4. RepoInput</h2>
          <span className="text-xs font-mono text-ink-muted">attached button & chips</span>
        </div>
        <div className="p-6 rounded-card border-2 border-ink bg-paper-2">
          <RepoInput defaultValue="expressjs/express" />
        </div>
      </section>

      {/* 5. Score Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">5. ScoreSummary</h2>
          <span className="text-xs font-mono text-ink-muted">animated numeral count-up</span>
        </div>
        <ScoreSummary score={78} projectedScore={89} />
      </section>

      {/* 6. Categories, Fixes & Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">6. Cards & Rows</h2>
          <span className="text-xs font-mono text-ink-muted">CategoryRow, FixCard, InsightCard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wider">
              Category Row with Popover
            </h3>
            <CategoryRow category={SAMPLE_CATEGORY} />

            <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wider pt-2">
              FixCard with Local Mark Done
            </h3>
            <FixCard
              fix={SAMPLE_FIX}
              isDone={fixDone}
              onToggleDone={(_, done) => setFixDone(done)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wider">
              Insight Cards (Bento style)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InsightCard
                label="Most Depended On"
                value="src/core.ts"
                subtext="Imported by 48 separate files"
                icon={<FileCode className="w-4 h-4" />}
                badge="Hub file"
              />
              <InsightCard
                label="Circular Imports"
                value="0"
                subtext="Clean acyclic dependency tree"
                icon={<Shield className="w-4 h-4" />}
                badge="Safe"
              />
            </div>

            <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wider pt-2">
              Analysis Stepper
            </h3>
            <Stepper steps={SAMPLE_STEPS} currentStepIndex={2} />
          </div>
        </div>
      </section>

      {/* 7. Reading Guides & Empty States */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-bold text-xl text-ink">7. Visualizer Guide & States</h2>
        </div>
        <div className="space-y-4">
          <ReadingGuide type="map" />
          <ReadingGuide type="graph" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <EmptyState
            mood="lost"
            title="Couldn't find that repo"
            description="Check the spelling, and make sure it is public on GitHub."
            actionText="Try another repo"
          />
          <ErrorState
            mood="worried"
            title="GitHub rate limit reached"
            message="GitHub allows 60 requests per hour for unauthenticated clients."
            solution="Wait 15 minutes or provide your personal GitHub token in settings."
          />
        </div>
      </section>

      {/* Toast sample */}
      {showToast && (
        <Toast
          message="Badge copied to clipboard!"
          variant="lime"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
