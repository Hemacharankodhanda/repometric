'use client';

import React from 'react';
import { motion } from 'motion/react';

export type ChunkyButtonVariant = 'primary' | 'secondary' | 'lime' | 'coral' | 'ghost';
export type ChunkyButtonSize = 'sm' | 'md' | 'lg';

export interface ChunkyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ChunkyButtonVariant;
  size?: ChunkyButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ChunkyButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary border border-primary/20 shadow-sm hover:shadow-md hover:shadow-primary/20 hover:brightness-105',
  secondary:
    'bg-card text-ink border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-paper-2 hover:border-slate-300 dark:hover:border-slate-700',
  lime: 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400/30 shadow-sm shadow-emerald-500/20',
  coral:
    'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400/30 shadow-sm shadow-rose-500/20',
  ghost: 'bg-transparent text-ink hover:bg-slate-100 dark:hover:bg-slate-800/80',
};

const SIZE_STYLES: Record<ChunkyButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-control',
  md: 'min-h-[42px] px-4.5 py-2 text-sm font-semibold rounded-control',
  lg: 'min-h-[48px] px-6 py-2.5 text-base font-bold rounded-control',
};

export function ChunkyButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ChunkyButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1, transition: { duration: 0.15 } }}
      whileTap={disabled ? undefined : { scale: 0.98, transition: { duration: 0.08 } }}
      disabled={disabled}
      className={`inline-flex items-center justify-center space-x-2 select-none font-body tracking-tight transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
