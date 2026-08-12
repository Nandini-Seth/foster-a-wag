import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, transaction } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isUuid } from '@/lib/validate';
import { isPetState } from '@/lib/pets';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  const body = await req.json();
  const pet = await queryOne('SELECT id FROM pets WHERE id = $1', [params.id]);
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  if (body.status) {
    if (!isPetState(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    await execute('UPDATE pets SET status = $1 WHERE id = $2', [body.status, params.id]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  const pet = await queryOne('SELECT id FROM pets WHERE id = $1', [params.id]);
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

  // Foreign keys are enforced now, so these have to succeed or fail together —
  // stopping half way would leave applications pointing at a deleted pet.
  await transaction(async (client) => {
    await client.query('DELETE FROM applications WHERE pet_id = $1', [params.id]);
    await client.query('DELETE FROM foster_requests WHERE pet_id = $1', [params.id]);
    await client.query('DELETE FROM pets WHERE id = $1', [params.id]);
  });

  return NextResponse.json({ success: true });
}
