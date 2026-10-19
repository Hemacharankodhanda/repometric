'use client';

import React, { useEffect } from 'react';
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
    lime: 'bg-lime text-ink',
    sun: 'bg-sun text-ink',
    sky: 'bg-sky text-ink',
    primary: 'bg-primary text-on-primary',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 inline-flex items-center space-x-2 px-4 py-2.5 rounded-control border-2 border-ink shadow-[4px_4px_0_var(--ink)] font-bold text-sm select-none transition-transform animate-in fade-in slide-in-from-bottom-2 ${bgStyles[variant]} ${className}`}
    >
      <Check className="w-4 h-4 stroke-[3]" />
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-0.5 rounded hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
