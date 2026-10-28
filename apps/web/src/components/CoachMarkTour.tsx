'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tilly } from './Tilly';
import { ChunkyButton } from './ChunkyButton';
import { X, ArrowRight, Check } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  mood: 'happy' | 'celebrating' | 'scanning' | 'idle';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-score',
    title: '1/3 Health Score & Verdict',
    content:
      'Your deterministic 0–100 health score is calculated across 6 categories and 23 checks. Every single point has a receipt.',
    mood: 'happy',
  },
  {
    targetId: 'tour-fixes',
    title: '2/3 Prioritized Fix List',
    content:
      'Every deduction generates an actionable fix ranked by score payoff per effort. Check "Mark done" locally to watch your projected score rise.',
    mood: 'celebrating',
  },
  {
    targetId: 'tour-map',
    title: '3/3 Interactive Code Map',
    content:
      'Explore all files as zoomable tiles. Bigger tiles represent larger files. Click any directory to dive inside.',
    mood: 'scanning',
  },
];

export function CoachMarkTour({
  forceOpen = false,
  onComplete,
}: {
  forceOpen?: boolean;
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }

    try {
      const seen = localStorage.getItem('repometric_tour_seen');
      if (!seen) {
        // Small delay so user sees page load first
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage security exceptions
    }
    return undefined;
  }, [forceOpen]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('repometric_tour_seen', 'true');
    } catch {
      // Ignore
    }
    setIsOpen(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  // Keyboard navigation: Escape to skip, Enter or ArrowRight to advance
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="RepoMetric first-run tour"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] animate-in fade-in-50 duration-200"
    >
      <div
        ref={cardRef}
        className="w-full max-w-md rounded-card border-2 border-ink bg-card p-5 sm:p-6 shadow-[6px_6px_0_var(--ink)] space-y-4 focus:outline-none"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Tilly mood={step.mood} size={48} className="shrink-0" />
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary-text">
                Quick tour
              </span>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-ink">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Skip tour"
            className="p-1 rounded-control border-2 border-ink bg-paper-2 hover:bg-paper text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{step.content}</p>

        {/* Step indicator dots and actions */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-ink">
          <div className="flex space-x-1.5" aria-hidden="true">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full border border-ink transition-all ${
                  idx === currentStep ? 'w-6 bg-primary' : 'w-2 bg-paper-2'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-bold text-ink-muted hover:text-ink px-2 py-1"
            >
              Skip
            </button>
            <ChunkyButton
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="flex items-center space-x-1"
            >
              <span>{isLast ? 'Got it!' : 'Next'}</span>
              {isLast ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </ChunkyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
