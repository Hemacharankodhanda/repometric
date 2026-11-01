'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Fix } from '@repometric/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

export interface FixCardProps {
  fix: Fix;
  isDone?: boolean;
  onToggleDone?: (fixId: string, done: boolean) => void;
  className?: string;
}

export function getEffortDescription(effort: 'S' | 'M' | 'L'): string {
  switch (effort) {
    case 'S':
      return 'about 10 min';
    case 'M':
      return 'about 2 hours';
    case 'L':
      return 'a project';
  }
}

export function FixCard({ fix, isDone = false, onToggleDone, className = '' }: FixCardProps) {
  const [expanded, setExpanded] = useState(false);
  const effortDesc = getEffortDescription(fix.effort);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`gh-box hover:border-slate-400 dark:hover:border-slate-600 transition-colors overflow-hidden ${
        isDone ? 'opacity-60 bg-[var(--paper)]' : ''
      } ${className}`}
    >
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Left: GitHub Issue Status & Checkbox & Title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Issue state indicator / Checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isDone}
            onClick={() => onToggleDone?.(fix.id, !isDone)}
            aria-label={`Mark "${fix.title}" as resolved`}
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isDone
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-[var(--border-color)] bg-[var(--card)] hover:border-primary text-ink-muted'
            }`}
            title={isDone ? 'Resolved (click to reopen)' : 'Open fix item (click to mark done)'}
          >
            {isDone ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          {/* Points Gain Pill */}
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${
              isDone
                ? 'bg-slate-200/50 dark:bg-slate-800 text-ink-muted border-[var(--border-color)]'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            }`}
          >
            +{fix.pointsGain.toFixed(1)} pts
          </span>

          <span
            className={`text-xs sm:text-sm font-semibold text-ink truncate cursor-pointer select-none transition-all hover:text-primary ${
              isDone ? 'line-through text-ink-muted' : ''
            }`}
            onClick={() => setExpanded(!expanded)}
          >
            {fix.title}
          </span>
        </div>

        {/* Right: GitHub Effort Label & Expand toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--paper)] text-ink-muted font-mono text-[11px] cursor-help">
                  {effortDesc}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs rounded-md border border-[var(--border-color)] bg-[var(--card)] text-ink shadow-md">
                Effort tier: {fix.effort} ({effortDesc})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse fix details' : 'Expand fix details'}
            className="w-7 h-7 rounded-md border border-[var(--border-color)] bg-[var(--paper)] hover:bg-slate-200/60 dark:hover:bg-slate-800 text-ink-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Why & How: GitHub Issue Comment Styling */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--border-color)] bg-[var(--paper)] p-4 space-y-3 text-xs leading-relaxed overflow-hidden"
          >
            <div>
              <div className="font-semibold text-ink mb-1 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Why it matters</span>
              </div>
              <p className="text-ink-muted leading-relaxed pl-5">{fix.why}</p>
            </div>

            <div>
              <div className="font-semibold text-ink mb-1 flex items-center space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
                <span>Resolution steps</span>
              </div>
              <div className="text-ink font-mono text-xs bg-[var(--card)] p-3 rounded-md border border-[var(--border-color)] overflow-x-auto whitespace-pre-wrap ml-5">
                {fix.how}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
