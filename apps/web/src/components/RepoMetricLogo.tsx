'use client';

import React from 'react';

export interface RepoMetricLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * Custom SVG logo for RepoMetric.
 * Concept: Stylized geometric 'R' formed by Git commit nodes,
 * code branches, and precision telemetry metrics.
 */
export function RepoMetricLogo({
  size = 32,
  showWordmark = true,
  className = '',
  animate = false,
}: RepoMetricLogoProps) {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          animate ? 'animate-pulse' : ''
        }`}
        aria-label="RepoMetric Logo Mark"
      >
        <defs>
          {/* Subtle deep gradient background */}
          <linearGradient id={`bg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Luminous border gradient */}
          <linearGradient id={`border-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
          </linearGradient>

          {/* Connected branch stroke gradient */}
          <linearGradient id={`branch-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Inner telemetry glow */}
          <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#6366F1" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer squircle container */}
        <rect
          width="32"
          height="32"
          rx="8.5"
          fill={`url(#bg-${uniqueId})`}
        />
        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="7.75"
          fill="none"
          stroke={`url(#border-${uniqueId})`}
          strokeWidth="1.25"
        />

        {/* Ambient subtle grid dot backdrop */}
        <circle cx="16" cy="8" r="0.75" fill="#38BDF8" opacity="0.25" />
        <circle cx="24" cy="8" r="0.75" fill="#818CF8" opacity="0.2" />
        <circle cx="16" cy="24" r="0.75" fill="#34D399" opacity="0.25" />

        {/* Stylized 'R' Git Tree Path */}
        <g filter={`url(#glow-${uniqueId})`}>
          {/* Main branch trunk + upper loop */}
          <path
            d="M 9.5 24 L 9.5 8 C 9.5 8, 17 8, 20.5 8.5 C 23.2 10, 23.2 13.5, 20.5 15 C 18 16.2, 14 16.2, 9.5 16.2"
            fill="none"
            stroke={`url(#branch-${uniqueId})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Divergent feature branch / metric kick */}
          <path
            d="M 14.5 16.2 L 23 24"
            fill="none"
            stroke={`url(#branch-${uniqueId})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>

        {/* Git Commit Nodes with luminous white cores */}
        {/* Base commit (root) */}
        <circle cx="9.5" cy="24" r="2.2" fill="#818CF8" />
        <circle cx="9.5" cy="24" r="1" fill="#FFFFFF" />

        {/* Head commit */}
        <circle cx="9.5" cy="8" r="2.2" fill="#818CF8" />
        <circle cx="9.5" cy="8" r="1" fill="#FFFFFF" />

        {/* Loop apex commit */}
        <circle cx="22" cy="11.8" r="2.2" fill="#38BDF8" />
        <circle cx="22" cy="11.8" r="1" fill="#FFFFFF" />

        {/* Branch / metric telemetry commit */}
        <circle cx="23" cy="24" r="2.5" fill="#34D399" />
        <circle cx="23" cy="24" r="1.1" fill="#FFFFFF" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="font-display font-bold text-xl tracking-tight text-ink flex items-center">
          <span>repo</span>
          <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
            metric
          </span>
        </span>
      )}
    </div>
  );
}

