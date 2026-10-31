'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight, Check } from 'lucide-react';
import type { Fix } from '@repometric/core';
import { StickerBadge } from './StickerBadge';
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
      className={`rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden transition-all ${
        isDone ? 'opacity-60 bg-paper-2' : ''
      } ${className}`}
    >
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Left: Checkbox & Title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Local Mark Done checkbox */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            role="checkbox"
            aria-checked={isDone}
            onClick={() => onToggleDone?.(fix.id, !isDone)}
            aria-label={`Mark "${fix.title}" as done`}
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isDone
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-700 bg-card hover:border-primary'
            }`}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </motion.button>

          {/* Points Gain Sticker */}
          <StickerBadge
            variant={isDone ? 'card' : 'lime'}
            size="sm"
            rotate="none"
            className="shrink-0"
            dot={!isDone}
          >
            +{fix.pointsGain.toFixed(1)} pts
          </StickerBadge>

          <span
            className={`text-sm sm:text-base font-semibold text-ink truncate cursor-pointer select-none transition-all ${
              isDone ? 'line-through text-ink-muted' : ''
            }`}
            onClick={() => setExpanded(!expanded)}
          >
            {fix.title}
          </span>
        </div>

        {/* Right: Effort Chip & Expand toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-paper-2 text-ink-muted font-mono text-xs cursor-help">
                  {effortDesc}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-card text-ink shadow-md">
                Effort tier: {fix.effort} ({effortDesc})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse fix details' : 'Expand fix details'}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-paper-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Why & How with Framer Motion */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3 text-xs leading-relaxed overflow-hidden"
          >
            <div>
              <div className="font-semibold text-ink mb-1 text-xs">Why it matters</div>
              <p className="text-ink-muted leading-relaxed">{fix.why}</p>
            </div>

            <div>
              <div className="font-semibold text-ink mb-1 flex items-center">
                <span>How to fix</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-primary" />
              </div>
              <div className="text-ink font-mono text-xs bg-card dark:bg-slate-950 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                {fix.how}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
