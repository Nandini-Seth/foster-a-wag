import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    return NextResponse.json({ ok: true, users: result.count });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
