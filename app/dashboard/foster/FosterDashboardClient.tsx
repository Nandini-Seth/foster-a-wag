'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PROVINCES } from '@/lib/forms';
import PetPhoto from '@/components/PetPhoto';

export default function FosterDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile'|'applications'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'fosters');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploadingPhoto(false);
    if (res.ok) setProfileForm((f: any) => ({ ...f, photoUrl: data.url }));
  };

  const refresh = () => fetch('/api/foster/dashboard').then(r => r.json()).then(d => {
    setData(d); setLoading(false);
    if (d.profile) setProfileForm({
      fullName: d.profile.full_name || '',
      phone: d.profile.phone || '',
      city: d.profile.city || '',
      province: d.profile.province || '',
      dwellingType: d.profile.dwelling_type || '',
      fencedBackyard: !!d.profile.fenced_backyard,
      numAdults: d.profile.num_adults || 1,
      numChildren: d.profile.num_children || 0,
      availableFrom: d.profile.available_from || '',
      reminderFrequency: d.profile.reminder_frequency || 'monthly',
      preferences: d.profile.preferences || { species: [] },
      photoUrl: d.profile.photo_url || '',
    });
    if (d.profile.photo_url) setPhotoPreview(d.profile.photo_url);
  });

  useEffect(() => { refresh(); }, []);

  const saveProfile = async () => {
    setSaving(true); setSaveMsg('');
    const res = await fetch('/api/fosters/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg('Saved!');
      setEditMode(false);
      refresh();
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
  };

  if (loading) return (
    <><Navbar /><div className="max-w-5xl mx-auto px-6 py-20 text-center text-stone-400">Loading dashboard…</div></>
  );

  const profile = data?.profile;
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
              <p className="text-green-700 text-sm">Complete your profile below then browse available pets to find your match.</p>
            </div>
          </div>
        )}
        {searchParams.get('applied') && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-amber-800">Application Submitted!</p>
              <p className="text-amber-700 text-sm">Sent to the rescue. Track its status in the Applications tab.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-green-900">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-stone-500">Your foster dashboard</p>
          </div>
          <Link href="/pets" className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
            Browse Pets 🐾
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            ['Applications', stats.totalApplications || 0, '📋'],
            ['Accepted', stats.acceptedApplications || 0, '✅'],
          ].map(([lbl, val, icon]) => (
            <div key={lbl as string} className="bg-white rounded-2xl border border-stone-100 p-5 text-center shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-3xl text-green-900">{val}</div>
              <div className="text-stone-500 text-xs mt-1">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
          {([
            ['profile', '👤 My Profile', 0],
            ['applications', '📋 Applications', stats.activeApplications||0],
          ] as const).map(([t, lbl, badge]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {lbl}
              {badge > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-800">My Profile</h2>
              <button onClick={() => setEditMode(!editMode)} className="text-amber-600 text-sm font-medium">
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {!profile?.profile_complete && !editMode && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4 text-xs text-amber-700">
                Complete your profile to unlock pet applications.
              </div>
            )}
            {editMode ? (
              <div className="space-y-3">
                {/* Photo upload */}
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Profile Photo</label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-stone-200 cursor-pointer hover:border-amber-400 transition-colors flex items-center justify-center bg-stone-50"
                  >
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs">…</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl text-stone-300">📷</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Click to upload</p>
                </div>
                {([['Full Name','fullName'],['Phone','phone'],['City','city']] as const).map(([lbl,fld]) => (
                  <div key={fld}>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">{lbl}</label>
                    <input value={profileForm[fld] || ''} onChange={e => setProfileForm((f: any) => ({...f,[fld]:e.target.value}))}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Province / Territory</label>
                  <select value={profileForm.province || ''} onChange={e => setProfileForm((f: any) => ({...f, province: e.target.value}))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="">Select…</option>
                    {PROVINCES.map(pr => <option key={pr.code} value={pr.code}>{pr.code} — {pr.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Dwelling Type</label>
                  <select value={profileForm.dwellingType||''} onChange={e => setProfileForm((f: any) => ({...f,dwellingType:e.target.value}))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select…</option>
                    {['house','apartment','condo','townhouse','farm'].map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Available From</label>
                  <input type="date" value={profileForm.availableFrom||''} onChange={e => setProfileForm((f: any) => ({...f,availableFrom:e.target.value}))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!profileForm.fencedBackyard} onChange={e => setProfileForm((f: any) => ({...f,fencedBackyard:e.target.checked}))} className="accent-amber-500" />
                  Fenced backyard
                </label>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Reminder frequency</label>
                  <select value={profileForm.reminderFrequency||'monthly'} onChange={e => setProfileForm((f: any) => ({...f,reminderFrequency:e.target.value}))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                {saveMsg && <p className="text-green-600 text-sm">✅ {saveMsg}</p>}
                <button onClick={saveProfile} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm">
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {([
                  ['Name', profile?.full_name],
                  ['Phone', profile?.phone],
                  ['Location', profile?.city ? `${profile.city}, ${profile.province}` : null],
                  ['Home', profile?.dwelling_type],
                  ['Fenced yard', profile?.fenced_backyard ? 'Yes' : 'No'],
                  ['Available from', profile?.available_from],
                  ['Reminders', profile?.reminder_frequency],
                ] as [string, string|null][]).map(([lbl, val]) => val ? (
                  <div key={lbl} className="flex justify-between">
                    <span className="text-stone-400">{lbl}</span>
                    <span className="text-stone-700 font-medium capitalize">{val}</span>
                  </div>
                ) : null)}
                <div className="pt-2">
                  <span className="text-stone-400 text-xs uppercase font-semibold block mb-1">Preferences</span>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.preferences?.species || []).map((s: string) => (
                      <span key={s} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {(!profile?.preferences?.species || !profile.preferences.species.length) && (
                      <span className="text-stone-300 text-xs">Not set — click Edit</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab === 'applications' && (
          apps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-stone-400 text-sm mb-2">No applications yet.</p>
              <Link href="/pets" className="text-amber-600 hover:underline text-sm font-medium">Browse available pets →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app: any) => (
                <div key={app.id} className="flex items-center gap-4 bg-white border border-stone-100 rounded-2xl p-4 shadow-sm hover:bg-stone-50">
                  {app.primary_photo ? (
                    <PetPhoto src={app.primary_photo} alt={app.pet_name} className="w-14 h-14 rounded-xl bg-white flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-2xl flex-shrink-0">🐾</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800">{app.pet_name}</p>
                    <p className="text-stone-500 text-xs">{app.breed || app.species} · {app.org_name}</p>
                    <p className="text-stone-400 text-xs">{new Date(app.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusColors[app.status]}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
