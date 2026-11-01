import React from 'react';
import { StickerBadge, type StickerVariant } from './StickerBadge';

export interface InsightCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: 'card' | 'paper-2' | 'lime' | 'sun' | 'sky' | 'coral';
  className?: string;
}

export function InsightCard({
  label,
  value,
  subtext,
  icon,
  badge,
  variant = 'card',
  className = '',
}: InsightCardProps) {
  const badgeVariant: StickerVariant =
    variant === 'lime' || variant === 'sun' || variant === 'sky' || variant === 'coral'
      ? variant
      : 'paper';

  return (
    <div
      className={`gh-box p-4 flex flex-col justify-between space-y-2.5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted">
          {label}
        </span>
        {icon && <span className="text-ink-muted">{icon}</span>}
      </div>

      <div className="space-y-1">
        <div className="font-display font-semibold text-xl sm:text-2xl text-ink tracking-tight break-all">
          {value}
        </div>
        {subtext && <p className="text-xs text-ink-muted leading-tight font-normal">{subtext}</p>}
      </div>

      {badge && (
        <div className="pt-0.5">
          <StickerBadge variant={badgeVariant} size="sm" dot={false}>
            {badge}
          </StickerBadge>
        </div>
      )}
    </div>
  );
}
