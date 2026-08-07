import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'RESCUE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const profileId = session.profileId;

  const profile = db.prepare('SELECT * FROM rescue_profiles WHERE id = ?').get(profileId);
  const pets = db.prepare('SELECT * FROM pets WHERE rescue_id = ? ORDER BY created_at DESC').all(profileId);
  const applications = db.prepare(`
    SELECT a.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
           fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province,
           u.email as foster_email
    FROM applications a
    JOIN pets p ON a.pet_id = p.id
    JOIN foster_profiles fp ON a.foster_id = fp.id
    JOIN users u ON fp.user_id = u.id
    WHERE a.rescue_id = ?
    ORDER BY a.created_at DESC
  `).all(profileId);

  const requests = db.prepare(`
    SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo,
           fp.full_name as foster_name, fp.city as foster_city, fp.province as foster_province, fp.phone as foster_phone,
           u.email as foster_email
    FROM foster_requests fr
    JOIN pets p ON fr.pet_id = p.id
    JOIN foster_profiles fp ON fr.foster_id = fp.id
    JOIN users u ON fp.user_id = u.id
    WHERE p.rescue_id = ?
    ORDER BY fr.created_at DESC
  `).all(profileId);

  const stats = {
    totalPets: (pets as any[]).length,
    availablePets: (pets as any[]).filter((p: any) => p.status === 'AVAILABLE').length,
    inFoster: (pets as any[]).filter((p: any) => p.status === 'IN_FOSTER').length,
    pendingApplications: (applications as any[]).filter((a: any) => a.status === 'PENDING').length,
    pendingRequests: (requests as any[]).filter((r: any) => r.status === 'PENDING').length,
  };

  return NextResponse.json({ profile, pets, applications, requests, stats });
}
