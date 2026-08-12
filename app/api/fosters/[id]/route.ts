import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || (session.role !== 'RESCUE' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // preferences and other_pets are jsonb, so pg hands them back already parsed.
  const foster = await queryOne<any>(
    `SELECT fp.*, u.email
     FROM foster_profiles fp
     JOIN users u ON fp.user_id = u.id
     WHERE fp.id = $1`,
    [params.id]
  );

  if (!foster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(foster);
}
