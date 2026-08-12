import { NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'FOSTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileId = session.profileId;

  // preferences and other_pets are jsonb, so pg hands them back already parsed.
  const profile = await queryOne<any>('SELECT * FROM foster_profiles WHERE id = $1', [profileId]);

  const applications = await queryAll<any>(
    `SELECT a.*, p.name as pet_name, p.species, p.breed, p.primary_photo, rp.org_name
     FROM applications a
     JOIN pets p ON a.pet_id = p.id
     JOIN rescue_profiles rp ON a.rescue_id = rp.id
     WHERE a.foster_id = $1
     ORDER BY a.created_at DESC`,
    [profileId]
  );

  const requests = await queryAll<any>(
    `SELECT fr.*, p.name as pet_name, p.species, p.breed, p.primary_photo, rp.org_name
     FROM foster_requests fr
     JOIN pets p ON fr.pet_id = p.id
     JOIN rescue_profiles rp ON p.rescue_id = rp.id
     WHERE fr.foster_id = $1
     ORDER BY fr.created_at DESC`,
    [profileId]
  );

  const stats = {
    activeApplications: applications.filter((a) => ['PENDING', 'UNDER_REVIEW'].includes(a.status)).length,
    acceptedApplications: applications.filter((a) => a.status === 'ACCEPTED').length,
    totalApplications: applications.length,
    pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
  };

  return NextResponse.json({ profile, applications, requests, stats });
}
