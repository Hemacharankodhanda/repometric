'use client';

import React from 'react';
import { motion } from 'motion/react';

export type StickerVariant = 'lime' | 'sun' | 'coral' | 'sky' | 'primary' | 'purple' | 'card' | 'paper';

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
  lime: 'bg-[#dafbe1] text-[#1a7f37] dark:bg-[#238636]/20 dark:text-[#3fb950] border-[#4ac26b]/30',
  sun: 'bg-[#fff8c5] text-[#9a6700] dark:bg-[#bb8009]/20 dark:text-[#d29922] border-[#d4a72c]/30',
  coral: 'bg-[#ffebe9] text-[#cf222e] dark:bg-[#da3633]/20 dark:text-[#f85149] border-[#ff8182]/30',
  sky: 'bg-[#ddf4ff] text-[#0969da] dark:bg-[#388bfd]/20 dark:text-[#58a6ff] border-[#54aeff]/30',
  primary: 'bg-[#ddf4ff] text-[#0969da] dark:bg-[#388bfd]/20 dark:text-[#58a6ff] border-[#54aeff]/30',
  purple: 'bg-[#fbefff] text-[#8250df] dark:bg-[#8957e5]/20 dark:text-[#bc8cff] border-[#d2a8ff]/30',
  card: 'bg-[var(--paper)] text-ink border-[var(--border-color)]',
  paper: 'bg-[var(--paper)] text-ink-muted border-[var(--border-color)]',
};

const DOT_COLORS: Record<StickerVariant, string> = {
  lime: 'bg-[#1a7f37] dark:bg-[#3fb950]',
  sun: 'bg-[#9a6700] dark:bg-[#d29922]',
  coral: 'bg-[#cf222e] dark:bg-[#f85149]',
  sky: 'bg-[#0969da] dark:bg-[#58a6ff]',
  primary: 'bg-[#0969da] dark:bg-[#58a6ff]',
  purple: 'bg-[#8250df] dark:bg-[#bc8cff]',
  card: 'bg-slate-400',
  paper: 'bg-slate-400',
};

const SIZE_STYLES = {
  sm: 'text-[11px] px-2 py-0.5 font-medium',
  md: 'text-xs px-2.5 py-0.5 font-medium',
  lg: 'text-sm px-3.5 py-1 font-semibold',
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
