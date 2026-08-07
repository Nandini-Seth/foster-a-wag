import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status, notes } = await req.json();
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = getDb();
  const app = db.prepare('SELECT * FROM applications WHERE id = ? AND rescue_id = ?').get(params.id, session.profileId);
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.prepare(`UPDATE applications SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(status, notes || null, params.id);

  // If accepted, update pet status
  if (status === 'ACCEPTED') {
    const appData = app as any;
    db.prepare(`UPDATE pets SET status = 'IN_FOSTER' WHERE id = ?`).run(appData.pet_id);
  }

  return NextResponse.json({ success: true });
}
