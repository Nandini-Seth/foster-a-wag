import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { denyIfNotActive } from '@/lib/auth';

// GET /api/requests — list requests for current rescue (their pets) or current foster
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role === 'RESCUE') {
    const requests = await queryAll(
      `SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
              fp.full_name as foster_name, fp.city as foster_city, fp.phone as foster_phone,
              u.email as foster_email
       FROM foster_requests fr
       JOIN pets p ON fr.pet_id = p.id
       JOIN rescue_profiles rp ON p.rescue_id = rp.id
       JOIN foster_profiles fp ON fr.foster_id = fp.id
       JOIN users u ON fp.user_id = u.id
       WHERE rp.user_id = $1
       ORDER BY fr.created_at DESC`,
      [session.userId]
    );
    return NextResponse.json(requests);
  }

  const requests = await queryAll(
    `SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
            rp.org_name, rp.city as rescue_city
     FROM foster_requests fr
     JOIN pets p ON fr.pet_id = p.id
     JOIN rescue_profiles rp ON p.rescue_id = rp.id
     JOIN foster_profiles fp ON fr.foster_id = fp.id
     WHERE fp.user_id = $1
     ORDER BY fr.created_at DESC`,
    [session.userId]
  );
  return NextResponse.json(requests);
}

// POST /api/requests — foster expresses interest in a pet
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Only fosters can send interest requests' }, { status: 403 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const { petId, message } = await req.json();
  if (!petId) {
    return NextResponse.json({ error: 'petId is required' }, { status: 400 });
  }
  if (!isUuid(petId)) {
    return NextResponse.json({ error: 'Pet not found or not available' }, { status: 404 });
  }

  // Get foster profile ID
  const fosterProfile = await queryOne<any>('SELECT id FROM foster_profiles WHERE user_id = $1', [session.userId]);
  if (!fosterProfile) {
    return NextResponse.json({ error: 'Foster profile not found' }, { status: 404 });
  }

  // Check pet exists and is available
  const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND status = 'ACTIVE'", [petId]);
  if (!pet) {
    return NextResponse.json({ error: 'Pet not found or not available' }, { status: 404 });
  }

  // Check no duplicate request
  const existing = await queryOne('SELECT id FROM foster_requests WHERE foster_id = $1 AND pet_id = $2', [
    fosterProfile.id,
    petId,
  ]);
  if (existing) {
    return NextResponse.json({ error: 'You have already expressed interest in this pet' }, { status: 409 });
  }

  const id = uuidv4();
  await execute(
    `INSERT INTO foster_requests (id, foster_id, pet_id, message, status)
     VALUES ($1, $2, $3, $4, 'PENDING')`,
    [id, fosterProfile.id, petId, message || null]
  );

  return NextResponse.json({ success: true, id });
}
