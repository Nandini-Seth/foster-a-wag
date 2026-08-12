import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { denyIfNotActive } from '@/lib/auth';

export async function GET(req: NextRequest) {
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
    WHERE p.status = 'ACTIVE'
  `;
  const params: any[] = [];

  if (species) { params.push(species); query += ` AND p.species = $${params.length}`; }
  // ILIKE, not LIKE: Postgres string comparison is case-sensitive where SQLite's was not.
  if (city) { params.push(`%${city}%`); query += ` AND p.city ILIKE $${params.length}`; }
  if (goodWithKids === '1') { query += ` AND p.good_with_kids`; }
  if (goodWithDogs === '1') { query += ` AND p.good_with_dogs`; }
  if (goodWithCats === '1') { query += ` AND p.good_with_cats`; }

  query += ` ORDER BY p.created_at DESC`;

  const pets = await queryAll(query, params);
  return NextResponse.json(pets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const body = await req.json();
  const petId = uuidv4();

  await execute(
    `INSERT INTO pets (id, rescue_id, name, species, breed, age_years, sex, weight_kg,
      house_trained, spayed_neutered, microchipped, vaccinated,
      good_with_kids, good_with_dogs, good_with_cats,
      special_needs, bio, available_from, urgent_by, city, province, primary_photo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
    [
      petId, session.profileId, body.name, body.species, body.breed || null,
      body.ageYears || null, body.sex || null, body.weightKg || null,
      !!body.houseTrained, !!body.spayedNeutered,
      !!body.microchipped, !!body.vaccinated,
      !!body.goodWithKids, !!body.goodWithDogs, !!body.goodWithCats,
      body.specialNeeds || null, body.bio || null,
      body.availableFrom || null, body.urgentBy || null,
      body.city || null, body.province || null, body.primaryPhoto || null,
    ]
  );

  return NextResponse.json({ success: true, petId });
}
