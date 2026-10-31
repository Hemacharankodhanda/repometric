'use client';

import React from 'react';
import { motion } from 'motion/react';

export type StickerVariant = 'lime' | 'sun' | 'coral' | 'sky' | 'primary' | 'card' | 'paper';

export interface StickerBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: StickerVariant;
  rotate?: 'left' | 'right' | 'none' | number;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const VARIANT_STYLES: Record<StickerVariant, string> = {
  lime: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5',
  sun: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/5',
  coral: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/5',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 shadow-sm shadow-sky-500/5',
  primary: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-sm shadow-indigo-500/5',
  card: 'bg-card text-ink border-slate-200 dark:border-slate-800 shadow-sm',
  paper: 'bg-paper-2 text-ink-muted border-slate-200/80 dark:border-slate-800/80',
};

const DOT_COLORS: Record<StickerVariant, string> = {
  lime: 'bg-emerald-500',
  sun: 'bg-amber-500',
  coral: 'bg-rose-500',
  sky: 'bg-sky-500',
  primary: 'bg-indigo-500',
  card: 'bg-slate-400',
  paper: 'bg-slate-400',
};

const SIZE_STYLES = {
  sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide',
  md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide',
};

export function StickerBadge({
  variant = 'sun',
  size = 'md',
  children,
  className = '',
  dot = true,
  style,
  ...props
}: StickerBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center gap-1.5 select-none rounded-full border transition-all ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      style={style}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${DOT_COLORS[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${DOT_COLORS[variant]}`} />
        </span>
      )}
      <span>{children}</span>
    </motion.span>
  );
}
