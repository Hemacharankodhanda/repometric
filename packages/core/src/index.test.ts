import { describe, expect, it } from 'vitest';
import { CORE_VERSION, getCoreVersion } from './index';

describe('core entry', () => {
  it('returns core version', () => {
    expect(getCoreVersion()).toBe(CORE_VERSION);
  });
});
