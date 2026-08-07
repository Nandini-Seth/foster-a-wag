import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const available = searchParams.get('available');

  let query = `SELECT fp.*, u.email FROM foster_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.profile_complete = 1`;
  const params: any[] = [];

  if (city) { query += ` AND fp.city LIKE ?`; params.push(`%${city}%`); }
  if (available === '1') { query += ` AND fp.available_from IS NOT NULL AND fp.available_from >= date('now')`; }

  query += ` ORDER BY fp.available_from ASC`;
  const fosters = db.prepare(query).all(...params);
  return NextResponse.json(fosters);
}
