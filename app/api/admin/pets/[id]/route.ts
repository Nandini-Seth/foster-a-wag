import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = getDb();
  const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(params.id);
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  if (body.status) {
    const valid = ['AVAILABLE', 'IN_FOSTER', 'ADOPTED', 'INACTIVE'];
    if (!valid.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    db.prepare('UPDATE pets SET status = ? WHERE id = ?').run(body.status, params.id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(params.id);
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  db.prepare('DELETE FROM applications WHERE pet_id = ?').run(params.id);
  db.prepare('DELETE FROM foster_requests WHERE pet_id = ?').run(params.id);
  db.prepare('DELETE FROM pets WHERE id = ?').run(params.id);

  return NextResponse.json({ success: true });
}
