import { NextRequest, NextResponse } from 'next/server';
import { queryOne, transaction } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { denyIfNotActive } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const { status, notes } = await req.json();
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const app = await queryOne<any>('SELECT * FROM applications WHERE id = $1 AND rescue_id = $2', [
    params.id,
    session.profileId,
  ]);
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Accepting an application also takes the pet off the board — the two writes
  // belong together, or the pet stays listed as available to everyone else.
  await transaction(async (client) => {
    await client.query('UPDATE applications SET status = $1, notes = $2, updated_at = now() WHERE id = $3', [
      status,
      notes || null,
      params.id,
    ]);

    // Accepting means the post is done taking applications: hide it from the
    // public but leave it visible and editable to the rescue.
    if (status === 'ACCEPTED') {
      await client.query("UPDATE pets SET status = 'PENDING' WHERE id = $1 AND status = 'ACTIVE'", [
        app.pet_id,
      ]);
    }
  });

  return NextResponse.json({ success: true });
}
