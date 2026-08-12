import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import type { SessionData } from '@/lib/session';

/** Account review states. Only ACTIVE may sign in or act. */
export const ACCOUNT_STATUSES = [
  'PENDING',
  'INFO_REQUESTED',
  'INFO_RECEIVED',
  'ACTIVE',
  'REJECTED',
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export function isAccountStatus(value: unknown): value is AccountStatus {
  return typeof value === 'string' && (ACCOUNT_STATUSES as readonly string[]).includes(value);
}

/** What a person is told at each stage. Deliberately vague about rejection. */
export const STATUS_MESSAGE: Record<AccountStatus, string> = {
  PENDING:
    'Your account is awaiting approval. We will reach out in the next 24-48 hours.',
  INFO_REQUESTED:
    'We have emailed you asking for a few details. Reply to that email and we will finish setting up your account.',
  INFO_RECEIVED:
    'Thanks — we have your details and are finishing your approval. You will hear from us shortly.',
  ACTIVE: 'Your account is active.',
  REJECTED:
    'This account was not approved. Contact us if you think that is a mistake.',
};

/**
 * Re-checks the account against the database on every action.
 *
 * Login already refuses anyone who is not ACTIVE, so this mainly covers the gap
 * where an account is suspended while its owner still holds a valid session
 * cookie — those last seven days otherwise.
 *
 * Returns a response to send back, or null when the account may proceed.
 */
export async function denyIfNotActive(session: SessionData): Promise<NextResponse | null> {
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await queryOne<{ status: AccountStatus }>('SELECT status FROM users WHERE id = $1', [
    session.userId,
  ]);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: STATUS_MESSAGE[user.status] }, { status: 403 });
  }

  return null;
}
