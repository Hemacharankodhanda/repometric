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
      },
      borderRadius: {
        tile: 'var(--radius-tile)',
        control: 'var(--radius-control)',
        panel: 'var(--radius-panel)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};

export default config;
