'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Activity,
  GitPullRequest,
  Users,
  FileText,
  ShieldCheck,
  Boxes,
} from 'lucide-react';
import type { CategoryResult, SignalResult, SignalStatus } from '@repometric/core';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';

const CATEGORY_STYLES: Record<string, { bg: string; icon: React.ReactNode }> = {
  activity: { bg: 'bg-primary/20', icon: <Activity className="w-4 h-4 text-primary-text" /> },
  maintenance: { bg: 'bg-lime/30', icon: <GitPullRequest className="w-4 h-4 text-ink" /> },
  community: { bg: 'bg-sky/30', icon: <Users className="w-4 h-4 text-ink" /> },
  documentation: { bg: 'bg-sun/30', icon: <FileText className="w-4 h-4 text-ink" /> },
  hygiene: { bg: 'bg-lime/30', icon: <ShieldCheck className="w-4 h-4 text-ink" /> },
  dependencies: { bg: 'bg-coral/25', icon: <Boxes className="w-4 h-4 text-coral-text" /> },
};

const CATEGORY_EXPLANATIONS: Record<string, string> = {
  activity: 'Measures recent commit frequency, cadence consistency, and release velocity.',
  maintenance: 'Checks issue and pull-request triage speed, close rates, and stale backlog health.',
  community: 'Evaluates contributor diversity, open governance, contributing guidelines, and code of conduct.',
  documentation: 'Inspects README comprehensiveness, quickstart clarity, examples, and license existence.',
  hygiene: 'Verifies automated CI testing, .gitignore structure, secrets hygiene, and branch protection.',
  dependencies: 'Analyzes outdated package counts, pinned dependencies, security vulnerabilities, and bloat.',
};

function getSignalIcon(status: SignalStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-4 h-4 text-lime stroke-[2.5] shrink-0" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-sun stroke-[2.5] shrink-0" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-coral-text stroke-[2.5] shrink-0" />;
    case 'no_data':
    case 'na':
      return <HelpCircle className="w-4 h-4 text-ink-muted shrink-0" />;
  }
}

export function CategoryRow({ category }: { category: CategoryResult }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.min(100, Math.round((category.earned / category.weight) * 100));

  const explanation =
    CATEGORY_EXPLANATIONS[category.id] ||
    'Evaluates repository engineering health against deterministic open-source benchmarks.';

  return (
    <div className="rounded-control border-2 border-ink bg-card shadow-[2px_2px_0_var(--ink)] overflow-hidden transition-all">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`p-1.5 rounded-[6px] border-2 border-ink ${CATEGORY_STYLES[category.id]?.bg || 'bg-paper-2'} shadow-[1px_1px_0_var(--ink)]`}>
                {CATEGORY_STYLES[category.id]?.icon || <Activity className="w-4 h-4" />}
              </span>
              <span className="text-sm sm:text-base font-bold text-ink">{category.label}</span>

              {/* What's this? popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center text-[11px] font-semibold text-primary-text hover:underline focus:outline-none"
                    aria-label={`What is ${category.label}?`}
                  >
                    <span>What&apos;s this?</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 text-xs border-2 border-ink bg-card shadow-[4px_4px_0_var(--ink)] text-ink">
                  <p className="font-bold mb-1 text-ink">{category.label}</p>
                  <p className="text-ink-muted leading-relaxed">{explanation}</p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="font-mono text-xs sm:text-sm font-extrabold text-ink">
              {category.earned.toFixed(1)}{' '}
              <span className="text-ink-muted font-normal text-xs">/ {category.weight} pts</span>
            </div>
          </div>

          {/* Thick progress bar with ink outline */}
          <div className="w-full h-3.5 rounded-pill border-2 border-ink bg-paper-2 overflow-hidden">
            <div
              className={`h-full border-r-2 border-ink transition-all duration-500 ${
                percentage >= 75 ? 'bg-lime' : percentage >= 50 ? 'bg-sun' : 'bg-coral'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse checks' : 'Expand checks'}
          className="p-1.5 rounded-control border-2 border-ink bg-paper-2 hover:bg-lime text-ink shadow-[2px_2px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Evidence / Signals List */}
      {expanded && (
        <div className="border-t-2 border-ink bg-paper-2 p-3 sm:p-4 space-y-2">
          {category.signals.map((signal: SignalResult) => (
            <div
              key={signal.id}
              className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-control bg-card border-2 border-ink shadow-[2px_2px_0_var(--ink)]"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <span className="pt-0.5">{getSignalIcon(signal.status)}</span>
                <div>
                  <div className="font-bold text-ink">{signal.label}</div>
                  <div className="text-ink-muted text-[11px] mt-0.5 leading-relaxed">
                    {signal.evidence}
                  </div>
                </div>
              </div>

              <div className="font-mono text-xs font-bold text-ink shrink-0 pt-0.5">
                {signal.earned} / {signal.max}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
