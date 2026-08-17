'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUpload from '@/components/PhotoUpload';
import { Field, TextField, ProvinceSelect, TriState, fieldClass } from '@/components/FormFields';
import { TRISTATE_COMPAT, TRISTATE_HOUSE_TRAINED, requiredErrors } from '@/lib/forms';

// Required fields per step. Advancing runs only the current step's rules, so a
// blank field on step 3 never blocks step 1.
const STEP_REQUIRED: Record<number, { name: string; label: string }[]> = {
  1: [
    { name: 'name', label: 'Pet name' },
    { name: 'species', label: 'Species' },
  ],
  2: [],
  3: [
    { name: 'city', label: 'City' },
    { name: 'province', label: 'Province' },
    { name: 'availableFrom', label: 'Available from' },
  ],
};

export default function NewPetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', species: 'Dog', breed: '', ageYears: '', sex: 'Unknown', weightKg: '',
    houseTrained: 'UNKNOWN', spayedNeutered: false, vaccinated: false,
    goodWithKids: 'UNKNOWN', goodWithDogs: 'UNKNOWN', goodWithCats: 'UNKNOWN',
    specialNeeds: '', bio: '',
    availableFrom: '', urgentBy: '',
    city: '', province: '',
    primaryPhoto: '',
  });

  const update = (field: string, val: any) => {
    setForm(f => ({ ...f, [field]: val }));
    // Clear this field's error as soon as it is addressed.
    setErrors(e => (e[field] ? { ...e, [field]: '' } : e));
  };

  const validateStep = (n: number) => {
    const found = requiredErrors(form, STEP_REQUIRED[n] ?? []);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const goTo = (n: number) => {
    // Going back is always allowed; going forward has to pass this step first.
    if (n > step && !validateStep(step)) return;
    setError('');
    setStep(n);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
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

  const Switch = ({ label, field }: { label: string; field: string }) => {
    const on = (form as any)[field];
    return (
      <label className="flex items-center justify-between cursor-pointer py-1">
        <span className="text-sm text-stone-700">{label}</span>
        <button type="button" onClick={() => update(field, !on)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-green-500' : 'bg-stone-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>
    );
  };

  const stepHasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/dashboard/rescue" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">← Back to dashboard</Link>
        <h1 className="font-display text-4xl text-green-900 mb-2">Post a Pet for Fostering</h1>
        <p className="text-stone-500 mb-8">Fill in the details below to list an animal in need of a foster home.</p>

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
                  <TextField label="Pet Name" required value={form.name} error={errors.name}
                    placeholder="Biscuit" onChange={v => update('name', v)} />
                </div>
                <Field label="Species" required error={errors.species}>
                  <select value={form.species} onChange={e => update('species', e.target.value)}
                    className={fieldClass(errors.species)}>
                    {['Dog','Cat','Bird','Rabbit','Small Animal','Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <TextField label="Breed" value={form.breed} placeholder="Golden Retriever Mix"
                  onChange={v => update('breed', v)} />
                <TextField label="Age (years)" type="number" min={0} step={0.5} value={form.ageYears}
                  placeholder="3" onChange={v => update('ageYears', v)} />
                <Field label="Sex">
                  <select value={form.sex} onChange={e => update('sex', e.target.value)} className={fieldClass()}>
                    {['Male','Female','Unknown'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <TextField label="Weight (kg)" type="number" min={0} step={0.1} value={form.weightKg}
                  placeholder="15" onChange={v => update('weightKg', v)} />
              </div>
              <Field label="Bio / Description">
                <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)}
                  placeholder="Tell potential fosters about this animal's personality, quirks, and what makes them special…"
                  className={`${fieldClass()} resize-none`} />
              </Field>
              <PhotoUpload label="Pet Photo" folder="pets" value={form.primaryPhoto}
                onChange={url => update('primaryPhoto', url)} />
              {stepHasErrors && <p className="text-sm text-red-600">Fill in the required fields above to continue.</p>}
              <button onClick={() => goTo(2)} className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">
                Next: Health &amp; Personality →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-800 mb-2">Health &amp; Personality</h2>
              <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Health Status</p>
                <TriState label="House Trained" value={form.houseTrained}
                  options={TRISTATE_HOUSE_TRAINED} onChange={v => update('houseTrained', v)} />
                <Switch label="Spayed / Neutered" field="spayedNeutered" />
                <Switch label="Vaccinations Up to Date" field="vaccinated" />
              </div>
              <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Compatible With</p>
                <p className="text-xs text-stone-400 -mt-1">
                  Choose &ldquo;Don&rsquo;t know&rdquo; if this has not been tested — it is more useful to a foster than a guess.
                </p>
                <TriState label="Good with Kids" value={form.goodWithKids}
                  options={TRISTATE_COMPAT} onChange={v => update('goodWithKids', v)} />
                <TriState label="Good with Dogs" value={form.goodWithDogs}
                  options={TRISTATE_COMPAT} onChange={v => update('goodWithDogs', v)} />
                <TriState label="Good with Cats" value={form.goodWithCats}
                  options={TRISTATE_COMPAT} onChange={v => update('goodWithCats', v)} />
              </div>
              <Field label="Special Needs or Medical Notes (optional)">
                <textarea rows={3} value={form.specialNeeds} onChange={e => update('specialNeeds', e.target.value)}
                  placeholder="Medication schedule, dietary restrictions, behaviour notes, etc."
                  className={`${fieldClass()} resize-none`} />
              </Field>
              <div className="flex gap-3">
                <button onClick={() => goTo(1)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
                <button onClick={() => goTo(3)} className="flex-1 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">Next: Location →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-800 mb-2">Availability &amp; Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Available From" required type="date" value={form.availableFrom}
                  error={errors.availableFrom} onChange={v => update('availableFrom', v)} />
                <TextField label="Urgent By (optional)" type="date" value={form.urgentBy}
                  onChange={v => update('urgentBy', v)} />
                <TextField label="City" required value={form.city} error={errors.city}
                  placeholder="Toronto" onChange={v => update('city', v)} />
                <ProvinceSelect required value={form.province} error={errors.province}
                  onChange={v => update('province', v)} />
              </div>
              {stepHasErrors && <p className="text-sm text-red-600">Fill in the required fields above to post.</p>}
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => goTo(2)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
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
