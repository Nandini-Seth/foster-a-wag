import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const available = searchParams.get('available');

  let query = `
    SELECT fp.*, u.email
    FROM foster_profiles fp
    JOIN users u ON fp.user_id = u.id
    WHERE fp.profile_complete
  `;
  const params: any[] = [];

  // ILIKE, not LIKE: Postgres string comparison is case-sensitive where SQLite's was not.
  if (city) { params.push(`%${city}%`); query += ` AND fp.city ILIKE $${params.length}`; }
  if (available === '1') { query += ` AND fp.available_from IS NOT NULL AND fp.available_from >= CURRENT_DATE`; }

  query += ` ORDER BY fp.available_from ASC`;

  const fosters = await queryAll(query, params);
  return NextResponse.json(fosters);
}
