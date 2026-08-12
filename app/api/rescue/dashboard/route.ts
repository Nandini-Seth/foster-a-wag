import { NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileId = session.profileId;

  const profile = await queryOne<any>('SELECT * FROM rescue_profiles WHERE id = $1', [profileId]);
  const pets = await queryAll<any>('SELECT * FROM pets WHERE rescue_id = $1 ORDER BY created_at DESC', [profileId]);

  const applications = await queryAll<any>(
    `SELECT a.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
            fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province,
            u.email as foster_email
     FROM applications a
     JOIN pets p ON a.pet_id = p.id
     JOIN foster_profiles fp ON a.foster_id = fp.id
     JOIN users u ON fp.user_id = u.id
     WHERE a.rescue_id = $1
     ORDER BY a.created_at DESC`,
    [profileId]
  );

  const requests = await queryAll<any>(
    `SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
            fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province,
            fp.phone as foster_phone, u.email as foster_email
     FROM foster_requests fr
     JOIN pets p ON fr.pet_id = p.id
     JOIN foster_profiles fp ON fr.foster_id = fp.id
     JOIN users u ON fp.user_id = u.id
     WHERE p.rescue_id = $1
     ORDER BY fr.created_at DESC`,
    [profileId]
  );

  const stats = {
    totalPets: pets.filter((p) => p.status !== 'DELETED').length,
    availablePets: pets.filter((p) => p.status === 'ACTIVE').length,
    inFoster: pets.filter((p) => p.status === 'PENDING').length,
    pendingApplications: applications.filter((a) => a.status === 'PENDING').length,
    pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
  };

  return NextResponse.json({ profile, pets, applications, requests, stats });
}
