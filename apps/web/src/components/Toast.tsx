'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  variant?: 'lime' | 'sun' | 'sky' | 'primary';
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export function Toast({
  message,
  variant = 'lime',
  onClose,
  duration = 3000,
  className = '',
}: ToastProps) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgStyles = {
    lime: 'bg-emerald-600 text-white shadow-emerald-500/25',
    sun: 'bg-amber-600 text-white shadow-amber-500/25',
    sky: 'bg-sky-600 text-white shadow-sky-500/25',
    primary: 'bg-primary text-white shadow-primary/25',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-control shadow-xl border border-white/20 font-semibold text-xs sm:text-sm select-none ${bgStyles[variant]} ${className}`}
    >
      <Check className="w-4 h-4 stroke-[3]" />
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-0.5 rounded hover:bg-black/15 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}
