'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PetPhoto from '@/components/PetPhoto';

// The account review sequence. Only ACTIVE accounts can sign in.
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  INFO_RECEIVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  PENDING: '1. Pending review',
  INFO_REQUESTED: '2. Awaiting their reply',
  INFO_RECEIVED: '3. Ready to approve',
  ACTIVE: '✅ Active',
  REJECTED: '❌ Rejected',
};

// The single action that moves an account to its next step.
const nextStep: Record<string, { to: string; label: string } | undefined> = {
  PENDING: { to: 'INFO_REQUESTED', label: '📧 I emailed them' },
  INFO_REQUESTED: { to: 'INFO_RECEIVED', label: '📥 They replied' },
  INFO_RECEIVED: { to: 'ACTIVE', label: '🎉 Approve & activate' },
};

const petStatusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-800',
  DELETED: 'bg-stone-200 text-stone-500',
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'pets'>('users');
  const [userFilter, setUserFilter] = useState<'ALL' | 'FOSTER' | 'RESCUE'>('ALL');
  const [verifyFilter, setVerifyFilter] = useState<'all' | 'needsAction' | 'active' | 'rejected'>('all');
  const [acting, setActing] = useState<string | null>(null);

  const refresh = () =>
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); });

  useEffect(() => { refresh(); }, []);

  const setStatus = async (userId: string, status: string) => {
    setActing(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await refresh();
    setActing(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    setActing(userId);
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    await refresh();
    setActing(null);
  };

  const updatePetStatus = async (petId: string, status: string) => {
    setActing(petId);
    await fetch(`/api/admin/pets/${petId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await refresh();
    setActing(null);
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Delete this pet listing? This cannot be undone.')) return;
    setActing(petId);
    await fetch(`/api/admin/pets/${petId}`, { method: 'DELETE' });
    await refresh();
    setActing(null);
  };

  if (loading) return (
    <><Navbar /><div className="max-w-6xl mx-auto px-6 py-20 text-center text-stone-400">Loading admin dashboard…</div></>
  );

  const stats = data?.stats || {};
  const allUsers: any[] = data?.users || [];
  const pets: any[] = data?.pets || [];

  const filteredUsers = allUsers
    .filter(u => userFilter === 'ALL' || u.role === userFilter)
    .filter(u => {
      const s = u.status ?? 'PENDING';
      if (verifyFilter === 'needsAction') return !['ACTIVE', 'REJECTED'].includes(s);
      if (verifyFilter === 'active') return s === 'ACTIVE';
      if (verifyFilter === 'rejected') return s === 'REJECTED';
      return true;
    });

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-green-900">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Manage users, verify accounts, and oversee pet postings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            ['Awaiting Approval', stats.pendingVerification, '⏳'],
            ['Ready to Approve', stats.readyToApprove, '📥'],
            ['Active Accounts', stats.verified, '✅'],
            ['Total Users', stats.totalUsers, '👥'],
          ].map(([lbl, val, icon]) => (
            <div key={lbl as string} className="bg-white rounded-2xl border border-stone-100 p-5 text-center shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-3xl text-green-900">{val}</div>
              <div className="text-stone-500 text-xs mt-1">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6 w-fit">
          {([
            ['users', '👥 Users', stats.pendingVerification],
            ['pets', '🐾 Pet Postings', stats.totalPets],
          ] as const).map(([t, lbl, badge]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {lbl}
              {badge > 0 && (
                <span className={`ml-1.5 text-white text-xs rounded-full px-1.5 py-0.5 ${t === 'users' && tab !== 'users' && stats.pendingVerification > 0 ? 'bg-red-500' : 'bg-stone-400'}`}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                {(['ALL', 'FOSTER', 'RESCUE'] as const).map(f => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${userFilter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    {f === 'ALL' ? 'All Roles' : f === 'FOSTER' ? '🏠 Fosters' : '🏢 Rescues'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                {([['all', 'All'], ['needsAction', '⏳ Needs action'], ['active', '✅ Active'], ['rejected', '❌ Rejected']] as const).map(([f, lbl]) => (
                  <button key={f} onClick={() => setVerifyFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${verifyFilter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-stone-400">No users match this filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user: any) => {
                  const status = user.status ?? 'PENDING';
                  const step = nextStep[status];
                  const name = user.role === 'RESCUE' ? user.org_name : user.full_name;
                  const city = user.role === 'RESCUE' ? user.rescue_city : user.foster_city;
                  const province = user.role === 'RESCUE' ? user.rescue_province : user.foster_province;
                  const phone = user.role === 'RESCUE' ? user.rescue_phone : user.foster_phone;

                  return (
                    <div key={user.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.role === 'RESCUE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                              {user.role}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status] || statusColors.PENDING}`}>
                              {statusLabels[status] || status}
                            </span>
                            {user.email_verified && (
                              <span className="text-xs text-stone-400">email verified</span>
                            )}
                          </div>
                          <p className="font-semibold text-stone-800 mt-2">{name || '(No name yet)'}</p>
                          <p className="text-stone-500 text-sm">{user.email}</p>
                          {(city || province) && <p className="text-stone-400 text-xs mt-0.5">{[city, province].filter(Boolean).join(', ')}</p>}
                          {phone && <p className="text-stone-400 text-xs">{phone}</p>}
                          {user.role === 'RESCUE' && user.website && (
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">{user.website}</a>
                          )}
                          {user.role === 'FOSTER' && (
                            <p className="text-stone-400 text-xs mt-0.5">Profile: {user.profile_complete ? '✅ Complete' : '⚠️ Incomplete'}</p>
                          )}
                          <p className="text-stone-300 text-xs mt-1">
                            Joined {new Date(user.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {user.info_requested_at && ` · emailed ${new Date(user.info_requested_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-start">
                          {step && (
                            <button onClick={() => setStatus(user.id, step.to)} disabled={acting === user.id}
                              className="text-sm bg-green-600 hover:bg-green-500 text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                              {step.label}
                            </button>
                          )}
                          {status === 'ACTIVE' && (
                            <button onClick={() => setStatus(user.id, 'PENDING')} disabled={acting === user.id}
                              className="text-sm border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                              title="Revoke access and send this account back to review">
                              Deactivate
                            </button>
                          )}
                          {status !== 'PENDING' && status !== 'ACTIVE' && (
                            <button onClick={() => setStatus(user.id, 'PENDING')} disabled={acting === user.id}
                              className="text-sm border border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                              Reset
                            </button>
                          )}
                          {status !== 'REJECTED' && (
                            <button onClick={() => setStatus(user.id, 'REJECTED')} disabled={acting === user.id}
                              className="text-sm border border-red-200 hover:bg-red-50 text-red-600 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                              ❌ Reject
                            </button>
                          )}
                          {user.role === 'FOSTER' && user.foster_profile_id && (
                            <Link href={`/fosters/${user.foster_profile_id}`}
                              className="text-sm border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium px-3 py-1.5 rounded-lg">
                              View Profile
                            </Link>
                          )}
                          <button onClick={() => deleteUser(user.id)} disabled={acting === user.id}
                            className="text-sm text-red-400 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PETS TAB */}
        {tab === 'pets' && (
          pets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-stone-400">No pet postings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet: any) => (
                <div key={pet.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <PetPhoto src={pet.primary_photo} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-stone-800">{pet.name}</p>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${petStatusColors[pet.status] || 'bg-stone-100 text-stone-500'}`}>
                          {pet.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm">{pet.breed || pet.species} · {pet.age_years}yr · {pet.sex}</p>
                      <p className="text-stone-400 text-xs">{pet.org_name} · {pet.city}, {pet.province}</p>
                      <p className="text-stone-300 text-xs mt-0.5">Posted {new Date(pet.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                      <Link href={`/pets/${pet.id}`}
                        className="text-sm border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium px-3 py-1.5 rounded-lg">
                        View
                      </Link>
                      {pet.status === 'ACTIVE' && (
                        <button onClick={() => updatePetStatus(pet.id, 'PENDING')} disabled={acting === pet.id}
                          className="text-sm border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                          Deactivate
                        </button>
                      )}
                      {pet.status === 'PENDING' && (
                        <button onClick={() => updatePetStatus(pet.id, 'ACTIVE')} disabled={acting === pet.id}
                          className="text-sm border border-green-200 hover:bg-green-50 text-green-700 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                          Reactivate
                        </button>
                      )}
                      <button onClick={() => deletePet(pet.id)} disabled={acting === pet.id}
                        className="text-sm text-red-400 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
