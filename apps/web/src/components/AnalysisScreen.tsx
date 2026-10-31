'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export function AnalysisScreen({ repoName, onComplete, speedMultiplier = 1 }: AnalysisScreenProps) {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-8 relative"
    >
      {/* Tilly Scanning */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Tilly mood="scanning" size={100} />
      </motion.div>

      {/* Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-850">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Automated Telemetry Scanner</span>
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
          Analyzing {repoName}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
          Reading commit tree, calculating category weights, and generating map...
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full flex justify-center px-4">
        <Stepper steps={steps} currentStepIndex={currentStepIndex} />
      </div>

      {/* Rotating True Tip Box */}
      <div className="max-w-md w-full px-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 shadow-card flex items-start space-x-3 text-left">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-hidden min-h-[50px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-0.5">
              Good repo practice
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium text-ink leading-relaxed"
              >
                {TRUE_TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
