import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const profile = db.prepare('SELECT * FROM foster_profiles WHERE user_id = ?').get(session.userId) as any;
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (profile.preferences) profile.preferences = JSON.parse(profile.preferences);
  if (profile.other_pets) profile.other_pets = JSON.parse(profile.other_pets);
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = getDb();

  const complete = !!(body.fullName && body.phone && body.city && body.dwellingType && body.availableFrom);

  db.prepare(`
    UPDATE foster_profiles SET
      full_name = ?, phone = ?, city = ?, province = ?, postal_code = ?,
      dwelling_type = ?, fenced_backyard = ?, num_adults = ?, num_children = ?,
      other_pets = ?, preferences = ?, available_from = ?, available_until = ?,
      reminder_frequency = ?, profile_complete = ?, photo_url = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(
    body.fullName || null, body.phone || null, body.city || null,
    body.province || null, body.postalCode || null,
    body.dwellingType || null, body.fencedBackyard ? 1 : 0,
    body.numAdults || 1, body.numChildren || 0,
    JSON.stringify(body.otherPets || []),
    JSON.stringify(body.preferences || {}),
    body.availableFrom || null, body.availableUntil || null,
    body.reminderFrequency || 'monthly', complete ? 1 : 0,
    body.photoUrl || null,
    session.userId
  );

  return NextResponse.json({ success: true, complete });
}
