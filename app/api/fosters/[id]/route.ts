import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || (session.role !== 'RESCUE' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const foster = db.prepare(`
    SELECT fp.*, u.email
    FROM foster_profiles fp
    JOIN users u ON fp.user_id = u.id
    WHERE fp.id = ?
  `).get(params.id) as any;

  if (!foster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (foster.preferences) foster.preferences = JSON.parse(foster.preferences);
  if (foster.other_pets) foster.other_pets = JSON.parse(foster.other_pets);

  return NextResponse.json(foster);
}
