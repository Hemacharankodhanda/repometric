'use client';

import React from 'react';
import { Star, GitBranch, Scale, Calendar, ArrowUpRight } from 'lucide-react';
import type { AnalysisReport, Grade, Effort } from '@repometric/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

export function getGradeColor(grade: Grade): { text: string; bg: string; label: string } {
  switch (grade) {
    case 'excellent':
      return { text: 'text-moss-text', bg: 'bg-moss/15 border-moss/30', label: 'Excellent' };
    case 'good':
      return { text: 'text-teal-text', bg: 'bg-teal/15 border-teal/30', label: 'Good' };
    case 'needs-work':
      return { text: 'text-ink', bg: 'bg-fog/40 border-line', label: 'Needs work' };
    case 'at-risk':
      return { text: 'text-danger-text', bg: 'bg-danger/15 border-danger/30', label: 'At risk' };
  }
}

export function getEffortLabel(effort: Effort): string {
  switch (effort) {
    case 'S':
      return 'S: Small effort (under an hour)';
    case 'M':
      return 'M: Medium effort (half a day)';
    case 'L':
      return 'L: Large effort (multiple days)';
  }
}

export function ScoreRail({
  report,
  onNavigateToFixes,
}: {
  report: AnalysisReport;
  onNavigateToFixes?: () => void;
}) {
  const gradeInfo = getGradeColor(report.grade);
  const topFixes = report.fixes.slice(0, 3);

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Primary Score Box */}
      <div className="p-5 rounded-panel border border-line bg-surface space-y-4">
        {/* Repo Title & Meta */}
        <div>
          <h2 className="text-base font-semibold text-ink font-mono truncate">
            {report.repo.owner}/{report.repo.name}
          </h2>
          {report.repo.description && (
            <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
              {report.repo.description}
            </p>
          )}
        </div>

        {/* Score Numeral & Grade */}
        <div className="pt-2 border-t border-line flex items-baseline justify-between">
          <div>
            <div className="text-5xl font-heading font-extrabold tracking-tight text-ink">
              {report.score}
            </div>
            <div className="text-xs text-ink-muted font-medium">Health score / 100</div>
          </div>

          <div
            className={`px-3 py-1 rounded-control border text-xs font-semibold ${gradeInfo.bg} ${gradeInfo.text}`}
          >
            {gradeInfo.label}
          </div>
        </div>

        {/* Projected Score Line */}
        <div className="pt-2 border-t border-line text-xs text-ink-muted">
          <span>Projected: </span>
          <span className="font-semibold text-ink font-mono">{report.projectedScore}</span>
          <span> after the fixes below</span>
        </div>

        {/* Repo Metadata Chips */}
        <div className="pt-2 border-t border-line flex flex-wrap gap-2 text-xs text-ink-muted font-mono">
          <div className="flex items-center space-x-1" title="Stars">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>{report.repo.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1" title="Default branch">
            <GitBranch className="w-3.5 h-3.5" />
            <span>{report.repo.defaultBranch}</span>
          </div>
          {report.repo.license && (
            <div className="flex items-center space-x-1" title="License">
              <Scale className="w-3.5 h-3.5" />
              <span>{report.repo.license}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Fixes Preview in Rail */}
      <div className="p-5 rounded-panel border border-line bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Top Fixes
          </h3>
          {onNavigateToFixes && (
            <button
              type="button"
              onClick={onNavigateToFixes}
              className="text-xs text-teal hover:underline inline-flex items-center"
            >
              <span>View all ({report.fixes.length})</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        <TooltipProvider>
          <ul className="space-y-2.5">
            {topFixes.map((fix) => (
              <li
                key={fix.id}
                className="text-xs flex items-start justify-between gap-2 p-2 rounded-control bg-paper/60 border border-line"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink truncate">{fix.title}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5 truncate">{fix.why}</div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 pt-0.5 font-mono">
                  <span className="text-moss-text font-semibold">+{fix.pointsGain.toFixed(1)}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="px-1.5 py-0.5 rounded-xs bg-fog/30 text-ink-muted text-[10px] font-semibold cursor-help">
                        {fix.effort}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{getEffortLabel(fix.effort)}</TooltipContent>
                  </Tooltip>
                </div>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </div>

      {/* Timestamp note */}
      <div className="px-2 text-xs text-ink-muted flex items-center space-x-1">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>Analyzed on {new Date(report.analyzedAt).toLocaleDateString()}</span>
      </div>
    </aside>
  );
}
