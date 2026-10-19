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
    'bg-primary text-on-primary border-2 border-ink shadow-[4px_4px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  secondary:
    'bg-card text-ink border-2 border-ink shadow-[4px_4px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  lime:
    'bg-lime text-ink border-2 border-ink shadow-[4px_4px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  coral:
    'bg-coral text-ink border-2 border-ink shadow-[4px_4px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  ghost:
    'bg-transparent text-ink border-2 border-transparent hover:border-ink hover:bg-card/50 active:translate-y-0.5',
};

const SIZE_STYLES: Record<ChunkyButtonSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-control',
  md: 'min-h-[44px] px-5 py-2.5 text-sm font-bold rounded-control',
  lg: 'min-h-[52px] px-7 py-3.5 text-base font-extrabold rounded-control',
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
      className={`inline-flex items-center justify-center space-x-2 select-none font-body tracking-tight transition-all duration-[120ms] ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
