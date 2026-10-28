import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function Card({ children, className = '', hoverLift = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-card border border-slate-200/90 dark:border-slate-800/90 bg-card p-6 shadow-sm ${
        hoverLift
          ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
