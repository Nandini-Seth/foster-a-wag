import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const pet = db.prepare(`
    SELECT p.*, rp.org_name, rp.phone as rescue_phone, rp.contact_email as rescue_email, rp.city as rescue_city, rp.website as rescue_website
    FROM pets p
    JOIN rescue_profiles rp ON p.rescue_id = rp.id
    WHERE p.id = ?
  `).get(params.id) as any;

  if (!pet) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pet);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND rescue_id = ?').get(params.id, session.profileId) as any;
  if (!pet) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

  const body = await req.json();
  if (body.status) {
    db.prepare('UPDATE pets SET status = ? WHERE id = ?').run(body.status, params.id);
  }
  return NextResponse.json({ success: true });
}
