import React from 'react';
import { Card } from './Card';
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

const VARIANT_BG: Record<string, string> = {
  card: 'bg-card',
  'paper-2': 'bg-paper-2',
  lime: 'bg-card',
  sun: 'bg-card',
  sky: 'bg-card',
  coral: 'bg-card',
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
  const badgeVariant: StickerVariant =
    variant === 'lime' || variant === 'sun' || variant === 'sky' || variant === 'coral'
      ? variant
      : 'paper';

  return (
    <Card
      hoverLift
      className={`p-5 flex flex-col justify-between space-y-3 ${bgClass} ${className}`}
    >
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
        {subtext && <p className="text-xs text-ink-muted leading-tight font-normal">{subtext}</p>}
      </div>

      {badge && (
        <div className="pt-1">
          <StickerBadge variant={badgeVariant} size="sm" dot={false}>
            {badge}
          </StickerBadge>
        </div>
      )}
    </Card>
  );
}
