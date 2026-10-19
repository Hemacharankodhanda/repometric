'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progressText?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export function Stepper({ steps, currentStepIndex, className = '' }: StepperProps) {
  return (
    <div className={`w-full max-w-md space-y-3 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex || step.status === 'completed';
        const isActive = idx === currentStepIndex || step.status === 'active';

        return (
          <div
            key={step.id}
            className={`flex items-center space-x-3 p-2.5 rounded-control border-2 transition-all duration-200 ${
              isActive
                ? 'border-ink bg-sun/20 shadow-[3px_3px_0_var(--ink)] scale-[1.02]'
                : isCompleted
                ? 'border-ink/60 bg-lime/10'
                : 'border-ink/20 bg-card/40 opacity-60'
            }`}
          >
            {/* Step badge icon */}
            <div
              className={`w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                isCompleted
                  ? 'bg-lime text-ink'
                  : isActive
                  ? 'bg-sun text-ink shadow-[1px_1px_0_var(--ink)]'
                  : 'bg-paper-2 text-ink-muted'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Label and optional progress detail */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs sm:text-sm font-semibold truncate ${
                  isActive ? 'text-ink' : isCompleted ? 'text-ink/80' : 'text-ink-muted'
                }`}
              >
                {step.label}
              </p>
              {isActive && step.progressText && (
                <p className="text-[11px] font-mono text-ink-muted truncate">
                  {step.progressText}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
