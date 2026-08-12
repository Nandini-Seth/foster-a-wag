'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RescueRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    orgName: '', phone: '', city: '', province: '',
    website: '', address: '',
  });

  const update = (field: string, val: string) => setForm(f => ({...f, [field]: val}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');

    // Organization details go with the registration itself. Signing up no longer
    // creates a session, so there is nothing to authenticate a follow-up call.
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email, password: form.password, role: 'RESCUE', orgName: form.orgName,
        profile: {
          phone: form.phone, city: form.city, province: form.province,
          website: form.website, contactEmail: form.email, address: form.address,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }

    setLoading(false);
    router.push('/registration-received?role=rescue');
  };

  const cx = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400";
  const lx = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl">🐾</Link>
          <h1 className="font-display text-3xl text-green-900 mt-2">Register Your Rescue</h1>
          <p className="text-stone-500 text-sm mt-1">Create your rescue organization profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-3">Organization Details</p>
            <div className="space-y-3">
              <div><label className={lx}>Organization Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.orgName} placeholder="Paws & Hearts Rescue" required onChange={e => update('orgName', e.target.value)} className={cx} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lx}>City</label>
                  <input type="text" value={form.city} placeholder="Toronto" onChange={e => update('city', e.target.value)} className={cx} /></div>
                <div><label className={lx}>Province</label>
                  <input type="text" value={form.province} placeholder="ON" onChange={e => update('province', e.target.value)} className={cx} /></div>
              </div>
              <div><label className={lx}>Phone</label>
                <input type="text" value={form.phone} placeholder="416-555-0100" onChange={e => update('phone', e.target.value)} className={cx} /></div>
              <div><label className={lx}>Website (optional)</label>
                <input type="text" value={form.website} placeholder="https://yourrescue.org" onChange={e => update('website', e.target.value)} className={cx} /></div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Account Credentials</p>
            <div className="space-y-3">
              <div><label className={lx}>Email <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} placeholder="contact@yourrescue.org" required onChange={e => update('email', e.target.value)} className={cx} /></div>
              <div><label className={lx}>Password <span className="text-red-400">*</span></label>
                <input type="password" value={form.password} placeholder="Min. 8 characters" required onChange={e => update('password', e.target.value)} className={cx} /></div>
              <div><label className={lx}>Confirm Password <span className="text-red-400">*</span></label>
                <input type="password" value={form.confirmPassword} placeholder="Repeat password" required onChange={e => update('confirmPassword', e.target.value)} className={cx} /></div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Creating account…' : 'Create Rescue Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already registered? <Link href="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
