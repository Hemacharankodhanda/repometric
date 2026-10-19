import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function Card({
  children,
  className = '',
  hoverLift = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border-2 border-ink bg-card p-6 shadow-[4px_4px_0_var(--ink)] ${
        hoverLift
          ? 'transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
