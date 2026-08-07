import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const users = db.prepare(`
    SELECT u.id, u.email, u.role, u.email_verified, u.admin_verified, u.created_at,
           fp.id as foster_profile_id, fp.full_name, fp.city as foster_city, fp.province as foster_province,
           fp.phone as foster_phone, fp.dwelling_type, fp.profile_complete,
           rp.id as rescue_profile_id, rp.org_name, rp.city as rescue_city, rp.province as rescue_province,
           rp.phone as rescue_phone, rp.website
    FROM users u
    LEFT JOIN foster_profiles fp ON fp.user_id = u.id
    LEFT JOIN rescue_profiles rp ON rp.user_id = u.id
    WHERE u.role != 'ADMIN'
    ORDER BY u.created_at DESC
  `).all() as any[];

  const pets = db.prepare(`
    SELECT p.*, rp.org_name
    FROM pets p
    JOIN rescue_profiles rp ON p.rescue_id = rp.id
    ORDER BY p.created_at DESC
  `).all() as any[];

  const stats = {
    totalUsers: users.length,
    pendingVerification: users.filter(u => !u.admin_verified || u.admin_verified === 0).length,
    verified: users.filter(u => u.admin_verified === 1).length,
    rejected: users.filter(u => u.admin_verified === -1).length,
    totalFosters: users.filter(u => u.role === 'FOSTER').length,
    totalRescues: users.filter(u => u.role === 'RESCUE').length,
    totalPets: pets.length,
    activePets: pets.filter(p => p.status === 'AVAILABLE').length,
  };

  return NextResponse.json({ users, pets, stats });
}
