'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PhotoUpload from '@/components/PhotoUpload';
import { ProvinceSelect, TriState } from '@/components/FormFields';
import { TRISTATE_COMPAT, TRISTATE_HOUSE_TRAINED, urgentByError } from '@/lib/forms';
import { PET_STATE_HELP, PET_STATE_LABEL, isEditableState, type PetState } from '@/lib/pets';

const EMPTY = {
  name: '', species: 'Dog', breed: '', ageYears: '', sex: 'Unknown', weightKg: '',
  houseTrained: 'UNKNOWN', spayedNeutered: false, vaccinated: false,
  goodWithKids: 'UNKNOWN', goodWithDogs: 'UNKNOWN', goodWithCats: 'UNKNOWN',
  specialNeeds: '', bio: '',
  availableFrom: '', urgentBy: '',
  city: '', province: '',
  primaryPhoto: '',
};

export default function EditPetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<PetState>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState('');
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/pets/${params.id}`)
      .then(r => r.json())
      .then(pet => {
        if (!pet || pet.error) { setNotFound(true); setLoading(false); return; }
        setState((pet.status ?? 'ACTIVE') as PetState);
        setForm({
          name: pet.name ?? '', species: pet.species ?? 'Dog', breed: pet.breed ?? '',
          ageYears: pet.age_years ?? '', sex: pet.sex ?? 'Unknown', weightKg: pet.weight_kg ?? '',
          houseTrained: pet.house_trained ?? 'UNKNOWN', spayedNeutered: !!pet.spayed_neutered,
          vaccinated: !!pet.vaccinated,
          goodWithKids: pet.good_with_kids ?? 'UNKNOWN',
          goodWithDogs: pet.good_with_dogs ?? 'UNKNOWN',
          goodWithCats: pet.good_with_cats ?? 'UNKNOWN',
          specialNeeds: pet.special_needs ?? '', bio: pet.bio ?? '',
          // These feed <input type="date">, which needs a bare YYYY-MM-DD.
          availableFrom: pet.available_from ?? '', urgentBy: pet.urgent_by ?? '',
          city: pet.city ?? '', province: pet.province ?? '',
          primaryPhoto: pet.primary_photo ?? '',
        });
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.id]);

  const update = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }));
  const editable = isEditableState(state);

  const save = async () => {
    if (!form.name.trim()) { setError('Pet name is required.'); return; }
    const dateProblem = urgentByError(form.availableFrom, form.urgentBy);
    if (dateProblem) { setError(dateProblem); return; }
    setSaving(true); setError(''); setSavedAt('');
    const res = await fetch(`/api/pets/${params.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Could not save'); return; }
    setSavedAt(new Date().toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }));
  };

  const changeState = async (next: PetState) => {
    if (next === 'DELETED' && !confirm('Delete this post? It will be hidden from everyone and locked for editing. You can restore it later.')) return;
    setSaving(true); setError('');
    const res = await fetch(`/api/pets/${params.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Could not update status'); return; }
    setState(next);
    if (next === 'DELETED') router.push('/dashboard/rescue');
  };

  const cx = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-stone-100 disabled:text-stone-400';
  const lx = 'block text-sm font-medium text-stone-700 mb-1';

  const Toggle = ({ label, field }: any) => {
    const on = (form as any)[field];
    return (
      <label className={`flex items-center justify-between py-0.5 ${editable ? 'cursor-pointer' : 'opacity-60'}`}>
        <span className="text-sm text-stone-700">{label}</span>
        <button type="button" disabled={!editable} onClick={() => update(field, !on)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed ${on ? 'bg-green-500' : 'bg-stone-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>
    );
  };

  if (loading) return <><Navbar /><div className="py-20 text-center text-stone-400">Loading…</div></>;
  if (notFound) return (
    <><Navbar />
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-stone-500">This post does not exist, or it is not yours to edit.</p>
        <Link href="/dashboard/rescue" className="text-amber-600 hover:underline text-sm mt-3 inline-block">← Back to dashboard</Link>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/dashboard/rescue" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">← Back to dashboard</Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h1 className="font-display text-4xl text-green-900">Edit {form.name || 'pet'}</h1>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            state === 'ACTIVE' ? 'bg-green-100 text-green-700'
            : state === 'PENDING' ? 'bg-amber-100 text-amber-800'
            : 'bg-stone-200 text-stone-500'}`}>
            {PET_STATE_LABEL[state]}
          </span>
        </div>
        <p className="text-stone-500 mb-6">{PET_STATE_HELP[state]}</p>

        {/* Visibility controls */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">Post visibility</p>
          <div className="flex flex-wrap gap-2">
            {state !== 'ACTIVE' && (
              <button onClick={() => changeState('ACTIVE')} disabled={saving}
                className="text-sm bg-green-700 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                {state === 'DELETED' ? '♻️ Restore as Active' : '✅ Make Active'}
              </button>
            )}
            {state !== 'PENDING' && state !== 'DELETED' && (
              <button onClick={() => changeState('PENDING')} disabled={saving}
                className="text-sm border border-amber-300 hover:bg-amber-50 text-amber-800 font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                ⏸ Mark Pending
              </button>
            )}
            {state !== 'DELETED' && (
              <button onClick={() => changeState('DELETED')} disabled={saving}
                className="text-sm border border-red-200 hover:bg-red-50 text-red-600 font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                🗑 Delete post
              </button>
            )}
          </div>
        </div>

        {!editable && (
          <div className="rounded-2xl border border-stone-300 bg-stone-100 px-5 py-4 mb-6">
            <p className="font-semibold text-stone-700">This post is deleted and locked</p>
            <p className="text-sm text-stone-500">Restore it above if you need to make changes.</p>
          </div>
        )}

        <fieldset disabled={!editable} className={editable ? '' : 'opacity-60'}>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lx}>Pet Name <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => update('name', e.target.value)} className={cx} />
              </div>
              <div>
                <label className={lx}>Species <span className="text-red-400">*</span></label>
                <select value={form.species} onChange={e => update('species', e.target.value)} className={cx}>
                  {['Dog','Cat','Bird','Rabbit','Small Animal','Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lx}>Breed</label>
                <input value={form.breed} onChange={e => update('breed', e.target.value)} className={cx} />
              </div>
              <div>
                <label className={lx}>Age (years)</label>
                <input type="number" min={0} step={0.5} value={form.ageYears} onChange={e => update('ageYears', e.target.value)} className={cx} />
              </div>
              <div>
                <label className={lx}>Sex</label>
                <select value={form.sex} onChange={e => update('sex', e.target.value)} className={cx}>
                  {['Male','Female','Unknown'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lx}>Weight (kg)</label>
                <input type="number" min={0} step={0.1} value={form.weightKg} onChange={e => update('weightKg', e.target.value)} className={cx} />
              </div>
            </div>

            <div>
              <label className={lx}>Bio / Description</label>
              <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} className={`${cx} resize-none`} />
            </div>

            <PhotoUpload
              label="Pet Photo"
              folder="pets"
              value={form.primaryPhoto}
              disabled={!editable}
              onChange={url => update('primaryPhoto', url)}
            />

            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Health Status</p>
              <TriState label="House Trained" value={form.houseTrained} disabled={!editable}
                options={TRISTATE_HOUSE_TRAINED} onChange={v => update('houseTrained', v)} />
              <Toggle label="Spayed / Neutered" field="spayedNeutered" />
              <Toggle label="Vaccinations Up to Date" field="vaccinated" />
            </div>

            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Compatible With</p>
              <TriState label="Good with Kids" value={form.goodWithKids} disabled={!editable}
                options={TRISTATE_COMPAT} onChange={v => update('goodWithKids', v)} />
              <TriState label="Good with Dogs" value={form.goodWithDogs} disabled={!editable}
                options={TRISTATE_COMPAT} onChange={v => update('goodWithDogs', v)} />
              <TriState label="Good with Cats" value={form.goodWithCats} disabled={!editable}
                options={TRISTATE_COMPAT} onChange={v => update('goodWithCats', v)} />
            </div>

            <div>
              <label className={lx}>Special Needs or Medical Notes</label>
              <textarea rows={3} value={form.specialNeeds} onChange={e => update('specialNeeds', e.target.value)} className={`${cx} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lx}>Available From</label>
                <input type="date" value={form.availableFrom} onChange={e => update('availableFrom', e.target.value)} className={cx} />
              </div>
              <div>
                <label className={lx}>Urgent By (optional)</label>
                <input type="date" value={form.urgentBy} min={form.availableFrom || undefined}
                  onChange={e => update('urgentBy', e.target.value)} className={cx} />
              </div>
              <div>
                <label className={lx}>City</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} className={cx} />
              </div>
              <ProvinceSelect value={form.province} disabled={!editable}
                onChange={v => update('province', v)} />
            </div>
          </div>
        </fieldset>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 mt-4">{error}</p>}
        {savedAt && <p className="text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3 mt-4">Saved at {savedAt}.</p>}

        {editable && (
          <div className="flex gap-3 mt-6">
            <Link href={`/pets/${params.id}`} className="flex-1 text-center border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">
              View post
            </Link>
            <button onClick={save} disabled={saving}
              className="flex-1 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
