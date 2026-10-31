'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function Card({ children, className = '', hoverLift = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={
        hoverLift
          ? {
              y: -2,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      className={`rounded-card border border-slate-200/80 dark:border-slate-800/80 bg-card p-6 shadow-sm ${
        hoverLift
          ? 'transition-shadow duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
