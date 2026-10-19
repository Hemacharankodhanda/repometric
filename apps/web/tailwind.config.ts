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
        'paper-2': 'var(--paper-2)',
        card: 'var(--card)',
        surface: 'var(--card)', // alias for visualizer card background
        fog: 'var(--paper-2)',
        line: 'var(--ink)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          text: 'var(--primary-text)',
        },
        'on-primary': 'var(--on-primary)',
        lime: 'var(--lime)',
        sun: 'var(--sun)',
        coral: {
          DEFAULT: 'var(--coral)',
          text: 'var(--coral-text)',
        },
        sky: 'var(--sky)',
        'on-fill': 'var(--on-fill)',
        teal: {
          DEFAULT: 'var(--sky)',
          text: 'var(--primary-text)',
        },
        danger: {
          DEFAULT: 'var(--coral)',
          text: 'var(--coral-text)',
        },
        moss: {
          DEFAULT: 'var(--lime)',
          text: 'var(--ink)',
        },
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
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        none: '0 0 #0000',
      },
      borderRadius: {
        tile: 'var(--radius-tile)',
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        panel: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'system-ui', 'sans-serif'],
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
        hero: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        score: ['clamp(4rem, 10vw, 6rem)', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};

export default config;
