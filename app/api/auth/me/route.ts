import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false });
  }
  return NextResponse.json({
    isLoggedIn: true,
    userId: session.userId,
    role: session.role,
    email: session.email,
    profileId: session.profileId,
  });
}
