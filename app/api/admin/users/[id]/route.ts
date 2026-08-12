import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, transaction } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { isAccountStatus } from '@/lib/auth';

/**
 * Moves an account through the review sequence:
 * PENDING → INFO_REQUESTED → INFO_RECEIVED → ACTIVE (or REJECTED at any point).
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { status } = await req.json();
  if (!isAccountStatus(status)) {
    return NextResponse.json({ error: 'Invalid account status' }, { status: 400 });
  }

  const user = await queryOne<any>('SELECT id, role FROM users WHERE id = $1', [params.id]);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });

  // INFO_RECEIVED means they replied to our email, which is what confirms the
  // address is real — that is the only place email_verified gets set.
  // $1 is cast explicitly: reused across several CASE branches, Postgres can
  // otherwise fail to infer the parameter type.
  await execute(
    `UPDATE users SET
       status = $1::text,
       email_verified = CASE WHEN $1::text IN ('INFO_RECEIVED', 'ACTIVE') THEN true ELSE email_verified END,
       info_requested_at = CASE WHEN $1::text = 'INFO_REQUESTED' THEN now() ELSE info_requested_at END,
       activated_at = CASE WHEN $1::text = 'ACTIVE' THEN now() ELSE activated_at END
     WHERE id = $2`,
    [status, params.id]
  );

  return NextResponse.json({ success: true, status });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const user = await queryOne<any>('SELECT id, role FROM users WHERE id = $1', [params.id]);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });

  // Delete in dependency order, as one transaction: with foreign keys enforced,
  // a failure part way through would abort against a constraint and leave the
  // account half-deleted.
  await transaction(async (client) => {
    const id = [params.id];
    await client.query('DELETE FROM applications WHERE foster_id IN (SELECT id FROM foster_profiles WHERE user_id = $1)', id);
    await client.query('DELETE FROM foster_requests WHERE foster_id IN (SELECT id FROM foster_profiles WHERE user_id = $1)', id);
    await client.query('DELETE FROM foster_profiles WHERE user_id = $1', id);
    await client.query('DELETE FROM applications WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = $1)', id);
    await client.query(
      'DELETE FROM foster_requests WHERE pet_id IN (SELECT id FROM pets WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = $1))',
      id
    );
    await client.query('DELETE FROM pets WHERE rescue_id IN (SELECT id FROM rescue_profiles WHERE user_id = $1)', id);
    await client.query('DELETE FROM rescue_profiles WHERE user_id = $1', id);
    await client.query('DELETE FROM users WHERE id = $1', id);
  });

  return NextResponse.json({ success: true });
}
