import React from 'react';

export type StickerVariant = 'lime' | 'sun' | 'coral' | 'sky' | 'primary' | 'card' | 'paper';

export interface StickerBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StickerVariant;
  rotate?: 'left' | 'right' | 'none' | number;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

/**
 * Solid-fill sticker badges with 2 px ink border and hard 2 px offset shadow.
 * Follows the "stickers on paper" spec: flat color fills, ink outlines, hard shadows.
 * Text is always --ink colored on fills; dark mode keeps the same ink outline approach.
 */
const VARIANT_STYLES: Record<StickerVariant, string> = {
  lime: 'bg-lime text-ink border-ink',
  sun: 'bg-sun text-ink border-ink',
  coral: 'bg-coral text-white border-ink',
  sky: 'bg-sky text-ink border-ink',
  primary: 'bg-primary text-white border-ink',
  card: 'bg-card text-ink border-ink',
  paper: 'bg-paper-2 text-ink-muted border-ink/30',
};

const DOT_COLORS: Record<StickerVariant, string> = {
  lime: 'bg-ink/40',
  sun: 'bg-ink/40',
  coral: 'bg-white/60',
  sky: 'bg-ink/40',
  primary: 'bg-white/60',
  card: 'bg-ink/40',
  paper: 'bg-ink-muted/60',
};

const SIZE_STYLES = {
  sm: 'text-[11px] px-2 py-0.5 font-bold tracking-wide',
  md: 'text-xs px-2.5 py-1 font-bold tracking-wide',
  lg: 'text-sm px-3.5 py-1.5 font-extrabold tracking-wide',
};

export function StickerBadge({
  variant = 'sun',
  rotate = 'none',
  size = 'md',
  children,
  className = '',
  dot = true,
  style,
  ...props
}: StickerBadgeProps) {
  let rotationDeg = 0;
  if (typeof rotate === 'number') {
    rotationDeg = rotate;
  } else if (rotate === 'left') {
    rotationDeg = -1.5;
  } else if (rotate === 'right') {
    rotationDeg = 1.5;
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 select-none rounded-full border-2 shadow-card-sm transition-all ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      style={{
        transform: rotationDeg !== 0 ? `rotate(${rotationDeg}deg)` : undefined,
        ...style,
      }}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[variant]}`} />}
      <span>{children}</span>
    </span>
  );
}
