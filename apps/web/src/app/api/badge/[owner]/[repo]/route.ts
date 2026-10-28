import { NextRequest, NextResponse } from 'next/server';
import { getLatestStoredAnalysis, recordBadgeHit } from '../../../../../server/analysisStore';
import { renderBadgeSvg } from '../../../../../server/badge';

export const revalidate = 86400;

export async function GET(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } },
) {
  const { owner, repo } = params;
  const cleanRepo = repo.replace(/\.svg$/, '');
  const styleParam = req.nextUrl.searchParams.get('style');
  const style = styleParam === 'flat-square' ? 'flat-square' : 'flat';

  let value = 'not analyzed';
  let grade: 'excellent' | 'good' | 'needs-work' | 'at-risk' | 'unknown' = 'unknown';

  try {
    const analysis = await getLatestStoredAnalysis(owner, cleanRepo);
    if (analysis) {
      value = `${analysis.report.score}/100`;
      grade = analysis.report.grade;
      // Track hit asynchronously
      recordBadgeHit(owner, cleanRepo).catch(() => {});
    }
  } catch {
    // Return grey unknown badge on failure
  }

  const svg = renderBadgeSvg({
    label: 'repo health',
    value,
    grade,
    style,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
