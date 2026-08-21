import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { denyIfNotActive } from '@/lib/auth';
import { isValidPhone, normalizePhone } from '@/lib/forms';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const profile = await queryOne<any>('SELECT * FROM rescue_profiles WHERE user_id = $1', [session.userId]);
  return NextResponse.json(profile ?? null);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const denied = await denyIfNotActive(session);
  if (denied) return denied;

  const body = await req.json();

  if (body.phone && !isValidPhone(body.phone)) {
    return NextResponse.json({ error: 'Enter a 10-digit phone number' }, { status: 400 });
  }

  await execute(
    `UPDATE rescue_profiles SET
       org_name = $1, phone = $2, city = $3, province = $4,
       website = $5, contact_email = $6, address = $7
     WHERE user_id = $8`,
    [
      body.orgName || null, body.phone ? normalizePhone(body.phone) : null, body.city || null,
      body.province || null, body.website || null,
      body.contactEmail || null, body.address || null,
      session.userId,
    ]
  );

  return NextResponse.json({ success: true });
}
