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

/**
 * "Stickers on paper" button style:
 * - 2 px ink border
 * - Hard 4 px offset shadow (card-sm)
 * - Hover: translate(-1px,-1px) + bigger shadow (card)
 * - Press: translate(2px,2px) + shadow removed
 * - 120 ms transition
 */
const VARIANT_STYLES: Record<ChunkyButtonVariant, string> = {
  primary: 'bg-primary text-white border-2 border-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  secondary: 'bg-card text-ink border-2 border-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  lime: 'bg-lime text-ink border-2 border-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  coral: 'bg-coral text-white border-2 border-ink shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  ghost: 'bg-transparent text-ink border-2 border-transparent hover:border-ink hover:shadow-card-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
};

const SIZE_STYLES: Record<ChunkyButtonSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-control',
  md: 'min-h-[44px] px-4 py-2 text-sm font-bold rounded-control',
  lg: 'min-h-[52px] px-6 py-3 text-base font-extrabold rounded-control',
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
      className={`inline-flex items-center justify-center space-x-2 select-none font-body tracking-tight transition-all duration-[120ms] ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
