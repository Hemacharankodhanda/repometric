import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/viz/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        fog: 'var(--fog)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        line: 'var(--line)',
        teal: {
          DEFAULT: 'var(--teal)',
          text: 'var(--teal-text)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          text: 'var(--danger-text)',
        },
        moss: {
          DEFAULT: 'var(--moss)',
          text: 'var(--moss-text)',
        },
        focus: 'var(--focus)',
        lang: {
          1: 'var(--lang-1)',
          2: 'var(--lang-2)',
          3: 'var(--lang-3)',
          4: 'var(--lang-4)',
          5: 'var(--lang-5)',
          6: 'var(--lang-6)',
          7: 'var(--lang-7)',
          other: 'var(--lang-other)',
        },
        seq: {
          1: 'var(--seq-1)',
          2: 'var(--seq-2)',
          3: 'var(--seq-3)',
          4: 'var(--seq-4)',
          5: 'var(--seq-5)',
        },
      },
      borderRadius: {
        tile: 'var(--radius-tile)',
        control: 'var(--radius-control)',
        panel: 'var(--radius-panel)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.8rem', { lineHeight: '1.5' }],
        sm: ['1rem', { lineHeight: '1.5' }],
        md: ['1.25rem', { lineHeight: '1.4' }],
        lg: ['1.563rem', { lineHeight: '1.3' }],
        xl: ['1.953rem', { lineHeight: '1.2' }],
        '2xl': ['2.441rem', { lineHeight: '1.2' }],
        score: ['3.815rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};

export default config;
