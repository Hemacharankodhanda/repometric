import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/cron/keepalive (T4.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized requests when CRON_SECRET is set', async () => {
    process.env.CRON_SECRET = 'secret123';
    const req = new NextRequest('http://localhost:3000/api/cron/keepalive');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('accepts valid bearer authorization when CRON_SECRET is set', async () => {
    process.env.CRON_SECRET = 'secret123';
    const req = new NextRequest('http://localhost:3000/api/cron/keepalive', {
      headers: {
        authorization: 'Bearer secret123',
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.timestamp).toBeDefined();

    delete process.env.CRON_SECRET;
  });

  it('allows access when no CRON_SECRET is configured', async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest('http://localhost:3000/api/cron/keepalive');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
