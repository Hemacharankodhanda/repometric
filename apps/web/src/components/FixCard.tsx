'use client';

import React, { useState } from 'react';
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
    <div
      className={`rounded-card border-2 border-ink bg-card shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card overflow-hidden transition-all duration-[120ms] ${
        isDone ? 'opacity-65 bg-paper-2' : ''
      } ${className}`}
    >
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Left: Checkbox & Title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Local Mark Done checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isDone}
            onClick={() => onToggleDone?.(fix.id, !isDone)}
            aria-label={`Mark "${fix.title}" as done`}
            className={`w-5 h-5 rounded-md border-2 border-ink flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-card-sm ${
              isDone
                ? 'bg-lime text-ink'
                : 'bg-card hover:bg-paper-2'
            }`}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

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
            className={`text-sm sm:text-base font-bold text-ink truncate cursor-pointer ${
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-pill border-2 border-ink bg-paper-2 text-ink font-mono text-xs cursor-help shadow-card-sm">
                  {effortDesc}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs rounded-control border-2 border-ink bg-card text-ink shadow-card">
                Effort tier: {fix.effort} ({effortDesc})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse fix details' : 'Expand fix details'}
            className="w-7 h-7 rounded-control border-2 border-ink bg-paper-2 hover:bg-card text-ink flex items-center justify-center transition-all duration-[120ms] shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Why & How */}
      {expanded && (
        <div className="border-t-2 border-ink bg-paper-2 p-4 space-y-3 text-xs leading-relaxed">
          <div>
            <div className="font-bold text-ink mb-1 text-xs">Why it matters</div>
            <p className="text-ink-muted leading-relaxed">{fix.why}</p>
          </div>

          <div>
            <div className="font-bold text-ink mb-1 flex items-center">
              <span>How to fix</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-primary-text" />
            </div>
            <div className="text-ink font-mono text-xs bg-card p-3 rounded-control border-2 border-ink shadow-card-sm overflow-x-auto whitespace-pre-wrap">
              {fix.how}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
