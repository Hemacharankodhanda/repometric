import { NextRequest, NextResponse } from 'next/server';
import { getLatestStoredAnalysis } from '../../../../../server/analysisStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: { owner: string; repo: string } },
) {
  const { owner, repo } = params;

  const stored = await getLatestStoredAnalysis(owner, repo);
  if (!stored) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `No analysis found for "${owner}/${repo}".` } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    analysis: {
      id: stored.id,
      ...stored.report,
    },
    graph: { status: stored.graphStatus },
    files: stored.files,
  });
}
