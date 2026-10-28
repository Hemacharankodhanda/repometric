import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/badge/[owner]/[repo]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an SVG badge with "not analyzed" for unknown repos', async () => {
    const req = new NextRequest('http://localhost:3000/api/badge/foo/bar');
    const res = await GET(req, { params: { owner: 'foo', repo: 'bar' } });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image/svg+xml');
    expect(res.headers.get('cache-control')).toContain('public');

    const svg = await res.text();
    expect(svg).toContain('<svg');
    expect(svg).toContain('repo health');
    expect(svg).toContain('not analyzed');
  });

  it('strips .svg extension from repo parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/badge/foo/bar.svg');
    const res = await GET(req, { params: { owner: 'foo', repo: 'bar.svg' } });

    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain('<svg');
    expect(svg).toContain('repo health');
  });

  it('supports flat-square style', async () => {
    const req = new NextRequest('http://localhost:3000/api/badge/foo/bar?style=flat-square');
    const res = await GET(req, { params: { owner: 'foo', repo: 'bar' } });

    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain('rx="0"');
  });
});
