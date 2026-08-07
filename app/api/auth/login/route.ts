import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Get profile ID
    let profileId = null;
    if (user.role === 'FOSTER') {
      const fp = db.prepare('SELECT id FROM foster_profiles WHERE user_id = ?').get(user.id) as any;
      profileId = fp?.id;
    } else if (user.role === 'RESCUE') {
      const rp = db.prepare('SELECT id FROM rescue_profiles WHERE user_id = ?').get(user.id) as any;
      profileId = rp?.id;
    }

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.email = user.email;
    session.profileId = profileId;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, role: user.role, profileId });
  } catch (err: any) {
    console.error('[/api/auth/login]', err);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
