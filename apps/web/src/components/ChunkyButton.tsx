'use client';

import React from 'react';

export type ChunkyButtonVariant = 'primary' | 'secondary' | 'lime' | 'coral' | 'ghost';
export type ChunkyButtonSize = 'sm' | 'md' | 'lg';

export interface ChunkyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChunkyButtonVariant;
  size?: ChunkyButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ChunkyButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary border border-primary/20 shadow-sm hover:shadow-md hover:shadow-primary/20 hover:brightness-105 active:scale-[0.98]',
  secondary:
    'bg-card text-ink border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-paper-2 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98]',
  lime:
    'bg-lime text-slate-900 border border-lime/30 shadow-sm hover:brightness-105 active:scale-[0.98]',
  coral:
    'bg-coral text-white border border-coral/30 shadow-sm hover:brightness-105 active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink hover:bg-ink/5 dark:hover:bg-white/10 active:scale-[0.98]',
};

const SIZE_STYLES: Record<ChunkyButtonSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-control',
  md: 'min-h-[42px] px-4 py-2 text-sm font-semibold rounded-control',
  lg: 'min-h-[48px] px-6 py-3 text-base font-bold rounded-control',
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
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center space-x-2 select-none font-body tracking-tight transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:scale-100 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
