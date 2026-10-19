'use client';

import React from 'react';

export type TillyMood =
  | 'idle'
  | 'scanning'
  | 'happy'
  | 'celebrating'
  | 'neutral'
  | 'worried'
  | 'lost';

export interface TillyProps {
  mood?: TillyMood;
  size?: number | string;
  className?: string;
}

export function Tilly({ mood = 'idle', size = 64, className = '' }: TillyProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Tilly mascot (${mood})`}
      className={`inline-block select-none overflow-visible ${className}`}
    >
      <style>{`
        @keyframes tilly-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes tilly-scan {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(6px); }
        }
        @keyframes tilly-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .tilly-blinking {
          transform-origin: 50% 48%;
          animation: tilly-blink 4s infinite ease-in-out;
        }
        .tilly-scanning-eye {
          animation: tilly-scan 1.5s infinite ease-in-out;
        }
        .tilly-happy-bounce {
          animation: tilly-bounce 2s infinite ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .tilly-blinking, .tilly-scanning-eye, .tilly-happy-bounce {
            animation: none !important;
          }
        }
      `}</style>

      {/* Main Tile Body */}
      <rect
        x="20"
        y="28"
        width="60"
        height="56"
        rx="8"
        fill="var(--sun)"
        stroke="var(--ink)"
        strokeWidth="3"
      />

      {/* Tile Inner Accent Band (field guide notebook style) */}
      <rect
        x="20"
        y="72"
        width="60"
        height="12"
        rx="2"
        fill="var(--lime)"
        stroke="var(--ink)"
        strokeWidth="2"
      />

      {/* Surveyor's Cap Base & Peak */}
      <path
        d="M24 28 C24 18, 76 18, 76 28 Z"
        fill="var(--card)"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      <path
        d="M16 28 L84 28"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Tiny Compass Badge on Cap */}
      <circle cx="50" cy="18" r="6.5" fill="var(--sky)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M50 14 L52 18 L50 22 L48 18 Z" fill="var(--coral)" stroke="var(--ink)" strokeWidth="1" />

      {/* Eyes and Mouth based on mood */}
      {mood === 'idle' && (
        <g className="tilly-blinking">
          <circle cx="40" cy="46" r="4.5" fill="var(--ink)" />
          <circle cx="60" cy="46" r="4.5" fill="var(--ink)" />
          <circle cx="42" cy="44" r="1.5" fill="var(--card)" />
          <circle cx="62" cy="44" r="1.5" fill="var(--card)" />
          {/* Subtle friendly curve mouth */}
          <path d="M44 58 Q50 63 56 58" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {mood === 'scanning' && (
        <g>
          {/* Eyes scanning left-right */}
          <g className="tilly-scanning-eye">
            <circle cx="38" cy="46" r="4.5" fill="var(--ink)" />
            <circle cx="58" cy="46" r="4.5" fill="var(--ink)" />
            <circle cx="40" cy="44" r="1.5" fill="var(--card)" />
            <circle cx="60" cy="44" r="1.5" fill="var(--card)" />
          </g>
          {/* Focused 'o' mouth */}
          <circle cx="50" cy="59" r="2.5" fill="var(--ink)" />
          {/* Magnifying Glass held in hand */}
          <g transform="translate(62, 42) rotate(15)">
            <circle cx="12" cy="12" r="9" fill="var(--sky)" stroke="var(--ink)" strokeWidth="2.5" />
            <line x1="18" y1="18" x2="28" y2="28" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M8 8 Q14 6 16 12" stroke="var(--card)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      )}

      {mood === 'happy' && (
        <g className="tilly-happy-bounce">
          {/* Happy squinting/curved eyes */}
          <path d="M35 46 Q40 40 45 46" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <path d="M55 46 Q60 40 65 46" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <circle cx="33" cy="52" r="3" fill="var(--coral)" opacity="0.6" />
          <circle cx="67" cy="52" r="3" fill="var(--coral)" opacity="0.6" />
          {/* Broad smile with tongue */}
          <path
            d="M42 55 Q50 67 58 55 Z"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
      )}

      {mood === 'celebrating' && (
        <g>
          {/* Raised arms */}
          <path d="M20 48 L8 34" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M80 48 L92 34" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Happy eyes */}
          <path d="M35 45 Q40 38 45 45" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <path d="M55 45 Q60 38 65 45" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          {/* Wide open laughing mouth */}
          <path
            d="M40 54 Q50 70 60 54 Z"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Star bursts near hands */}
          <path d="M8 22 L10 26 L14 26 L11 29 L12 33 L8 30 L4 33 L5 29 L2 26 L6 26 Z" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1" />
          <path d="M90 22 L92 26 L96 26 L93 29 L94 33 L90 30 L86 33 L87 29 L84 26 L88 26 Z" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1" />
        </g>
      )}

      {mood === 'neutral' && (
        <g>
          {/* Neutral round eyes looking slightly up */}
          <circle cx="40" cy="45" r="4" fill="var(--ink)" />
          <circle cx="60" cy="45" r="4" fill="var(--ink)" />
          <circle cx="42" cy="43" r="1.5" fill="var(--card)" />
          <circle cx="62" cy="43" r="1.5" fill="var(--card)" />
          {/* Straight flat mouth */}
          <line x1="43" y1="58" x2="57" y2="58" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Thinking hand under chin */}
          <path d="M44 65 Q50 63 56 65" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {mood === 'worried' && (
        <g>
          {/* Slanted worried eyebrows */}
          <path d="M34 40 L44 43" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <path d="M66 40 L56 43" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          {/* Wide round eyes */}
          <circle cx="39" cy="48" r="4.5" fill="var(--ink)" />
          <circle cx="61" cy="48" r="4.5" fill="var(--ink)" />
          <circle cx="41" cy="46" r="1.5" fill="var(--card)" />
          <circle cx="63" cy="46" r="1.5" fill="var(--card)" />
          {/* Wavy nervous mouth */}
          <path d="M42 60 Q46 57 50 60 Q54 63 58 60" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Sweat drop on forehead */}
          <path d="M27 38 C27 34, 30 31, 30 28 C30 31, 33 34, 33 38 C33 40, 30 42, 27 38 Z" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1.5" />
        </g>
      )}

      {mood === 'lost' && (
        <g>
          {/* Confused spiral/swirl eyes */}
          <circle cx="38" cy="45" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="38" cy="45" r="1.5" fill="var(--ink)" />
          <circle cx="62" cy="45" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="62" cy="45" r="1.5" fill="var(--ink)" />
          {/* Little puzzled mouth */}
          <path d="M46 58 Q50 54 54 58" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Holding an upside-down map sheet */}
          <g transform="translate(30, 58) rotate(-10)">
            <rect x="0" y="0" width="40" height="26" rx="2" fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="2" />
            {/* Grid fold lines */}
            <line x1="13" y1="0" x2="13" y2="26" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="27" y1="0" x2="27" y2="26" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
            {/* Upside down compass mark */}
            <path d="M20 18 L17 8 L20 12 L23 8 Z" fill="var(--coral)" stroke="var(--ink)" strokeWidth="1" />
          </g>
        </g>
      )}
    </svg>
  );
}
