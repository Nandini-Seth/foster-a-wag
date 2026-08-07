import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

// PATCH /api/requests/[id] — rescue updates status of a foster interest request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Only rescues can update request status' }, { status: 403 });
  }

  const { status } = await req.json();
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = getDb();

  // Verify rescue owns the pet this request is for
  const request = db.prepare(`
    SELECT fr.id FROM foster_requests fr
    JOIN pets p ON fr.pet_id = p.id
    JOIN rescue_profiles rp ON p.rescue_id = rp.id
    WHERE fr.id = ? AND rp.user_id = ?
  `).get(params.id, session.userId);

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  db.prepare(`
    UPDATE foster_requests SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, params.id);

  return NextResponse.json({ success: true });
}

// DELETE /api/requests/[id] — foster withdraws their own request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Only fosters can withdraw requests' }, { status: 403 });
  }

  const db = getDb();
  const fosterProfile = db.prepare('SELECT id FROM foster_profiles WHERE user_id = ?').get(session.userId) as any;
  if (!fosterProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const result = db.prepare('DELETE FROM foster_requests WHERE id = ? AND foster_id = ?').run(params.id, fosterProfile.id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
