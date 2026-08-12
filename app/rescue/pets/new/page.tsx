'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUpload from '@/components/PhotoUpload';

export default function NewPetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', species: 'Dog', breed: '', ageYears: '', sex: 'Unknown', weightKg: '',
    houseTrained: false, spayedNeutered: false, microchipped: false, vaccinated: false,
    goodWithKids: true, goodWithDogs: true, goodWithCats: true,
    specialNeeds: '', bio: '',
    availableFrom: '', urgentBy: '',
    city: '', province: '',
    primaryPhoto: '',
  });

  const update = (field: string, val: any) => setForm(f => ({...f, [field]: val}));

  const handleSubmit = async () => {
    if (!form.name || !form.species) { setError('Name and species are required.'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/pets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push('/dashboard/rescue');
  };

  const Toggle = ({ label, field }: any) => {
    const on = (form as any)[field];
    return (
      <label className="flex items-center justify-between cursor-pointer py-0.5">
        <span className="text-sm text-stone-700">{label}</span>
        <button
          type="button"
          onClick={() => update(field, !on)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-green-500' : 'bg-stone-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/dashboard/rescue" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">← Back to dashboard</Link>
        <h1 className="font-display text-4xl text-green-900 mb-2">Post a Pet for Fostering</h1>
        <p className="text-stone-500 mb-8">Fill in the details below to list an animal in need of a foster home.</p>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {['Basic Info', 'Health & Personality', 'Availability & Location'].map((lbl, i) => (
            <div key={i} className={`flex-1 text-center text-xs font-medium py-2 rounded-lg transition-colors ${step === i+1 ? 'bg-green-800 text-white' : step > i+1 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
              {lbl}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-800 mb-2">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Pet Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Biscuit"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Species <span className="text-red-400">*</span></label>
                  <select value={form.species} onChange={e => update('species', e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {['Dog','Cat','Bird','Rabbit','Small Animal','Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Breed</label>
                  <input value={form.breed} onChange={e => update('breed', e.target.value)} placeholder="Golden Retriever Mix"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Age (years)</label>
                  <input type="number" min={0} step={0.5} value={form.ageYears} onChange={e => update('ageYears', e.target.value)} placeholder="3"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Sex</label>
                  <select value={form.sex} onChange={e => update('sex', e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {['Male','Female','Unknown'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Weight (kg)</label>
                  <input type="number" min={0} step={0.1} value={form.weightKg} onChange={e => update('weightKg', e.target.value)} placeholder="15"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bio / Description</label>
                <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell potential fosters about this animal's personality, quirks, and what makes them special…"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
              <PhotoUpload
                label="Pet Photo"
                folder="pets"
                value={form.primaryPhoto}
                onChange={url => update('primaryPhoto', url)}
              />
              <button onClick={() => setStep(2)} className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">
                Next: Health & Personality →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-800 mb-2">Health &amp; Personality</h2>
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Health Status</p>
                <Toggle label="House Trained" field="houseTrained" />
                <Toggle label="Spayed / Neutered" field="spayedNeutered" />
                <Toggle label="Microchipped" field="microchipped" />
                <Toggle label="Vaccinations Up to Date" field="vaccinated" />
              </div>
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Compatible With</p>
                <Toggle label="Good with Kids" field="goodWithKids" />
                <Toggle label="Good with Dogs" field="goodWithDogs" />
                <Toggle label="Good with Cats" field="goodWithCats" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Special Needs or Medical Notes (optional)</label>
                <textarea rows={3} value={form.specialNeeds} onChange={e => update('specialNeeds', e.target.value)}
                  placeholder="Medication schedule, dietary restrictions, behaviour notes, etc."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">Next: Location →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-800 mb-2">Availability &amp; Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Available From</label>
                  <input type="date" value={form.availableFrom} onChange={e => update('availableFrom', e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Urgent By (optional)</label>
                  <input type="date" value={form.urgentBy} onChange={e => update('urgentBy', e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                  <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Toronto"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Province</label>
                  <input value={form.province} onChange={e => update('province', e.target.value)} placeholder="ON"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">
                  {loading ? 'Posting…' : '🐾 Post Pet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
