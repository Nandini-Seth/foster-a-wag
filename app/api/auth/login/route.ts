import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';
import { STATUS_MESSAGE, type AccountStatus } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await queryOne<any>('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // The credentials are right, but only an approved account may sign in.
    // Checked after the password so this response cannot be used to work out
    // which addresses are registered.
    if (user.status !== 'ACTIVE') {
      const status = user.status as AccountStatus;
      return NextResponse.json(
        { error: STATUS_MESSAGE[status] ?? 'This account is not active yet.', status },
        { status: 403 }
      );
    }

    // Get profile ID
    let profileId = null;
    if (user.role === 'FOSTER') {
      const fp = await queryOne<any>('SELECT id FROM foster_profiles WHERE user_id = $1', [user.id]);
      profileId = fp?.id;
    } else if (user.role === 'RESCUE') {
      const rp = await queryOne<any>('SELECT id FROM rescue_profiles WHERE user_id = $1', [user.id]);
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
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
