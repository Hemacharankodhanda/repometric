import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/graph (T3.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    analysisId: 'test-analysis-uuid-1',
    graph: {
      nodes: [
        {
          id: 'src/index.ts',
          folder: 'src',
          language: 'TypeScript',
          size: 1024,
          fanIn: 0,
          fanOut: 1,
          isTest: false,
        },
      ],
      edges: [
        {
          source: 'src/index.ts',
          target: 'src/utils.ts',
          kind: 'static',
        },
      ],
      stats: {
        nodeCount: 1,
        edgeCount: 1,
        unresolvedCount: 0,
        cycles: [],
        orphans: [],
        topFanIn: [],
        topFanOut: [{ id: 'src/index.ts', count: 1 }],
      },
      truncated: false,
    },
  };

  it('rejects invalid JSON payloads', async () => {
    const req = new NextRequest('http://localhost:3000/api/graph', {
      method: 'POST',
      body: 'invalid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('rejects payloads missing analysisId or graph', async () => {
    const req = new NextRequest('http://localhost:3000/api/graph', {
      method: 'POST',
      body: JSON.stringify({ analysisId: 'abc' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('accepts and stores valid graph payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/graph', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.stored).toBe(true);

    // Second call for the same analysisId is idempotent and returns stored: false
    const req2 = new NextRequest('http://localhost:3000/api/graph', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.stored).toBe(false);
  });
});
