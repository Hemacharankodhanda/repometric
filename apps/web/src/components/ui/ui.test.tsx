import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from './Button';
import { Input } from './Input';
import { ThemeToggle } from '../ThemeToggle';

describe('Design tokens & UI primitives (T0.4)', () => {
  it('renders Button with variants', () => {
    const html = renderToString(<Button variant="default">Analyze repository</Button>);
    expect(html).toContain('Analyze repository');
    expect(html).toContain('bg-primary');
  });

  it('renders Input with tokens', () => {
    const html = renderToString(<Input placeholder="owner/repo" />);
    expect(html).toContain('placeholder="owner/repo"');
    expect(html).toContain('bg-card');
  });

  it('renders ThemeToggle', () => {
    const html = renderToString(<ThemeToggle />);
    expect(html).toBeDefined();
  });
});
