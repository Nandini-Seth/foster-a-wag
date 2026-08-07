import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const profile = db.prepare('SELECT * FROM rescue_profiles WHERE user_id = ?').get(session.userId);
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = getDb();

  db.prepare(`
    UPDATE rescue_profiles SET
      org_name = ?, phone = ?, city = ?, province = ?,
      website = ?, contact_email = ?, address = ?
    WHERE user_id = ?
  `).run(
    body.orgName || null, body.phone || null, body.city || null,
    body.province || null, body.website || null,
    body.contactEmail || null, body.address || null,
    session.userId
  );

  return NextResponse.json({ success: true });
}
