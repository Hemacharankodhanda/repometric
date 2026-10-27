'use client';

import React, { useState, useEffect } from 'react';
import { Tilly } from './Tilly';
import { Stepper, type StepItem } from './Stepper';
import { Lightbulb, Sparkles } from 'lucide-react';

const TRUE_TIPS = [
  'A good README has install steps, usage and a screenshot.',
  'An open-source license allows developers and enterprises to safely contribute.',
  'Automated CI workflows catch regression bugs before code hits the main branch.',
  'Keeping your .gitignore tidy prevents leaking private credentials or environment files.',
  'Tagging frequent releases gives consumers clear milestones and change notes.',
  'A CONTRIBUTING.md guide lowers the barrier to entry for first-time contributors.',
];

const INITIAL_STEPS: StepItem[] = [
  { id: '1', label: 'Finding the repo', status: 'active' },
  { id: '2', label: 'Reading commits and issues', status: 'pending' },
  { id: '3', label: 'Checking docs, tests and CI', status: 'pending' },
  { id: '4', label: 'Counting dependencies', status: 'pending' },
  { id: '5', label: 'Drawing the map', status: 'pending' },
  { id: '6', label: 'Mapping imports', status: 'pending', progressText: '12 of 340 files' },
];

export interface AnalysisScreenProps {
  repoName: string;
  onComplete: () => void;
  speedMultiplier?: number;
}

export function AnalysisScreen({
  repoName,
  onComplete,
  speedMultiplier = 1,
}: AnalysisScreenProps) {
  const [steps, setSteps] = useState<StepItem[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 2.4 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TRUE_TIPS.length);
    }, 2400);
    return () => clearInterval(tipInterval);
  }, []);

  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Advance stepper stages smoothly
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const timer = setTimeout(() => onCompleteRef.current(), 800);
      return () => clearTimeout(timer);
    }

    const stepDuration = 320 / speedMultiplier;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next < INITIAL_STEPS.length) {
          setSteps((oldSteps) =>
            oldSteps.map((s, idx) => ({
              ...s,
              status: idx < next ? 'completed' : idx === next ? 'active' : 'pending',
              progressText: idx === 5 && next === 5 ? '340 of 340 files' : s.progressText,
            })),
          );
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 250);
          return prev;
        }
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [speedMultiplier]);

  return (
    <div className="w-full py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in-50 duration-300 relative">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Tilly Scanning */}
      <div className="relative z-10">
        <Tilly mood="scanning" size={100} />
      </div>

      {/* Heading */}
      <div className="space-y-1.5 z-10">
        <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Telemetry Scanner</span>
        </div>
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
          Analyzing {repoName}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Reading commit tree, calculating category weights, and generating map...
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full flex justify-center px-4 z-10">
        <Stepper steps={steps} currentStepIndex={currentStepIndex} />
      </div>

      {/* Rotating True Tip Box */}
      <div className="max-w-md w-full px-4 z-10">
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-4 shadow-sm flex items-start space-x-3 text-left">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-0.5">
              Good repo practice
            </span>
            <p className="text-xs font-medium text-ink leading-relaxed transition-opacity duration-300">
              {TRUE_TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
