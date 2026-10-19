export interface ExternalLookupEntry {
  label: string;
  kind: 'database' | 'service' | 'library';
}

export const KNOWN_EXTERNALS: Record<string, ExternalLookupEntry> = {
  // Frontend / UI frameworks & libraries
  next: { label: 'Next.js', kind: 'library' },
  react: { label: 'React', kind: 'library' },
  'react-dom': { label: 'React DOM', kind: 'library' },
  vue: { label: 'Vue', kind: 'library' },
  svelte: { label: 'Svelte', kind: 'library' },
  angular: { label: 'Angular', kind: 'library' },
  '@angular/core': { label: 'Angular', kind: 'library' },
  tailwindcss: { label: 'Tailwind CSS', kind: 'library' },
  zustand: { label: 'Zustand', kind: 'library' },
  redux: { label: 'Redux', kind: 'library' },
  '@reduxjs/toolkit': { label: 'Redux Toolkit', kind: 'library' },
  'lucide-react': { label: 'Lucide Icons', kind: 'library' },

  // Node.js Backend frameworks
  express: { label: 'Express', kind: 'library' },
  fastify: { label: 'Fastify', kind: 'library' },
  koa: { label: 'Koa', kind: 'library' },
  nest: { label: 'NestJS', kind: 'library' },
  '@nestjs/core': { label: 'NestJS', kind: 'library' },
  hono: { label: 'Hono', kind: 'library' },

  // Python Frameworks & Data Libraries
  django: { label: 'Django', kind: 'library' },
  flask: { label: 'Flask', kind: 'library' },
  fastapi: { label: 'FastAPI', kind: 'library' },
  requests: { label: 'Requests', kind: 'library' },
  numpy: { label: 'NumPy', kind: 'library' },
  pandas: { label: 'Pandas', kind: 'library' },
  torch: { label: 'PyTorch', kind: 'library' },
  pytorch: { label: 'PyTorch', kind: 'library' },
  tensorflow: { label: 'TensorFlow', kind: 'library' },
  scipy: { label: 'SciPy', kind: 'library' },
  pydantic: { label: 'Pydantic', kind: 'library' },

  // Databases & ORMs
  '@supabase/supabase-js': { label: 'Supabase', kind: 'database' },
  supabase: { label: 'Supabase', kind: 'database' },
  prisma: { label: 'Prisma', kind: 'database' },
  '@prisma/client': { label: 'Prisma', kind: 'database' },
  mongoose: { label: 'Mongoose', kind: 'database' },
  mongodb: { label: 'MongoDB', kind: 'database' },
  pg: { label: 'PostgreSQL', kind: 'database' },
  postgres: { label: 'PostgreSQL', kind: 'database' },
  mysql: { label: 'MySQL', kind: 'database' },
  mysql2: { label: 'MySQL', kind: 'database' },
  sqlite3: { label: 'SQLite', kind: 'database' },
  'better-sqlite3': { label: 'SQLite', kind: 'database' },
  redis: { label: 'Redis', kind: 'database' },
  ioredis: { label: 'Redis', kind: 'database' },
  firebase: { label: 'Firebase', kind: 'database' },
  'firebase-admin': { label: 'Firebase', kind: 'database' },
  typeorm: { label: 'TypeORM', kind: 'database' },
  'drizzle-orm': { label: 'Drizzle ORM', kind: 'database' },
  sqlalchemy: { label: 'SQLAlchemy', kind: 'database' },
  psycopg2: { label: 'PostgreSQL', kind: 'database' },

  // External APIs & Cloud Services
  stripe: { label: 'Stripe', kind: 'service' },
  '@stripe/stripe-js': { label: 'Stripe', kind: 'service' },
  openai: { label: 'OpenAI', kind: 'service' },
  '@anthropic-ai/sdk': { label: 'Anthropic', kind: 'service' },
  axios: { label: 'Axios', kind: 'library' },
  auth0: { label: 'Auth0', kind: 'service' },
  '@auth0/auth0-react': { label: 'Auth0', kind: 'service' },
  'posthog-js': { label: 'PostHog', kind: 'service' },
  'posthog-node': { label: 'PostHog', kind: 'service' },
  sentry: { label: 'Sentry', kind: 'service' },
  '@sentry/node': { label: 'Sentry', kind: 'service' },
  '@sentry/nextjs': { label: 'Sentry', kind: 'service' },
  'aws-sdk': { label: 'AWS SDK', kind: 'service' },
  nodemailer: { label: 'Nodemailer', kind: 'service' },
  sendgrid: { label: 'SendGrid', kind: 'service' },
  '@sendgrid/mail': { label: 'SendGrid', kind: 'service' },
  resend: { label: 'Resend', kind: 'service' },
  zod: { label: 'Zod', kind: 'library' },
  trpc: { label: 'tRPC', kind: 'library' },
  '@trpc/server': { label: 'tRPC', kind: 'library' },
  graphql: { label: 'GraphQL', kind: 'library' },
};

/**
 * Resolves a raw external package name to a curated label and classification kind.
 * Normalizes scoped packages or subpaths (e.g. '@prisma/client' -> 'Prisma').
 */
export function lookupExternal(rawName: string): ExternalLookupEntry {
  const clean = rawName.toLowerCase().trim();

  if (KNOWN_EXTERNALS[clean]) {
    return KNOWN_EXTERNALS[clean];
  }

  // Check prefix / root package (e.g. "@aws-sdk/client-s3" -> "@aws-sdk")
  const baseName = clean.startsWith('@')
    ? clean.split('/').slice(0, 2).join('/')
    : clean.split('/')[0];

  if (KNOWN_EXTERNALS[baseName]) {
    return KNOWN_EXTERNALS[baseName];
  }

  // Default fallback for unknown packages
  return {
    label: rawName,
    kind: 'library',
  };
}
