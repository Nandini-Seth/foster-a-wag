import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { denyIfNotActive } from '@/lib/auth';

// PATCH /api/requests/[id] — rescue updates status of a foster interest request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Only rescues can update request status' }, { status: 403 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const { status } = await req.json();
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // Verify rescue owns the pet this request is for
  const request = await queryOne(
    `SELECT fr.id FROM foster_requests fr
     JOIN pets p ON fr.pet_id = p.id
     JOIN rescue_profiles rp ON p.rescue_id = rp.id
     WHERE fr.id = $1 AND rp.user_id = $2`,
    [params.id, session.userId]
  );

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  await execute('UPDATE foster_requests SET status = $1, updated_at = now() WHERE id = $2', [status, params.id]);

  return NextResponse.json({ success: true });
}

// DELETE /api/requests/[id] — foster withdraws their own request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Only fosters can withdraw requests' }, { status: 403 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const fosterProfile = await queryOne<any>('SELECT id FROM foster_profiles WHERE user_id = $1', [session.userId]);
  if (!fosterProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const deleted = await execute('DELETE FROM foster_requests WHERE id = $1 AND foster_id = $2', [
    params.id,
    fosterProfile.id,
  ]);
  if (deleted === 0) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
