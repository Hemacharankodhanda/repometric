'use client';

import React from 'react';
import { motion } from 'motion/react';
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
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
              isActive
                ? 'border-primary/40 bg-primary/5 shadow-sm scale-[1.01]'
                : isCompleted
                  ? 'border-emerald-500/25 bg-emerald-500/5'
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-card/40 opacity-50'
            }`}
          >
            {/* Step badge icon */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-semibold ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                  : isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-paper-2 text-ink-muted border border-slate-200 dark:border-slate-800'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : isActive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Label and optional progress detail */}
            <div className="flex-1 min-w-0 text-left">
              <p
                className={`text-xs sm:text-sm font-semibold truncate ${
                  isActive ? 'text-ink' : isCompleted ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {step.label}
              </p>
              {isActive && step.progressText && (
                <p className="text-[11px] font-mono text-primary font-medium truncate">
                  {step.progressText}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
