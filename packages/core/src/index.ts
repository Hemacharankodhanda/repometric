export const CORE_VERSION = '0.1.0';

export function getCoreVersion(): string {
  return CORE_VERSION;
}

export * from './types';
export * from './mocks';
export * from './hierarchy';
export * from './errors';
export * from './github/languages';
export * from './github/client';
export * from './scoring';
export * from './dependencies';
