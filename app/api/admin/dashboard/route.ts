import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await queryAll<any>(
    `SELECT u.id, u.email, u.role, u.email_verified, u.status, u.created_at,
            u.info_requested_at, u.activated_at,
            fp.id as foster_profile_id, fp.full_name, fp.city as foster_city, fp.province as foster_province,
            fp.phone as foster_phone, fp.dwelling_type, fp.profile_complete,
            rp.id as rescue_profile_id, rp.org_name, rp.city as rescue_city, rp.province as rescue_province,
            rp.phone as rescue_phone, rp.website
     FROM users u
     LEFT JOIN foster_profiles fp ON fp.user_id = u.id
     LEFT JOIN rescue_profiles rp ON rp.user_id = u.id
     WHERE u.role <> 'ADMIN'
     ORDER BY u.created_at DESC`
  );

  const pets = await queryAll<any>(
    `SELECT p.*, rp.org_name
     FROM pets p
     JOIN rescue_profiles rp ON p.rescue_id = rp.id
     ORDER BY p.created_at DESC`
  );

  const stats = {
    totalUsers: users.length,
    // "Needs action" — everything that has not reached a final state yet.
    pendingVerification: users.filter((u) => !['ACTIVE', 'REJECTED'].includes(u.status)).length,
    awaitingReply: users.filter((u) => u.status === 'INFO_REQUESTED').length,
    readyToApprove: users.filter((u) => u.status === 'INFO_RECEIVED').length,
    verified: users.filter((u) => u.status === 'ACTIVE').length,
    rejected: users.filter((u) => u.status === 'REJECTED').length,
    totalFosters: users.filter((u) => u.role === 'FOSTER').length,
    totalRescues: users.filter((u) => u.role === 'RESCUE').length,
    totalPets: pets.length,
    activePets: pets.filter((p) => p.status === 'ACTIVE').length,
  };

  return NextResponse.json({ users, pets, stats });
}
