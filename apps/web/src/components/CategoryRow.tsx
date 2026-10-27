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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  activity: {
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: <Activity className="w-4 h-4" />,
  },
  maintenance: {
    bg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    icon: <GitPullRequest className="w-4 h-4" />,
  },
  community: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <Users className="w-4 h-4" />,
  },
  documentation: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: <FileText className="w-4 h-4" />,
  },
  hygiene: {
    bg: 'bg-teal-500/10 border-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  dependencies: {
    bg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    icon: <Boxes className="w-4 h-4" />,
  },
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
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
    case 'no_data':
    case 'na':
      return <HelpCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />;
  }
}

export function CategoryRow({ category }: { category: CategoryResult }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.min(100, Math.round((category.earned / category.weight) * 100));

  const explanation =
    CATEGORY_EXPLANATIONS[category.id] ||
    'Evaluates repository engineering health against deterministic open-source benchmarks.';

  const catStyle = CATEGORY_STYLES[category.id] || {
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-ink',
    icon: <Activity className="w-4 h-4" />,
  };

  const progressColor =
    percentage >= 75
      ? 'bg-emerald-500'
      : percentage >= 50
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2.5">
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${catStyle.bg} ${catStyle.text}`}>
                {catStyle.icon}
              </span>
              <span className="text-sm sm:text-base font-semibold text-ink">{category.label}</span>

              {/* What's this? popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center text-xs text-primary hover:underline focus:outline-none"
                    aria-label={`What is ${category.label}?`}
                  >
                    <span>What&apos;s this?</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-card shadow-lg text-ink">
                  <p className="font-semibold mb-1 text-ink">{category.label}</p>
                  <p className="text-ink-muted leading-relaxed">{explanation}</p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="font-mono text-xs sm:text-sm font-semibold text-ink">
              {category.earned.toFixed(1)}{' '}
              <span className="text-ink-muted font-normal text-xs">/ {category.weight} pts</span>
            </div>
          </div>

          {/* Sleek progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse checks' : 'Expand checks'}
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-paper-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-ink-muted hover:text-ink flex items-center justify-center transition-colors shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Evidence / Signals List */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2">
          {category.signals.map((signal: SignalResult) => (
            <div
              key={signal.id}
              className="flex items-start justify-between gap-3 text-xs p-3 rounded-lg bg-card border border-slate-200/70 dark:border-slate-800/70"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                {getSignalIcon(signal.status)}
                <div>
                  <div className="font-semibold text-ink">{signal.label}</div>
                  <div className="text-ink-muted text-[11px] mt-0.5 leading-relaxed">
                    {signal.evidence}
                  </div>
                </div>
              </div>

              <div className="font-mono text-xs font-semibold text-ink shrink-0 pt-0.5">
                {signal.earned} / {signal.max}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
