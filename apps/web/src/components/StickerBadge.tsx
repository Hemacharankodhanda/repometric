import React from 'react';

export type StickerVariant = 'lime' | 'sun' | 'coral' | 'sky' | 'primary' | 'card' | 'paper';

export interface StickerBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StickerVariant;
  rotate?: 'left' | 'right' | 'none' | number;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<StickerVariant, string> = {
  lime: 'bg-lime text-ink',
  sun: 'bg-sun text-ink',
  coral: 'bg-coral text-ink',
  sky: 'bg-sky text-ink',
  primary: 'bg-primary text-on-primary',
  card: 'bg-card text-ink',
  paper: 'bg-paper text-ink',
};

const SIZE_STYLES = {
  sm: 'text-xs px-2 py-0.5 font-bold',
  md: 'text-sm px-2.5 py-1 font-bold',
  lg: 'text-base px-3.5 py-1.5 font-extrabold',
};

export function StickerBadge({
  variant = 'sun',
  rotate = 'right',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: StickerBadgeProps) {
  let rotationDeg = 0;
  if (typeof rotate === 'number') {
    rotationDeg = rotate;
  } else if (rotate === 'left') {
    rotationDeg = -3;
  } else if (rotate === 'right') {
    rotationDeg = 2.5;
  }

  const rotationClass = rotationDeg !== 0 ? '' : '';

  return (
    <span
      className={`inline-flex items-center justify-center select-none rounded-[6px] border-2 border-ink shadow-[2px_2px_0_var(--ink)] tracking-tight uppercase transition-transform hover:scale-105 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${rotationClass} ${className}`}
      style={{
        transform: rotationDeg !== 0 ? `rotate(${rotationDeg}deg)` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
