import type { Config } from 'tailwindcss';

function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

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
        paper: withOpacity('--paper'),
        'paper-2': withOpacity('--paper-2'),
        card: withOpacity('--card'),
        surface: withOpacity('--card'), // alias for visualizer card background
        fog: withOpacity('--paper-2'),
        line: withOpacity('--ink'),
        ink: {
          DEFAULT: withOpacity('--ink'),
          muted: withOpacity('--ink-muted'),
        },
        primary: {
          DEFAULT: withOpacity('--primary'),
          text: withOpacity('--primary-text'),
        },
        'on-primary': withOpacity('--on-primary'),
        lime: withOpacity('--lime'),
        sun: withOpacity('--sun'),
        coral: {
          DEFAULT: withOpacity('--coral'),
          text: withOpacity('--coral-text'),
        },
        sky: withOpacity('--sky'),
        'on-fill': withOpacity('--on-fill'),
        teal: {
          DEFAULT: withOpacity('--sky'),
          text: withOpacity('--primary-text'),
        },
        danger: {
          DEFAULT: withOpacity('--coral'),
          text: withOpacity('--coral-text'),
        },
        moss: {
          DEFAULT: withOpacity('--lime'),
          text: withOpacity('--ink'),
        },
        lang: {
          1: withOpacity('--lang-1'),
          2: withOpacity('--lang-2'),
          3: withOpacity('--lang-3'),
          4: withOpacity('--lang-4'),
          5: withOpacity('--lang-5'),
          6: withOpacity('--lang-6'),
          7: withOpacity('--lang-7'),
          other: withOpacity('--lang-other'),
        },
        seq: {
          1: withOpacity('--seq-1'),
          2: withOpacity('--seq-2'),
          3: withOpacity('--seq-3'),
          4: withOpacity('--seq-4'),
          5: withOpacity('--seq-5'),
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
