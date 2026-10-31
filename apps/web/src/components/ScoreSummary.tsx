'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Tilly } from './Tilly';
import { StickerBadge, type StickerVariant } from './StickerBadge';
import type { Grade } from '@repometric/core';
import { ShieldCheck, Sparkles } from 'lucide-react';

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
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    const duration = 900;
    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
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
  const targetProjected =
    projectedScore !== undefined && projectedScore > score ? projectedScore : null;

  const defaultVerdict =
    score >= 90
      ? 'Exceptional repo hygiene! Comprehensive documentation, robust CI, and clean module boundaries.'
      : score >= 75
        ? 'Solid engineering foundations. Fixing the prioritized items below will lift health into the 90s.'
        : score >= 55
          ? 'Functional codebase that needs work. Adding a license, tests, and CI will deliver quick score gains.'
          : 'At risk. Missing core open-source essentials such as tests, license, or activity documentation.';

  const finalVerdict = verdict || defaultVerdict;

  // Circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  const strokeColor =
    score >= 90 ? '#10b981' : score >= 75 ? '#06b6d4' : score >= 55 ? '#f59e0b' : '#f43f5e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-card border border-slate-200/90 dark:border-slate-800/90 bg-card p-6 sm:p-8 shadow-sm dark:shadow-xl dark:shadow-indigo-950/10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative overflow-hidden ${className}`}
    >
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />

      {/* Radial Health Gauge */}
      <div className="shrink-0 flex flex-col items-center justify-center relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800/80"
            />
            {/* Animated progress arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          {/* Inner Score Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display font-extrabold text-4xl sm:text-5xl text-ink tracking-tight leading-none">
              {displayScore}
            </span>
            <span className="text-[11px] font-mono font-semibold text-ink-muted uppercase tracking-wider mt-1">
              / 100
            </span>
          </div>
        </div>

        <div className="mt-3">
          <StickerBadge variant={gradeVariant} size="md">
            {gradeLabel}
          </StickerBadge>
        </div>
      </div>

      {/* Score Insights & Verdict */}
      <div className="flex-1 space-y-4 text-center md:text-left z-10 w-full">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Health Assessment
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
            Overall Repository Health
          </h2>
        </div>

        <p className="text-sm sm:text-base font-normal text-ink-muted max-w-xl leading-relaxed">
          {finalVerdict}
        </p>

        {/* Projected score progress bar */}
        {targetProjected && (
          <div className="pt-2 space-y-2 max-w-md">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-ink flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Current: <span className="font-bold">{score}</span>
              </span>
              <span className="text-primary-text flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Projected: <span className="font-bold text-primary">{targetProjected}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  (+{targetProjected - score} pts)
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-l-full"
                style={{ width: `${Math.min(100, score)}%` }}
              />
              <div
                className="h-full bg-emerald-400 dark:bg-emerald-500 transition-all duration-500 opacity-90 rounded-r-full"
                style={{ width: `${Math.max(0, Math.min(100, targetProjected) - score)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mascot Companion */}
      <div className="shrink-0 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
        <Tilly mood={tillyMood} size={84} />
      </div>
    </motion.div>
  );
}
