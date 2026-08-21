import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, transaction } from '@/lib/db';
import { isValidEmail, isProvinceCode, isValidPhone, normalizePhone } from '@/lib/forms';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Creates an account in PENDING and stops there.
 *
 * No session is issued — registering does not grant access. An admin reviews the
 * application, and only an ACTIVE account can sign in.
 *
 * Profile details arrive with this request rather than in a follow-up call,
 * because the caller now has no session to authenticate that follow-up with.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, orgName, fullName, profile } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }
    if (!['FOSTER', 'RESCUE'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Re-checked here, not just in the form: the client validation is a courtesy,
    // and an unroutable address means we can never approve the account.
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address, like name@example.com' },
        { status: 400 }
      );
    }
    if (profile?.province && !isProvinceCode(profile.province)) {
      return NextResponse.json({ error: 'Select a valid province or territory' }, { status: 400 });
    }
    if (profile?.phone && !isValidPhone(profile.phone)) {
      return NextResponse.json({ error: 'Enter a 10-digit phone number' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    const p = profile || {};

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, email_verified, status)
         VALUES ($1, $2, $3, $4, false, 'PENDING')`,
        [userId, normalizedEmail, hash, role]
      );

      if (role === 'FOSTER') {
        const complete = !!(fullName && p.phone && p.city && p.dwellingType && p.availableFrom);
        await client.query(
          `INSERT INTO foster_profiles
             (id, user_id, full_name, phone, city, province, postal_code, dwelling_type,
              fenced_backyard, num_adults, num_children, other_pets, preferences,
              available_from, reminder_frequency, profile_complete)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            profileId, userId, fullName || '', p.phone ? normalizePhone(p.phone) : null, p.city || null,
            p.province || null, p.postalCode || null, p.dwellingType || null,
            !!p.fencedBackyard, p.numAdults || 1, p.numChildren || 0,
            JSON.stringify(p.otherPets || []),
            JSON.stringify(p.preferences || {}),
            p.availableFrom || null, p.reminderFrequency || 'monthly', complete,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO rescue_profiles
             (id, user_id, org_name, phone, city, province, website, contact_email, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            profileId, userId, orgName || '', p.phone ? normalizePhone(p.phone) : null, p.city || null,
            p.province || null, p.website || null, p.contactEmail || normalizedEmail,
            p.address || null,
          ]
        );
      }
    });

    return NextResponse.json({ success: true, status: 'PENDING', role });
  } catch (err) {
    console.error('[/api/auth/register]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
