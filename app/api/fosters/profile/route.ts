import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { denyIfNotActive } from '@/lib/auth';
import { isValidPhone, normalizePhone } from '@/lib/forms';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // preferences and other_pets are jsonb, so pg hands them back already parsed.
  const profile = await queryOne<any>('SELECT * FROM foster_profiles WHERE user_id = $1', [session.userId]);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const body = await req.json();

  if (body.phone && !isValidPhone(body.phone)) {
    return NextResponse.json({ error: 'Enter a 10-digit phone number' }, { status: 400 });
  }

  const complete = !!(body.fullName && body.phone && body.city && body.dwellingType && body.availableFrom);

  await execute(
    `UPDATE foster_profiles SET
       full_name = $1, phone = $2, city = $3, province = $4, postal_code = $5,
       dwelling_type = $6, fenced_backyard = $7, num_adults = $8, num_children = $9,
       other_pets = $10, preferences = $11, available_from = $12, available_until = $13,
       reminder_frequency = $14, profile_complete = $15, photo_url = $16, updated_at = now()
     WHERE user_id = $17`,
    [
      body.fullName || null, body.phone ? normalizePhone(body.phone) : null, body.city || null,
      body.province || null, body.postalCode || null,
      body.dwellingType || null, !!body.fencedBackyard,
      body.numAdults || 1, body.numChildren || 0,
      // Sent as JSON text; Postgres casts it into the jsonb columns.
      JSON.stringify(body.otherPets || []),
      JSON.stringify(body.preferences || {}),
      body.availableFrom || null, body.availableUntil || null,
      body.reminderFrequency || 'monthly', complete,
      body.photoUrl || null,
      session.userId,
    ]
  );

  return NextResponse.json({ success: true, complete });
}
