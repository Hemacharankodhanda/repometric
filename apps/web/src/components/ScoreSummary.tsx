'use client';

import React, { useEffect, useState } from 'react';
import { Tilly } from './Tilly';
import { StickerBadge, type StickerVariant } from './StickerBadge';
import type { Grade } from '@repometric/core';

export interface ScoreSummaryProps {
  score: number;
  projectedScore?: number;
  grade?: Grade | string;
  verdict?: string;
  className?: string;
}

export function getGradeBadge(score: number): { label: string; variant: StickerVariant } {
  if (score >= 90) return { label: 'Excellent', variant: 'lime' };
  if (score >= 75) return { label: 'Good', variant: 'sky' };
  if (score >= 55) return { label: 'Needs work', variant: 'sun' };
  return { label: 'At risk', variant: 'coral' };
}

export function getTillyMood(score: number) {
  if (score >= 90) return 'celebrating' as const;
  if (score >= 75) return 'happy' as const;
  if (score >= 55) return 'neutral' as const;
  return 'worried' as const;
}

export function ScoreSummary({
  score,
  projectedScore,
  verdict,
  className = '',
}: ScoreSummaryProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    const duration = 900; // ms
    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(ease * score));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  const { label: gradeLabel, variant: gradeVariant } = getGradeBadge(score);
  const tillyMood = getTillyMood(score);
  const targetProjected = projectedScore !== undefined && projectedScore > score ? projectedScore : null;

  const defaultVerdict =
    score >= 90
      ? 'Exceptional repo hygiene! Comprehensive documentation, robust CI, and clean module boundaries.'
      : score >= 75
      ? 'Solid engineering foundations. Fixing the prioritized items below will lift health into the 90s.'
      : score >= 55
      ? 'Functional codebase that needs work. Adding a license, tests, and CI will deliver quick score gains.'
      : 'At risk. Missing core open-source essentials such as tests, license, or activity documentation.';

  const finalVerdict = verdict || defaultVerdict;

  return (
    <div
      className={`rounded-card border-2 border-ink bg-card p-6 sm:p-8 shadow-[4px_4px_0_var(--ink)] flex flex-col md:flex-row items-center md:items-start justify-between gap-6 ${className}`}
    >
      <div className="flex-1 space-y-4 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className="font-display font-extrabold text-score text-ink tracking-tight leading-none">
            {displayScore}
          </span>
          <div className="flex flex-col items-start space-y-1">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Health score
            </span>
            <StickerBadge variant={gradeVariant} size="lg" rotate="right">
              {gradeLabel}
            </StickerBadge>
          </div>
        </div>

        <p className="text-sm sm:text-base font-medium text-ink max-w-xl leading-relaxed">
          {finalVerdict}
        </p>

        {/* Projected score progress bar */}
        {targetProjected && (
          <div className="pt-1 space-y-1.5 max-w-md">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-ink">Current: {score}</span>
              <span className="text-primary-text">
                Projected with fixes: <span className="font-bold">{targetProjected}</span> (+{targetProjected - score} pts)
              </span>
            </div>
            <div className="h-4 w-full rounded-pill border-2 border-ink bg-paper-2 overflow-hidden flex">
              <div
                className="h-full bg-lime border-r-2 border-ink transition-all duration-500"
                style={{ width: `${Math.min(100, score)}%` }}
              />
              <div
                className="h-full bg-sun border-r-2 border-ink transition-all duration-500 opacity-80"
                style={{ width: `${Math.max(0, Math.min(100, targetProjected) - score)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-center">
        <Tilly mood={tillyMood} size={110} />
      </div>
    </div>
  );
}
