import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, orgName, fullName } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }
    if (!['FOSTER', 'RESCUE'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    db.prepare('INSERT INTO users (id, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 1)')
      .run(userId, email, hash, role);

    if (role === 'FOSTER') {
      db.prepare('INSERT INTO foster_profiles (id, user_id, full_name) VALUES (?, ?, ?)').run(profileId, userId, fullName || '');
    } else {
      db.prepare('INSERT INTO rescue_profiles (id, user_id, org_name, contact_email) VALUES (?, ?, ?, ?)').run(profileId, userId, orgName || '', email);
    }

    const session = await getSession();
    session.userId = userId;
    session.role = role;
    session.email = email;
    session.profileId = profileId;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, role, profileId });
  } catch (err: any) {
    console.error('[/api/auth/register]', err);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
