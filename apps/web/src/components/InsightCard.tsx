import React from 'react';
import { Card } from './Card';

export interface InsightCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: 'card' | 'paper-2' | 'lime' | 'sun' | 'sky';
  className?: string;
}

export function InsightCard({
  label,
  value,
  subtext,
  icon,
  badge,
  className = '',
}: InsightCardProps) {
  return (
    <Card hoverLift className={`p-5 flex flex-col justify-between space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-ink">{icon}</span>}
      </div>

      <div className="space-y-1">
        <div className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight break-all">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-ink-muted leading-tight font-medium">
            {subtext}
          </p>
        )}
      </div>

      {badge && (
        <div className="pt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-pill border-2 border-ink bg-paper-2 text-[11px] font-bold text-ink shadow-[1px_1px_0_var(--ink)]">
            {badge}
          </span>
        </div>
      )}
    </Card>
  );
}
