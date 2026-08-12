'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FosterRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', fullName: '',
    phone: '', city: '', province: '', postalCode: '',
    dwellingType: '', fencedBackyard: false,
    numAdults: 1, numChildren: 0,
    otherAnimals: '',
    availableFrom: '', preferences: { species: [] as string[] },
    reminderFrequency: 'monthly',
  });

  const update = (field: string, val: any) => setForm(f => ({...f, [field]: val}));
  const toggleSpecies = (s: string) => {
    const cur = form.preferences.species;
    update('preferences', { ...form.preferences, species: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');

    // Profile details go with the registration itself. Signing up no longer
    // creates a session, so there is nothing to authenticate a follow-up call.
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email, password: form.password, role: 'FOSTER', fullName: form.fullName,
        profile: {
          phone: form.phone, city: form.city,
          province: form.province, postalCode: form.postalCode,
          dwellingType: form.dwellingType, fencedBackyard: form.fencedBackyard,
          numAdults: form.numAdults, numChildren: form.numChildren,
          otherPets: form.otherAnimals ? [form.otherAnimals] : [],
          availableFrom: form.availableFrom, preferences: form.preferences,
          reminderFrequency: form.reminderFrequency,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }

    setLoading(false);
    router.push('/registration-received?role=foster');
  };

  const cx = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const lx = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl">🐾</Link>
          <h1 className="font-display text-3xl text-green-900 mt-2">Register as a Foster</h1>
          <div className="flex gap-2 justify-center mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${step >= s ? 'bg-amber-500' : 'bg-stone-200'}`} />
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-2">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-stone-800">Account Details</h2>
            <div><label className={lx}>Full Name</label>
              <input type="text" value={form.fullName} placeholder="Jane Smith" onChange={e => update('fullName', e.target.value)} className={cx} /></div>
            <div><label className={lx}>Email Address</label>
              <input type="email" value={form.email} placeholder="jane@example.com" onChange={e => update('email', e.target.value)} className={cx} /></div>
            <div><label className={lx}>Password</label>
              <input type="password" value={form.password} placeholder="Min. 8 characters" onChange={e => update('password', e.target.value)} className={cx} /></div>
            <div><label className={lx}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} placeholder="Repeat password" onChange={e => update('confirmPassword', e.target.value)} className={cx} /></div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button onClick={() => {
              if (!form.email || !form.password || !form.fullName) { setError('Please fill in all fields'); return; }
              setError(''); setStep(2);
            }} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl">
              Next: Home Details →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-stone-800">Your Home &amp; Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lx}>Phone</label>
                <input type="text" value={form.phone} placeholder="647-555-0100" onChange={e => update('phone', e.target.value)} className={cx} /></div>
              <div><label className={lx}>City</label>
                <input type="text" value={form.city} placeholder="Toronto" onChange={e => update('city', e.target.value)} className={cx} /></div>
              <div><label className={lx}>Province</label>
                <input type="text" value={form.province} placeholder="ON" onChange={e => update('province', e.target.value)} className={cx} /></div>
              <div><label className={lx}>Postal Code</label>
                <input type="text" value={form.postalCode} placeholder="M4B 1B5" onChange={e => update('postalCode', e.target.value)} className={cx} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Type of Dwelling</label>
              <select value={form.dwellingType} onChange={e => update('dwellingType', e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Select type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="farm">Farm / Rural</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.fencedBackyard} onChange={e => update('fencedBackyard', e.target.checked)}
                className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-stone-700">I have a fenced backyard</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Adults in home</label>
                <input type="number" min={1} max={10} value={form.numAdults} onChange={e => update('numAdults', +e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Children in home</label>
                <input type="number" min={0} max={10} value={form.numChildren} onChange={e => update('numChildren', +e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className={lx}>Other animals at home <span className="text-stone-400 font-normal">(optional)</span></label>
              <input type="text" value={form.otherAnimals} onChange={e => update('otherAnimals', e.target.value)}
                placeholder="e.g. 1 friendly Labrador, 2 indoor cats"
                className={cx} />
              <p className="text-xs text-stone-400 mt-1">List any pets you currently have</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl">Next: Preferences →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-stone-800">Pet Preferences &amp; Availability</h2>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">I'm open to fostering (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {['Dog', 'Cat', 'Small Animal', 'Bird', 'Rabbit'].map(s => (
                  <button key={s} type="button"
                    onClick={() => toggleSpecies(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${form.preferences.species.includes(s) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Available to foster from</label>
              <input type="date" value={form.availableFrom} onChange={e => update('availableFrom', e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Availability reminder frequency</label>
              <select value={form.reminderFrequency} onChange={e => update('reminderFrequency', e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl">← Back</button>
              <button onClick={handleRegister} disabled={loading}
                className="flex-1 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">
                {loading ? 'Creating account…' : 'Create Account 🐾'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-stone-500 mt-6">
          Already registered? <Link href="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
