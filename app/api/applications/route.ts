import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { denyIfNotActive } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let applications;

  if (session.role === 'FOSTER') {
    applications = await queryAll(
      `SELECT a.*, p.name as pet_name, p.species, p.primary_photo, p.breed,
              rp.org_name
       FROM applications a
       JOIN pets p ON a.pet_id = p.id
       JOIN rescue_profiles rp ON a.rescue_id = rp.id
       WHERE a.foster_id = $1
       ORDER BY a.created_at DESC`,
      [session.profileId]
    );
  } else if (session.role === 'RESCUE') {
    applications = await queryAll(
      `SELECT a.*, p.name as pet_name, p.species, p.primary_photo, p.breed,
              fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province
       FROM applications a
       JOIN pets p ON a.pet_id = p.id
       JOIN foster_profiles fp ON a.foster_id = fp.id
       WHERE a.rescue_id = $1
       ORDER BY a.created_at DESC`,
      [session.profileId]
    );
  }

  return NextResponse.json(applications || []);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const body = await req.json();
  if (!isUuid(body.petId)) {
    return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
  }

  // Check profile is complete
  const profile = await queryOne<any>('SELECT profile_complete FROM foster_profiles WHERE id = $1', [
    session.profileId,
  ]);
  if (!profile?.profile_complete) {
    return NextResponse.json({ error: 'Please complete your foster profile before applying' }, { status: 400 });
  }

  // Get pet to find rescue. Only ACTIVE posts take applications — a PENDING or
  // DELETED post is not public, so an application against one can only come
  // from a stale page or a hand-made request.
  const pet = await queryOne<any>('SELECT rescue_id, status FROM pets WHERE id = $1', [body.petId]);
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
  if (pet.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'This pet is no longer accepting applications' }, { status: 409 });
  }

  // Check for existing application
  const existing = await queryOne('SELECT id FROM applications WHERE foster_id = $1 AND pet_id = $2', [
    session.profileId,
    body.petId,
  ]);
  if (existing) return NextResponse.json({ error: 'You have already applied for this pet' }, { status: 409 });

  const appId = uuidv4();
  await execute(
    `INSERT INTO applications (id, foster_id, pet_id, rescue_id, motivation, daily_schedule,
       vet_ref_name, vet_ref_phone, personal_ref_name, personal_ref_phone,
       agreed_to_terms, signature)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      appId, session.profileId, body.petId, pet.rescue_id,
      body.motivation || null, body.dailySchedule || null,
      body.vetRefName || null, body.vetRefPhone || null,
      body.personalRefName || null, body.personalRefPhone || null,
      !!body.agreedToTerms, body.signature || null,
    ]
  );

  return NextResponse.json({ success: true, applicationId: appId });
}
