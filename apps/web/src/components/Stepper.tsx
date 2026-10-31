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
    <div className={`w-full max-w-md space-y-2.5 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex || step.status === 'completed';
        const isActive = idx === currentStepIndex || step.status === 'active';

        return (
          <div
            key={step.id}
            className={`flex items-center space-x-3 p-3 rounded-control border-2 border-ink transition-all duration-[120ms] ${
              isActive
                ? 'bg-paper-2 shadow-card scale-[1.01]'
                : isCompleted
                  ? 'bg-card shadow-card-sm'
                  : 'bg-card border-ink/30 opacity-60'
            }`}
          >
            {/* Step badge icon */}
            <div
              className={`w-7 h-7 rounded-control border-2 border-ink flex items-center justify-center shrink-0 font-mono text-xs font-bold shadow-card-sm ${
                isCompleted
                  ? 'bg-lime text-ink'
                  : isActive
                    ? 'bg-primary text-white'
                    : 'bg-paper-2 text-ink-muted border-ink/40'
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
                className={`text-xs sm:text-sm font-bold truncate ${
                  isActive ? 'text-ink' : isCompleted ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {step.label}
              </p>
              {isActive && step.progressText && (
                <p className="text-[11px] font-mono text-primary-text font-bold truncate">
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
