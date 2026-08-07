import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  let applications;

  if (session.role === 'FOSTER') {
    applications = db.prepare(`
      SELECT a.*, p.name as pet_name, p.species, p.primary_photo, p.breed,
             rp.org_name
      FROM applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN rescue_profiles rp ON a.rescue_id = rp.id
      WHERE a.foster_id = ?
      ORDER BY a.created_at DESC
    `).all(session.profileId);
  } else if (session.role === 'RESCUE') {
    applications = db.prepare(`
      SELECT a.*, p.name as pet_name, p.species, p.primary_photo, p.breed,
             fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province
      FROM applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN foster_profiles fp ON a.foster_id = fp.id
      WHERE a.rescue_id = ?
      ORDER BY a.created_at DESC
    `).all(session.profileId);
  }

  return NextResponse.json(applications || []);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = getDb();

  // Check profile is complete
  const profile = db.prepare('SELECT profile_complete FROM foster_profiles WHERE id = ?').get(session.profileId) as any;
  if (!profile?.profile_complete) {
    return NextResponse.json({ error: 'Please complete your foster profile before applying' }, { status: 400 });
  }

  // Get pet to find rescue
  const pet = db.prepare('SELECT rescue_id FROM pets WHERE id = ?').get(body.petId) as any;
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  // Check for existing application
  const existing = db.prepare('SELECT id FROM applications WHERE foster_id = ? AND pet_id = ?').get(session.profileId, body.petId);
  if (existing) return NextResponse.json({ error: 'You have already applied for this pet' }, { status: 409 });

  const appId = uuidv4();
  db.prepare(`
    INSERT INTO applications (id, foster_id, pet_id, rescue_id, motivation, daily_schedule,
      vet_ref_name, vet_ref_phone, personal_ref_name, personal_ref_phone,
      agreed_to_terms, signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    appId, session.profileId, body.petId, pet.rescue_id,
    body.motivation || null, body.dailySchedule || null,
    body.vetRefName || null, body.vetRefPhone || null,
    body.personalRefName || null, body.personalRefPhone || null,
    body.agreedToTerms ? 1 : 0, body.signature || null
  );

  return NextResponse.json({ success: true, applicationId: appId });
}
