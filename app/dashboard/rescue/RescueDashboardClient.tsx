'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { formatPhone } from '@/lib/forms';
import PetPhoto from '@/components/PetPhoto';

export default function RescueDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pets'|'applications'>('pets');
  const [updatingApp, setUpdatingApp] = useState<string|null>(null);
  const [expandedApp, setExpandedApp] = useState<string|null>(null);
  const searchParams = useSearchParams();

  const refresh = () => fetch('/api/rescue/dashboard').then(r=>r.json()).then(d=>{setData(d);setLoading(false);});
  useEffect(() => { refresh(); }, []);

  const updateAppStatus = async (appId: string, status: string) => {
    setUpdatingApp(appId);
    await fetch(`/api/applications/${appId}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status }),
    });
    await refresh();
    setUpdatingApp(null);
  };

  const updatePetStatus = async (petId: string, status: string) => {
    await fetch(`/api/pets/${petId}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status }),
    });
    await refresh();
  };

  const statusColors: Record<string,string> = {
    PENDING:'bg-yellow-100 text-yellow-700', UNDER_REVIEW:'bg-blue-100 text-blue-700',
    ACCEPTED:'bg-green-100 text-green-700', DECLINED:'bg-red-100 text-red-700',
  };
  const petStatusColors: Record<string,string> = {
    ACTIVE:'bg-green-100 text-green-700',
    PENDING:'bg-amber-100 text-amber-800',
    DELETED:'bg-stone-200 text-stone-500',
  };

  if (loading) return (
    <><Navbar /><div className="max-w-5xl mx-auto px-6 py-20 text-center text-stone-400">Loading dashboard…</div></>
  );

  const profile = data?.profile;
  const pets = data?.pets || [];
  const apps = data?.applications || [];
  const stats = data?.stats || {};

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {searchParams.get('welcome') && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">Welcome to Foster A Wag!</p>
              <p className="text-green-700 text-sm">Start by posting your first pet to find a foster home.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-green-900">{profile?.org_name || 'Rescue Dashboard'}</h1>
            <p className="text-stone-500">{profile?.city}{profile?.province ? `, ${profile.province}` : ''}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/fosters" className="border border-green-700 text-green-800 hover:bg-green-50 font-semibold px-4 py-2.5 rounded-full text-sm transition-colors">
              Browse Fosters
            </Link>
            <Link href="/rescue/pets/new" className="bg-green-800 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-colors">
              + Post a Pet
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            ['Total Pets', stats.totalPets||0, '🐾'],
            ['Available', stats.availablePets||0, '🟢'],
            ['In Foster', stats.inFoster||0, '🏡'],
            ['Pending Apps', stats.pendingApplications||0, '📋'],
          ].map(([lbl,val,icon]) => (
            <div key={lbl as string} className="bg-white rounded-2xl border border-stone-100 p-5 text-center shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-3xl text-green-900">{val}</div>
              <div className="text-stone-500 text-xs mt-1">{lbl}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
          {([
            ['pets', '🐾 My Pets', 0],
            ['applications', '📋 Applications', stats.pendingApplications||0],
          ] as const).map(([t, lbl, badge]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {lbl}
              {badge > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* MY PETS TAB */}
        {tab === 'pets' && (
          pets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="font-display text-2xl text-stone-600 mb-2">No pets posted yet</h3>
              <p className="text-stone-400 text-sm mb-6">Post your first animal to start finding foster homes.</p>
              <Link href="/rescue/pets/new" className="bg-green-800 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full">
                Post Your First Pet →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet: any) => (
                <div key={pet.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    pet.status === 'DELETED' ? 'border-stone-200 opacity-60' : 'border-stone-100'
                  }`}>
                  <div className="h-36 bg-white relative overflow-hidden">
                    <PetPhoto src={pet.primary_photo} alt={pet.name}
                      className={`w-full h-full bg-white ${pet.status === 'DELETED' ? 'grayscale' : ''}`} />
                    <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold ${petStatusColors[pet.status] || petStatusColors.PENDING}`}>
                      {pet.status === 'PENDING' ? '⏸ Pending' : pet.status === 'DELETED' ? '🗑 Deleted' : 'Active'}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-stone-800">{pet.name}</p>
                    <p className="text-stone-400 text-xs">{pet.breed||pet.species} · {pet.age_years}yr · {pet.city}</p>
                    {pet.status === 'PENDING' && (
                      <p className="text-amber-700 text-xs mt-1.5">Hidden from the public — only you can see this.</p>
                    )}
                    {pet.status === 'DELETED' && (
                      <p className="text-stone-400 text-xs mt-1.5">Deleted and locked. Restore it to edit.</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {pet.status !== 'DELETED' ? (
                        <>
                          <Link href={`/rescue/pets/${pet.id}/edit`}
                            className="flex-1 text-xs text-center bg-green-800 hover:bg-green-700 text-white py-1.5 rounded-lg">
                            Edit
                          </Link>
                          <Link href={`/pets/${pet.id}`} className="flex-1 text-xs text-center border border-stone-200 hover:bg-stone-50 py-1.5 rounded-lg text-stone-600">
                            View
                          </Link>
                          {pet.status === 'ACTIVE' ? (
                            <button onClick={() => updatePetStatus(pet.id,'PENDING')}
                              className="flex-1 text-xs border border-amber-300 hover:bg-amber-50 py-1.5 rounded-lg text-amber-800">
                              Mark Pending
                            </button>
                          ) : (
                            <button onClick={() => updatePetStatus(pet.id,'ACTIVE')}
                              className="flex-1 text-xs border border-green-200 hover:bg-green-50 py-1.5 rounded-lg text-green-700">
                              Make Active
                            </button>
                          )}
                        </>
                      ) : (
                        <button onClick={() => updatePetStatus(pet.id,'ACTIVE')}
                          className="flex-1 text-xs border border-green-200 hover:bg-green-50 py-1.5 rounded-lg text-green-700">
                          ♻️ Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* APPLICATIONS TAB */}
        {tab === 'applications' && (
          apps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-display text-2xl text-stone-600 mb-2">No applications yet</h3>
              <p className="text-stone-400 text-sm">Full applications from fosters will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app: any) => (
                <div key={app.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {app.primary_photo && (
                      <PetPhoto src={app.primary_photo} alt={app.pet_name} className="w-16 h-16 rounded-xl bg-white flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-stone-800">
                            {app.foster_name} <span className="text-stone-400 font-normal">wants to foster</span> {app.pet_name}
                          </p>
                          <p className="text-stone-500 text-sm">{app.breed||app.species} · {app.foster_city}{app.foster_province?`, ${app.foster_province}`:''}</p>
                          <p className="text-stone-400 text-xs">{app.foster_email}</p>
                          <p className="text-stone-400 text-xs mt-0.5">{new Date(app.created_at).toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'})}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                          {app.status.replace('_',' ')}
                        </span>
                      </div>
                          {app.motivation && (
                        <p className="text-stone-600 text-sm mt-2 bg-stone-50 rounded-lg px-3 py-2 italic">
                          &ldquo;{app.motivation.slice(0,150)}{app.motivation.length>150?'…':''}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                      className="text-sm border border-stone-200 hover:bg-stone-50 text-stone-700 py-2 px-4 rounded-lg font-medium"
                    >
                      {expandedApp === app.id ? 'Hide Application ▲' : 'View Application ▼'}
                    </button>
                    {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                      <>
                        {app.status === 'PENDING' && (
                          <button onClick={() => updateAppStatus(app.id,'UNDER_REVIEW')} disabled={updatingApp===app.id}
                            className="flex-1 text-sm border border-blue-200 hover:bg-blue-50 text-blue-700 py-2 rounded-lg font-medium disabled:opacity-50">
                            Start Review
                          </button>
                        )}
                        <button onClick={() => updateAppStatus(app.id,'ACCEPTED')} disabled={updatingApp===app.id}
                          className="flex-1 text-sm bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                          ✅ Accept
                        </button>
                        <button onClick={() => updateAppStatus(app.id,'DECLINED')} disabled={updatingApp===app.id}
                          className="flex-1 text-sm border border-red-200 hover:bg-red-50 text-red-600 py-2 rounded-lg font-medium disabled:opacity-50">
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                  {expandedApp === app.id && (
                    <div className="mt-4 border-t border-stone-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {app.motivation && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-stone-400 uppercase mb-1">Why they want to foster</p>
                          <p className="text-stone-700">{app.motivation}</p>
                        </div>
                      )}
                      {app.daily_schedule && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-stone-400 uppercase mb-1">Daily Schedule</p>
                          <p className="text-stone-700">{app.daily_schedule}</p>
                        </div>
                      )}
                      {(app.vet_ref_name || app.vet_ref_phone) && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase mb-1">Vet Reference</p>
                          <p className="text-stone-700">{app.vet_ref_name}</p>
                          {app.vet_ref_phone && <p className="text-stone-500 text-xs">{formatPhone(app.vet_ref_phone)}</p>}
                        </div>
                      )}
                      {(app.personal_ref_name || app.personal_ref_phone) && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase mb-1">Personal Reference</p>
                          <p className="text-stone-700">{app.personal_ref_name}</p>
                          {app.personal_ref_phone && <p className="text-stone-500 text-xs">{formatPhone(app.personal_ref_phone)}</p>}
                        </div>
                      )}
                      {app.signature && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase mb-1">Signature</p>
                          <p className="text-stone-700 italic">{app.signature}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
