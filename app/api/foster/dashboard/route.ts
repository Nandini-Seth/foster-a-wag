import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const profileId = session.profileId;

  const profile = db.prepare('SELECT * FROM foster_profiles WHERE id = ?').get(profileId) as any;
  if (profile?.preferences) profile.preferences = JSON.parse(profile.preferences);
  if (profile?.other_pets) profile.other_pets = JSON.parse(profile.other_pets);

  const applications = db.prepare(`
    SELECT a.*, p.name as pet_name, p.species, p.breed, p.primary_photo, rp.org_name
    FROM applications a
    JOIN pets p ON a.pet_id = p.id
    JOIN rescue_profiles rp ON a.rescue_id = rp.id
    WHERE a.foster_id = ?
    ORDER BY a.created_at DESC
  `).all(profileId);

  const requests = db.prepare(`
    SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo, rp.org_name
    FROM foster_requests fr
    JOIN pets p ON fr.pet_id = p.id
    JOIN rescue_profiles rp ON p.rescue_id = rp.id
    WHERE fr.foster_id = ?
    ORDER BY fr.created_at DESC
  `).all(profileId);

  const stats = {
    activeApplications: (applications as any[]).filter((a: any) => ['PENDING','UNDER_REVIEW'].includes(a.status)).length,
    acceptedApplications: (applications as any[]).filter((a: any) => a.status === 'ACCEPTED').length,
    totalApplications: (applications as any[]).length,
    pendingRequests: (requests as any[]).filter((r: any) => r.status === 'PENDING').length,
  };

  return NextResponse.json({ profile, applications, requests, stats });
}
