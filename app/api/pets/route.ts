import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { denyIfNotActive } from '@/lib/auth';
import { COMPAT_VALUES, HOUSE_TRAINED_VALUES, isProvinceCode, urgentByError } from '@/lib/forms';
import { logDbError } from '@/lib/schema';

/** Falls back to UNKNOWN rather than trusting whatever the client sent. */
function compat(value: unknown): string {
  return typeof value === 'string' && COMPAT_VALUES.includes(value) ? value : 'UNKNOWN';
}

function houseTrained(value: unknown): string {
  return typeof value === 'string' && HOUSE_TRAINED_VALUES.includes(value) ? value : 'UNKNOWN';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const species = searchParams.get('species');
  const city = searchParams.get('city');
  const sex = searchParams.get('sex');
  const availableBy = searchParams.get('availableBy');
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
  if (sex) { params.push(sex); query += ` AND p.sex = $${params.length}`; }
  // "Available by" means the pet can be placed on or before that date. A pet with
  // no date set is included: the listing reads "Contact rescue", so excluding it
  // would hide animals that may well be available.
  if (availableBy && /^\d{4}-\d{2}-\d{2}$/.test(availableBy)) {
    params.push(availableBy);
    query += ` AND (p.available_from IS NULL OR p.available_from <= $${params.length}::date)`;
  }
  // 'YES' only. Someone filtering for "good with kids" needs an assurance, and
  // UNKNOWN is the absence of one.
  if (goodWithKids === '1') { query += ` AND p.good_with_kids = 'YES'`; }
  if (goodWithDogs === '1') { query += ` AND p.good_with_dogs = 'YES'`; }
  if (goodWithCats === '1') { query += ` AND p.good_with_cats = 'YES'`; }

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

  if (!String(body.name || '').trim()) {
    return NextResponse.json({ error: 'Pet name is required' }, { status: 400 });
  }
  if (!String(body.species || '').trim()) {
    return NextResponse.json({ error: 'Species is required' }, { status: 400 });
  }
  if (body.province && !isProvinceCode(body.province)) {
    return NextResponse.json({ error: 'Select a valid province or territory' }, { status: 400 });
  }
  const dateProblem = urgentByError(body.availableFrom, body.urgentBy);
  if (dateProblem) {
    return NextResponse.json({ error: dateProblem }, { status: 400 });
  }

  const petId = uuidv4();

  try {
    await execute(
      `INSERT INTO pets (id, rescue_id, name, species, breed, age_years, sex, weight_kg,
        house_trained, spayed_neutered, vaccinated,
        good_with_kids, good_with_dogs, good_with_cats,
        special_needs, bio, available_from, urgent_by, city, province, primary_photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        petId, session.profileId, body.name, body.species, body.breed || null,
        body.ageYears || null, body.sex || null, body.weightKg || null,
        houseTrained(body.houseTrained), !!body.spayedNeutered, !!body.vaccinated,
        compat(body.goodWithKids), compat(body.goodWithDogs), compat(body.goodWithCats),
        body.specialNeeds || null, body.bio || null,
        body.availableFrom || null, body.urgentBy || null,
        body.city || null, body.province || null, body.primaryPhoto || null,
      ]
    );
  } catch (err) {
    // A schema mismatch is an operational fault, not the rescue's mistake — say
    // so, rather than telling them their perfectly valid post failed.
    if (logDbError('POST /api/pets', err)) {
      return NextResponse.json(
        { error: 'This site is being updated and cannot accept new posts right now. Please try again shortly.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Could not post this pet. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, petId });
}
