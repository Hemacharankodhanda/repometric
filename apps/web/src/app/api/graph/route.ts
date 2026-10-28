import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { GraphData } from '@repometric/core';
import { checkGraphRateLimit, saveGraphData } from '../../../server/analysisStore';

export const maxDuration = 60;

const nodeSchema = z.object({
  id: z.string(),
  folder: z.string(),
  language: z.string(),
  size: z.number(),
  fanIn: z.number(),
  fanOut: z.number(),
  isTest: z.boolean(),
});

const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  kind: z.enum(['static', 'dynamic']),
});

const graphSchema = z.object({
  analysisId: z.string().min(1, 'analysisId is required'),
  graph: z.object({
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
    externals: z.array(z.object({ name: z.string(), importedBy: z.number() })).optional(),
    externalEdges: z.array(z.object({ source: z.string(), target: z.string() })).optional(),
    stats: z.object({
      nodeCount: z.number(),
      edgeCount: z.number(),
      unresolvedCount: z.number(),
      cycles: z.array(z.array(z.string())),
      orphans: z.array(z.string()),
      topFanIn: z.array(z.object({ id: z.string(), count: z.number() })),
      topFanOut: z.array(z.object({ id: z.string(), count: z.number() })),
    }),
    truncated: z.boolean(),
    collapsedToFolders: z.boolean().optional(),
  }),
});

function formatError(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting by IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const rateLimit = await checkGraphRateLimit(ip);

  if (!rateLimit.allowed) {
    return formatError(
      'RATE_LIMITED',
      `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetSeconds / 60)} minutes.`,
      429,
      { 'Retry-After': String(rateLimit.resetSeconds) },
    );
  }

  // 2. Check payload size (4 MB limit)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 4 * 1024 * 1024) {
    return formatError('TOO_LARGE', 'Graph payload exceeds 4 MB limit.', 413);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return formatError('INVALID_INPUT', 'Invalid JSON payload.', 400);
  }

  const parseResult = graphSchema.safeParse(body);
  if (!parseResult.success) {
    return formatError('INVALID_INPUT', 'Payload does not match GraphData schema.', 400);
  }

  const { analysisId, graph } = parseResult.data;

  // 3. Node count limit (max 5,000 nodes)
  if (graph.nodes.length > 5000) {
    return formatError('TOO_LARGE', 'Graph exceeds 5,000 nodes limit.', 413);
  }

  const result = await saveGraphData(analysisId, {
    ...graph,
    collapsedToFolders: graph.collapsedToFolders ?? false,
  } as GraphData);

  return NextResponse.json(result, { status: 200 });
}
