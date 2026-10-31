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
  activity: {
    bg: 'bg-primary text-white',
    icon: <Activity className="w-4 h-4" />,
  },
  maintenance: {
    bg: 'bg-sky text-ink',
    icon: <GitPullRequest className="w-4 h-4" />,
  },
  community: {
    bg: 'bg-lime text-ink',
    icon: <Users className="w-4 h-4" />,
  },
  documentation: {
    bg: 'bg-sun text-ink',
    icon: <FileText className="w-4 h-4" />,
  },
  hygiene: {
    bg: 'bg-lime text-ink',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  dependencies: {
    bg: 'bg-coral text-white',
    icon: <Boxes className="w-4 h-4" />,
  },
};

const CATEGORY_EXPLANATIONS: Record<string, string> = {
  activity: 'Measures recent commit frequency, cadence consistency, and release velocity.',
  maintenance: 'Checks issue and pull-request triage speed, close rates, and stale backlog health.',
  community:
    'Evaluates contributor diversity, open governance, contributing guidelines, and code of conduct.',
  documentation:
    'Inspects README comprehensiveness, quickstart clarity, examples, and license existence.',
  hygiene:
    'Verifies automated CI testing, .gitignore structure, secrets hygiene, and branch protection.',
  dependencies:
    'Analyzes outdated package counts, pinned dependencies, security vulnerabilities, and bloat.',
};

function getSignalIcon(status: SignalStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-4 h-4 text-ink shrink-0 mt-0.5" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-ink shrink-0 mt-0.5" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-coral-text shrink-0 mt-0.5" />;
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
    bg: 'bg-card text-ink',
    icon: <Activity className="w-4 h-4" />,
  };

  const progressColor =
    percentage >= 75 ? 'bg-lime text-ink' : percentage >= 50 ? 'bg-sun text-ink' : 'bg-coral text-white';

  return (
    <div className="rounded-card border-2 border-ink bg-card shadow-card hover:-translate-x-px hover:-translate-y-px hover:shadow-card-lg transition-all duration-[120ms] overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2.5">
              <span
                className={`w-8 h-8 rounded-control border-2 border-ink flex items-center justify-center shrink-0 shadow-card-sm ${catStyle.bg}`}
              >
                {catStyle.icon}
              </span>
              <span className="text-sm sm:text-base font-bold text-ink">{category.label}</span>

              {/* What's this? popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center text-xs font-bold text-primary-text border-b border-primary-text hover:opacity-80 focus:outline-none"
                    aria-label={`What is ${category.label}?`}
                  >
                    <span>What&apos;s this?</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3.5 text-xs rounded-control border-2 border-ink bg-card shadow-card text-ink">
                  <p className="font-bold mb-1 text-ink">{category.label}</p>
                  <p className="text-ink-muted leading-relaxed">{explanation}</p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="font-mono text-xs sm:text-sm font-bold text-ink">
              {category.earned.toFixed(1)}{' '}
              <span className="text-ink-muted font-normal text-xs">/ {category.weight} pts</span>
            </div>
          </div>

          {/* Thick progress bar with ink outline per spec */}
          <div className="w-full h-3.5 rounded-pill border-2 border-ink bg-paper-2 overflow-hidden shadow-card-sm flex">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse checks' : 'Expand checks'}
          className="w-8 h-8 rounded-control border-2 border-ink bg-paper-2 hover:bg-card text-ink flex items-center justify-center transition-all duration-[120ms] shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Evidence / Signals List */}
      {expanded && (
        <div className="border-t-2 border-ink bg-paper-2 p-4 space-y-2">
          {category.signals.map((signal: SignalResult) => (
            <div
              key={signal.id}
              className="flex items-start justify-between gap-3 text-xs p-3 rounded-control bg-card border-2 border-ink shadow-card-sm"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                {getSignalIcon(signal.status)}
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
