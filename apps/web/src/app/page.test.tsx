import { describe, expect, it } from 'vitest';
import { parseRepoInput } from '../components/RepoInput';

describe('RepoInput parser', () => {
  it('parses owner/repo syntax correctly', () => {
    expect(parseRepoInput('facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
    expect(parseRepoInput('  ExpressJS/Express  ')).toEqual({
      owner: 'expressjs',
      repo: 'express',
    });
  });

  it('parses full GitHub URLs', () => {
    expect(parseRepoInput('https://github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
    expect(parseRepoInput('https://github.com/vuejs/core.git')).toEqual({
      owner: 'vuejs',
      repo: 'core',
    });
  });

  it('rejects invalid inputs', () => {
    expect(parseRepoInput('')).toBeNull();
    expect(parseRepoInput('justoneWord')).toBeNull();
    expect(parseRepoInput('https://gitlab.com/owner/repo')).toBeNull();
  });
});
