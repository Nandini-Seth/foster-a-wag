import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { pendingMigrations } from '@/lib/schema';

// This route takes no request input, so Next would otherwise try to evaluate it
// at build time — when there is no database to reach.
export const dynamic = 'force-dynamic';

/**
 * Cloud Run's startup probe hits this, so it has to fail when the app cannot
 * correctly serve traffic — not merely when the process is up.
 *
 * A database that is behind on migrations counts as cannot-serve: the revision
 * would accept writes it cannot store. Failing here keeps the new revision from
 * taking traffic at all, which is a far better outcome than scattered 500s on
 * whichever requests happen to touch the changed columns.
 */
export async function GET() {
  try {
    await queryOne('SELECT 1');
  } catch (err) {
    console.error('[/api/health] database unreachable', err);
    return NextResponse.json({ ok: false, reason: 'database_unreachable' }, { status: 503 });
  }

  try {
    const pending = await pendingMigrations();
    if (pending.length > 0) {
      console.error(
        `[/api/health] ${pending.length} migration(s) not applied: ${pending.join(', ')}. ` +
          'Run the migrate job against this image before serving traffic.'
      );
      return NextResponse.json(
        { ok: false, reason: 'migrations_pending', pending },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error('[/api/health] could not verify schema', err);
    return NextResponse.json({ ok: false, reason: 'schema_check_failed' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
