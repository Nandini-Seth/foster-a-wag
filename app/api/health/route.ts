import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

// This route takes no request input, so Next would otherwise try to evaluate it
// at build time — when there is no database to reach.
export const dynamic = 'force-dynamic';

// Cloud Run's startup and liveness probes hit this, so it has to actually reach
// the database rather than just confirm the process is up.
export async function GET() {
  try {
    await queryOne('SELECT 1');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/health]', err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
