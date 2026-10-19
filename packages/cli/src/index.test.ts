import { describe, expect, it } from 'vitest';
import { createProgram } from './index';

describe('cli entry', () => {
  it('creates commander program with correct name and options', () => {
    const program = createProgram();
    expect(program.name()).toBe('repo-analyzer');
    expect(program.options.map((o) => o.name())).toContain('json');
    expect(program.options.map((o) => o.name())).toContain('min-score');
    expect(program.options.map((o) => o.name())).toContain('token');
  });
});
