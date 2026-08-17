import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { denyIfNotActive } from '@/lib/auth';
import { isPetState, PUBLIC_PET_STATE } from '@/lib/pets';
import { COMPAT_VALUES, HOUSE_TRAINED_VALUES, isProvinceCode } from '@/lib/forms';

/**
 * ACTIVE posts are public. PENDING and DELETED are visible only to the rescue
 * that owns them (and to admins), so a hidden post cannot be reached by URL.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pet = await queryOne<any>(
    `SELECT p.*, rp.org_name, rp.phone as rescue_phone, rp.contact_email as rescue_email,
            rp.city as rescue_city, rp.website as rescue_website, rp.user_id as rescue_user_id
     FROM pets p
     JOIN rescue_profiles rp ON p.rescue_id = rp.id
     WHERE p.id = $1`,
    [params.id]
  );

  if (!pet) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (pet.status !== PUBLIC_PET_STATE) {
    const session = await getSession();
    const isOwner = session.isLoggedIn && session.userId === pet.rescue_user_id;
    const isAdmin = session.isLoggedIn && session.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  // Internal join key — not part of the public shape.
  delete pet.rescue_user_id;

  return NextResponse.json(pet);
}

// Fields a rescue may change after posting.
const EDITABLE_FIELDS: Record<string, string> = {
  name: 'name',
  species: 'species',
  breed: 'breed',
  ageYears: 'age_years',
  sex: 'sex',
  weightKg: 'weight_kg',
  houseTrained: 'house_trained',
  spayedNeutered: 'spayed_neutered',
  vaccinated: 'vaccinated',
  goodWithKids: 'good_with_kids',
  goodWithDogs: 'good_with_dogs',
  goodWithCats: 'good_with_cats',
  specialNeeds: 'special_needs',
  bio: 'bio',
  availableFrom: 'available_from',
  urgentBy: 'urgent_by',
  city: 'city',
  province: 'province',
  primaryPhoto: 'primary_photo',
};

const BOOLEAN_FIELDS = new Set(['spayed_neutered', 'vaccinated']);

// Three-valued columns, each with its own allowed set.
const ENUM_FIELDS: Record<string, string[]> = {
  house_trained: HOUSE_TRAINED_VALUES,
  good_with_kids: COMPAT_VALUES,
  good_with_dogs: COMPAT_VALUES,
  good_with_cats: COMPAT_VALUES,
};

const NULLABLE_TEXT = new Set([
  'breed', 'sex', 'special_needs', 'bio', 'available_from', 'urgent_by',
  'city', 'province', 'primary_photo', 'age_years', 'weight_kg',
]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

  const pet = await queryOne<any>('SELECT * FROM pets WHERE id = $1 AND rescue_id = $2', [
    params.id,
    session.profileId,
  ]);
  if (!pet) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

  const body = await req.json();

  const changingState = typeof body.status !== 'undefined';
  const contentKeys = Object.keys(body).filter((k) => k in EDITABLE_FIELDS);

  // A deleted post is locked. Restoring it out of DELETED is the only change
  // allowed, and it has to happen on its own.
  if (pet.status === 'DELETED') {
    if (contentKeys.length > 0) {
      return NextResponse.json(
        { error: 'This post is deleted. Restore it before making changes.' },
        { status: 409 }
      );
    }
    if (!changingState) {
      return NextResponse.json({ error: 'This post is deleted.' }, { status: 409 });
    }
  }

  if (changingState && !isPetState(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const sets: string[] = [];
  const values: any[] = [];

  for (const key of contentKeys) {
    const column = EDITABLE_FIELDS[key];
    let value = body[key];

    if (BOOLEAN_FIELDS.has(column)) {
      value = !!value;
    } else if (ENUM_FIELDS[column]) {
      if (!ENUM_FIELDS[column].includes(value)) {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
    } else if (NULLABLE_TEXT.has(column)) {
      value = value === '' || typeof value === 'undefined' ? null : value;
    }

    values.push(value);
    sets.push(`${column} = $${values.length}`);
  }

  if (changingState) {
    values.push(body.status);
    sets.push(`status = $${values.length}`);
    // Stamp or clear the soft-delete time alongside the state it describes.
    sets.push(body.status === 'DELETED' ? 'deleted_at = now()' : 'deleted_at = NULL');
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // `name` and `species` are NOT NULL — reject a blank rather than hitting the
  // constraint and returning a 500.
  if (contentKeys.includes('name') && !String(body.name || '').trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (contentKeys.includes('species') && !String(body.species || '').trim()) {
    return NextResponse.json({ error: 'Species is required' }, { status: 400 });
  }
  if (contentKeys.includes('province') && body.province && !isProvinceCode(body.province)) {
    return NextResponse.json({ error: 'Select a valid province or territory' }, { status: 400 });
  }

  values.push(params.id);
  await execute(`UPDATE pets SET ${sets.join(', ')} WHERE id = $${values.length}`, values);

  return NextResponse.json({ success: true });
}
