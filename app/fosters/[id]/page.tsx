'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function FosterProfilePage({ params }: { params: { id: string } }) {
  const [foster, setFoster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/fosters/${params.id}`)
      .then(r => r.json())
      .then(d => { setFoster(d); setLoading(false); })
      .catch(() => { setError('Could not load profile'); setLoading(false); });
  }, [params.id]);

  const dwellingLabel: Record<string, string> = {
    house: 'House', apartment: 'Apartment', condo: 'Condo', townhouse: 'Townhouse', farm: 'Farm / Rural',
  };

  if (loading) return <><Navbar /><div className="max-w-3xl mx-auto px-6 py-20 text-center text-stone-400">Loading…</div></>;
  if (error || !foster || foster.error) return (
    <><Navbar />
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="text-stone-400">{error || 'Profile not found or you do not have access.'}</p>
      <Link href="/fosters" className="text-amber-600 hover:underline mt-4 inline-block">← Back to fosters</Link>
    </div></>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/fosters" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">
          ← Back to fosters
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl text-green-900">{foster.full_name || 'Foster'}</h1>
              <p className="text-stone-500 mt-1">
                {foster.city}{foster.province ? `, ${foster.province}` : ''}
                {foster.postal_code ? ` · ${foster.postal_code}` : ''}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${foster.profile_complete ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
              {foster.profile_complete ? 'Profile Complete' : 'Incomplete Profile'}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Contact</p>
              <p className="text-stone-700 text-sm">{foster.email}</p>
              {foster.phone && <p className="text-stone-700 text-sm">{foster.phone}</p>}
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Home</p>
              <p className="text-stone-700 text-sm">{dwellingLabel[foster.dwelling_type] || foster.dwelling_type || '—'}</p>
              <p className="text-stone-500 text-xs">{foster.fenced_backyard ? '✅ Fenced backyard' : 'No fenced backyard'}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Household</p>
              <p className="text-stone-700 text-sm">{foster.num_adults} adult{foster.num_adults !== 1 ? 's' : ''}{foster.num_children > 0 ? `, ${foster.num_children} child${foster.num_children !== 1 ? 'ren' : ''}` : ''}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Availability</p>
              <p className="text-stone-700 text-sm">
                {foster.available_from ? `From ${new Date(foster.available_from).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}` : 'Not set'}
              </p>
              <p className="text-stone-500 text-xs capitalize">{foster.reminder_frequency} reminders</p>
            </div>
          </div>

          {foster.preferences?.species?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Pet Preferences</p>
              <div className="flex flex-wrap gap-2">
                {foster.preferences.species.map((s: string) => (
                  <span key={s} className="bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
          {foster.other_pets?.length > 0 && foster.other_pets[0] && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Current Animals</p>
              <p className="text-stone-700 text-sm">{Array.isArray(foster.other_pets) ? foster.other_pets.join(', ') : foster.other_pets}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
