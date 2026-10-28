import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '../../../../server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Unauthorized cron trigger.' } },
      { status: 401 },
    );
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('repos').select('id').limit(1);

    if (error) {
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: error.message } },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // If Supabase not configured in local environment, return ok: true with notice
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      notice: 'Keepalive executed in fallback mode',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
