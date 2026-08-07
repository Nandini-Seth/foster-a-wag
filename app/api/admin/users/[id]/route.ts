import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { adminVerified } = await req.json();
  if (typeof adminVerified !== 'number' || ![-1, 0, 1].includes(adminVerified)) {
    return NextResponse.json({ error: 'Invalid adminVerified value' }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(params.id) as any;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });

  db.prepare('UPDATE users SET admin_verified = ? WHERE id = ?').run(adminVerified, params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(params.id) as any;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });

  // Delete in dependency order
  db.prepare('DELETE FROM applications WHERE foster_id IN (SELECT id FROM foster_profiles WHERE user_id = ?)').run(params.id);
  db.prepare('DELETE FROM foster_requests WHERE foster_id IN (SELECT id FROM foster_profiles WHERE user_id = ?)').run(params.id);
  db.prepare('DELETE FROM foster_profiles WHERE user_id = ?').run(params.id);
  db.prepare('DELETE FROM applications WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = ?)').run(params.id);
  db.prepare('DELETE FROM foster_requests WHERE pet_id IN (SELECT id FROM pets WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = ?))').run(params.id);
  db.prepare('DELETE FROM pets WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = ?)').run(params.id);
  db.prepare('DELETE FROM rescue_profiles WHERE user_id = ?').run(params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(params.id);

  return NextResponse.json({ success: true });
}
