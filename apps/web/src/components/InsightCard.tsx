import React from 'react';
import { Card } from './Card';

export interface InsightCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: 'card' | 'paper-2' | 'lime' | 'sun' | 'sky' | 'coral';
  className?: string;
}

const VARIANT_BG: Record<string, string> = {
  card: 'bg-card',
  'paper-2': 'bg-paper-2',
  lime: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20',
  sun: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20',
  sky: 'bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20',
  coral: 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20',
};

export function InsightCard({
  label,
  value,
  subtext,
  icon,
  badge,
  variant = 'card',
  className = '',
}: InsightCardProps) {
  const bgClass = VARIANT_BG[variant] || 'bg-card';
  return (
    <Card
      hoverLift
      className={`p-5 flex flex-col justify-between space-y-3 ${bgClass} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>

      <div className="space-y-1">
        <div className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight break-all">
          {value}
        </div>
        {subtext && <p className="text-xs text-ink-muted leading-tight font-normal">{subtext}</p>}
      </div>

      {badge && (
        <div className="pt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-paper-2 text-[11px] font-semibold text-ink-muted">
            {badge}
          </span>
        </div>
      )}
    </Card>
  );
}
