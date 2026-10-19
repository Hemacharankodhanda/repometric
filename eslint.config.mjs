import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '*.config.{js,mjs,ts}',
      '**/*.config.{js,mjs,ts}',
      '**/next-env.d.ts',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: [
      'apps/web/src/components/**/*.{ts,tsx}',
      'apps/web/src/app/**/(*client*).{ts,tsx}',
      'packages/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*src/server*', '@/server*', '../*server/db*', '*/server/db*'],
              message:
                'Server-only code in src/server must never be imported into client components or UI packages.',
            },
          ],
        },
      ],
    },
  },
);
