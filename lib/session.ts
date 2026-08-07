import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  role?: 'FOSTER' | 'RESCUE' | 'ADMIN';
  email?: string;
  profileId?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'foster-a-wag-secret-key-min-32-chars-!!',
  cookieName: 'foster-a-wag-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
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
