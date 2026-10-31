import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function Card({ children, className = '', hoverLift = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-card border-2 border-ink bg-card p-6 shadow-card ${
        hoverLift
          ? 'transition-all duration-[120ms] ease-out hover:-translate-x-px hover:-translate-y-px hover:shadow-card-lg'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
