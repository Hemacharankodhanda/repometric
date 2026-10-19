'use client';

import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import type { Fix } from '@repometric/core';
import { getEffortLabel } from './ScoreRail';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

export function FixItem({ fix }: { fix: Fix }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-line rounded-control bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-fog/10 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-3 min-w-0 pr-2">
          {/* Points Gain Pill */}
          <span className="shrink-0 px-2 py-0.5 rounded-control bg-moss/15 text-moss-text font-mono text-xs font-semibold">
            +{fix.pointsGain.toFixed(1)}
          </span>

          <span className="text-sm font-medium text-ink truncate">{fix.title}</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="px-2 py-0.5 rounded-control bg-fog/30 text-ink-muted text-xs font-mono font-semibold cursor-help">
                  {fix.effort}
                </span>
              </TooltipTrigger>
              <TooltipContent>{getEffortLabel(fix.effort)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable Why & How */}
      {expanded && (
        <div className="border-t border-line bg-paper/40 p-4 space-y-3 text-xs leading-relaxed">
          <div>
            <div className="font-semibold text-ink mb-1">Why it matters</div>
            <p className="text-ink-muted">{fix.why}</p>
          </div>

          <div>
            <div className="font-semibold text-ink mb-1 flex items-center">
              <span>How to fix</span>
              <ArrowRight className="w-3 h-3 ml-1 text-teal" />
            </div>
            <p className="text-ink-muted font-mono text-[11px] bg-surface p-2.5 rounded-control border border-line">
              {fix.how}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
