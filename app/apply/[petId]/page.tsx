'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PetPhoto from '@/components/PetPhoto';

export default function ApplyPage({ params }: { params: { petId: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    motivation: '', dailySchedule: '',
    vetRefName: '', vetRefPhone: '',
    personalRefName: '', personalRefPhone: '',
    agreedToTerms: false, signature: '',
  });

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/pets/${params.petId}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([petData, sessionData]) => {
      setPet(petData);
      setSession(sessionData);
      setLoading(false);
    });
  }, [params.petId]);

  const update = (field: string, val: any) => setForm(f => ({...f, [field]: val}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreedToTerms) { setError('You must agree to the fostering terms.'); return; }
    if (!form.signature) { setError('Please provide your digital signature.'); return; }
    setSubmitting(true); setError('');

    const res = await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, petId: params.petId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error); return; }
    router.push('/dashboard/foster?applied=1');
  };

  if (loading) return <><Navbar /><div className="py-20 text-center text-stone-400">Loading…</div></>;

  // Reaching the form directly without an account: explain rather than 401 later.
  if (session && !session.isLoggedIn) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <div className="text-5xl mb-4" aria-hidden="true">🐾</div>
            <h1 className="font-display text-3xl text-green-900">
              Create an account to apply
            </h1>
            <p className="text-stone-500 mt-3 leading-relaxed">
              {pet?.name ? `Applying to foster ${pet.name} needs a foster account. ` : 'Applying to foster needs a foster account. '}
              It is free, and it lets the rescue see your home details and availability.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <Link href={`/register/foster?next=${encodeURIComponent(`/apply/${params.petId}`)}`}
                className="bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Create a foster account
              </Link>
              <Link href="/login"
                className="border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl transition-colors">
                Sign in
              </Link>
              <Link href={`/pets/${params.petId}`} className="text-sm text-stone-500 hover:text-amber-600 mt-1">
                ← Back to {pet?.name || 'the pet'}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Signed in, but not as a foster — only fosters can apply.
  if (session?.isLoggedIn && session.role !== 'FOSTER') {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-stone-500">Only foster accounts can apply to foster a pet.</p>
          <Link href={`/pets/${params.petId}`} className="text-sm text-amber-600 hover:underline mt-3 inline-block">
            ← Back to the pet
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href={`/pets/${params.petId}`} className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">
          ← Back to {pet?.name}'s profile
        </Link>

        {/* Pet summary */}
        {pet && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8 flex gap-4">
            <PetPhoto src={pet.primary_photo} alt={pet.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-green-900">Fostering {pet.name}</h2>
              <p className="text-stone-500 text-sm">{pet.breed || pet.species} · {pet.city}, {pet.province} · Posted by {pet.org_name}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="font-display text-3xl text-green-900 mb-1">Foster Application</h1>
          <p className="text-stone-500 text-sm mb-8">Tell the rescue a bit about yourself and why you'd be a great foster home for {pet?.name}.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Why do you want to foster {pet?.name}? <span className="text-red-400">*</span></label>
              <textarea required rows={4} value={form.motivation} onChange={e => update('motivation', e.target.value)}
                placeholder="Tell the rescue what drew you to this pet and why your home would be a great fit…"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Describe your daily schedule <span className="text-red-400">*</span></label>
              <textarea required rows={3} value={form.dailySchedule} onChange={e => update('dailySchedule', e.target.value)}
                placeholder="When are you typically home? Do you work from home? Who would care for the pet while you're away?"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            <div className="border-t pt-6">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-4">References</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Vet Name</label>
                  <input value={form.vetRefName} onChange={e => update('vetRefName', e.target.value)} placeholder="Dr. Smith"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Vet Phone</label>
                  <input value={form.vetRefPhone} onChange={e => update('vetRefPhone', e.target.value)} placeholder="416-555-0100"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Personal Reference Name</label>
                  <input value={form.personalRefName} onChange={e => update('personalRefName', e.target.value)} placeholder="Jane Doe"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Personal Reference Phone</label>
                  <input value={form.personalRefPhone} onChange={e => update('personalRefPhone', e.target.value)} placeholder="416-555-0200"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 bg-amber-50 -mx-8 px-8 pb-6 rounded-b-2xl">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">Agreement &amp; Signature</p>
              <div className="bg-white rounded-xl border border-amber-200 p-4 text-sm text-stone-600 mb-4">
                By submitting this application, I confirm that all information provided is accurate. I understand that fostering requires commitment to the animal's care and wellbeing. I agree to follow the rescue organization's guidelines and will communicate openly about the pet's needs and my availability.
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={form.agreedToTerms} onChange={e => update('agreedToTerms', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 mt-0.5" />
                <span className="text-sm text-stone-700">I have read and agree to the fostering terms above</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Digital Signature (type your full name) <span className="text-red-400">*</span></label>
                <input value={form.signature} onChange={e => update('signature', e.target.value)} placeholder="Your full name"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-display italic text-lg" />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-lg transition-colors">
              {submitting ? 'Submitting…' : `🐾 Submit Application for ${pet?.name}`}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
