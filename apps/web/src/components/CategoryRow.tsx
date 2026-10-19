'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import type { CategoryResult, SignalResult, SignalStatus } from '@repometric/core';

function getSignalIcon(status: SignalStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-3.5 h-3.5 text-moss-text shrink-0" />;
    case 'partial':
      return <AlertCircle className="w-3.5 h-3.5 text-teal shrink-0" />;
    case 'fail':
      return <XCircle className="w-3.5 h-3.5 text-danger-text shrink-0" />;
    case 'no_data':
    case 'na':
      return <HelpCircle className="w-3.5 h-3.5 text-ink-muted shrink-0" />;
  }
}

export function CategoryRow({ category }: { category: CategoryResult }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.min(100, Math.round((category.earned / category.weight) * 100));

  return (
    <div className="border border-line rounded-control bg-surface overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-fog/10 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-semibold text-ink">{category.label}</span>
            <span className="text-xs font-mono font-medium text-ink">
              {category.earned.toFixed(1)} / {category.weight}
            </span>
          </div>

          {/* Thin progress bar */}
          <div className="w-full h-1.5 rounded-full bg-fog/40 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                percentage >= 80 ? 'bg-moss' : percentage >= 50 ? 'bg-teal' : 'bg-danger'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center text-ink-muted pl-2">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable Signals List */}
      {expanded && (
        <div className="border-t border-line bg-paper/40 px-4 py-3 space-y-2.5">
          {category.signals.map((signal: SignalResult) => (
            <div
              key={signal.id}
              className="flex items-start justify-between gap-3 text-xs p-2 rounded-control bg-surface/70 border border-line/60"
            >
              <div className="flex items-start space-x-2 min-w-0">
                <span className="pt-0.5">{getSignalIcon(signal.status)}</span>
                <div>
                  <div className="font-medium text-ink">{signal.label}</div>
                  <div className="text-ink-muted mt-0.5 leading-relaxed">{signal.evidence}</div>
                </div>
              </div>

              <div className="font-mono text-ink-muted font-medium shrink-0 pt-0.5">
                {signal.earned} / {signal.max}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
