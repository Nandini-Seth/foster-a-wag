import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  role?: 'FOSTER' | 'RESCUE' | 'ADMIN';
  email?: string;
  profileId?: string;
  isLoggedIn: boolean;
}

// Development-only fallback. In production a missing SESSION_SECRET is fatal:
// booting with a known secret would let anyone forge a session cookie.
const DEV_SECRET = 'dev-only-insecure-session-secret-32-chars-min';

function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    // `next build` runs with NODE_ENV=production but has no runtime config yet,
    // so the secret is only required once the server is actually serving.
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

    if (process.env.NODE_ENV === 'production' && !isBuild) {
      throw new Error(
        'SESSION_SECRET is not set. Refusing to start — session cookies would be forgeable. ' +
          'Set it from Secret Manager on Cloud Run.'
      );
    }
    return DEV_SECRET;
  }

  if (secret.length < 32) {
    throw new Error(`SESSION_SECRET must be at least 32 characters (got ${secret.length}).`);
  }

  return secret;
}

export const sessionOptions: SessionOptions = {
  password: resolveSecret(),
  cookieName: 'foster-a-wag-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  return session;
}
