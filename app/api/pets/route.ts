import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const species = searchParams.get('species');
  const city = searchParams.get('city');
  const goodWithKids = searchParams.get('goodWithKids');
  const goodWithDogs = searchParams.get('goodWithDogs');
  const goodWithCats = searchParams.get('goodWithCats');

  let query = `
    SELECT p.*, rp.org_name, rp.city as rescue_city
    FROM pets p
    JOIN rescue_profiles rp ON p.rescue_id = rp.id
    WHERE p.status = 'AVAILABLE'
  `;
  const params: any[] = [];

  if (species) { query += ` AND p.species = ?`; params.push(species); }
  if (city) { query += ` AND p.city LIKE ?`; params.push(`%${city}%`); }
  if (goodWithKids === '1') { query += ` AND p.good_with_kids = 1`; }
  if (goodWithDogs === '1') { query += ` AND p.good_with_dogs = 1`; }
  if (goodWithCats === '1') { query += ` AND p.good_with_cats = 1`; }

  query += ` ORDER BY p.created_at DESC`;

  const pets = db.prepare(query).all(...params);
  return NextResponse.json(pets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = getDb();
  const petId = uuidv4();

  db.prepare(`
    INSERT INTO pets (id, rescue_id, name, species, breed, age_years, sex, weight_kg,
      house_trained, spayed_neutered, microchipped, vaccinated,
      good_with_kids, good_with_dogs, good_with_cats,
      special_needs, bio, available_from, urgent_by, city, province, primary_photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    petId, session.profileId, body.name, body.species, body.breed || null,
    body.ageYears || null, body.sex || null, body.weightKg || null,
    body.houseTrained ? 1 : 0, body.spayedNeutered ? 1 : 0,
    body.microchipped ? 1 : 0, body.vaccinated ? 1 : 0,
    body.goodWithKids ? 1 : 0, body.goodWithDogs ? 1 : 0, body.goodWithCats ? 1 : 0,
    body.specialNeeds || null, body.bio || null,
    body.availableFrom || null, body.urgentBy || null,
    body.city || null, body.province || null, body.primaryPhoto || null
  );

  return NextResponse.json({ success: true, petId });
}
