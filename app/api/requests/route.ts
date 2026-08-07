import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

// GET /api/requests — list requests for current rescue (their pets) or current foster
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  if (session.role === 'RESCUE') {
    const requests = db.prepare(`
      SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
             fp.full_name as foster_name, fp.city as foster_city, fp.phone as foster_phone,
             u.email as foster_email
      FROM foster_requests fr
      JOIN pets p ON fr.pet_id = p.id
      JOIN rescue_profiles rp ON p.rescue_id = rp.id
      JOIN foster_profiles fp ON fr.foster_id = fp.id
      JOIN users u ON fp.user_id = u.id
      WHERE rp.user_id = ?
      ORDER BY fr.created_at DESC
    `).all(session.userId);
    return NextResponse.json(requests);
  } else {
    const requests = db.prepare(`
      SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
             rp.org_name, rp.city as rescue_city
      FROM foster_requests fr
      JOIN pets p ON fr.pet_id = p.id
      JOIN rescue_profiles rp ON p.rescue_id = rp.id
      JOIN foster_profiles fp ON fr.foster_id = fp.id
      WHERE fp.user_id = ?
      ORDER BY fr.created_at DESC
    `).all(session.userId);
    return NextResponse.json(requests);
  }
}

// POST /api/requests — foster expresses interest in a pet
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Only fosters can send interest requests' }, { status: 403 });
  }

  const { petId, message } = await req.json();
  if (!petId) {
    return NextResponse.json({ error: 'petId is required' }, { status: 400 });
  }

  const db = getDb();

  // Get foster profile ID
  const fosterProfile = db.prepare('SELECT id FROM foster_profiles WHERE user_id = ?').get(session.userId) as any;
  if (!fosterProfile) {
    return NextResponse.json({ error: 'Foster profile not found' }, { status: 404 });
  }

  // Check pet exists and is available
  const pet = db.prepare("SELECT id FROM pets WHERE id = ? AND status = 'AVAILABLE'").get(petId);
  if (!pet) {
    return NextResponse.json({ error: 'Pet not found or not available' }, { status: 404 });
  }

  // Check no duplicate request
  const existing = db.prepare('SELECT id FROM foster_requests WHERE foster_id = ? AND pet_id = ?').get(fosterProfile.id, petId);
  if (existing) {
    return NextResponse.json({ error: 'You have already expressed interest in this pet' }, { status: 409 });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO foster_requests (id, foster_id, pet_id, message, status)
    VALUES (?, ?, ?, ?, 'PENDING')
  `).run(id, fosterProfile.id, petId, message || null);

  return NextResponse.json({ success: true, id });
}
