import { NextRequest, NextResponse } from 'next/server';
import { getGraphData } from '../../../../server/analysisStore';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { analysisId: string } }) {
  const { analysisId } = params;

  try {
    const graph = await getGraphData(analysisId);
    if (!graph) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Graph not found for this analysis.' } },
        { status: 404 },
      );
    }

    return NextResponse.json(graph, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve graph.';
    return NextResponse.json({ error: { code: 'INTERNAL', message } }, { status: 500 });
  }
}
