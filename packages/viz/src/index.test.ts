import { describe, expect, it } from 'vitest';
import { VIZ_VERSION } from './index';

describe('viz entry', () => {
  it('returns viz version', () => {
    expect(VIZ_VERSION).toBe('0.1.0');
  });
});
