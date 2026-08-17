'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmailField, TextField, ProvinceSelect } from '@/components/FormFields';
import { emailError, requiredErrors } from '@/lib/forms';

export default function RescueRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    orgName: '', phone: '', city: '', province: '',
    website: '', address: '',
  });

  const update = (field: string, val: string) => {
    setForm(f => ({...f, [field]: val}));
    setErrors(e => (e[field] ? { ...e, [field]: '' } : e));
  };

  const REQUIRED = [
    { name: 'orgName', label: 'Organization name' },
    { name: 'city', label: 'City' },
    { name: 'province', label: 'Province' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email address' },
    { name: 'password', label: 'Password' },
    { name: 'confirmPassword', label: 'Password confirmation' },
  ];

  const validate = () => {
    const found = requiredErrors(form, REQUIRED);
    if (form.email && !found.email) {
      const e = emailError(form.email);
      if (e) found.email = e;
    }
    if (form.password && form.password.length < 8) found.password = 'Use at least 8 characters';
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      found.confirmPassword = "Passwords don't match";
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
              <TextField label="Organization Name" required value={form.orgName} error={errors.orgName}
                placeholder="Paws &amp; Hearts Rescue" onChange={v => update('orgName', v)} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="City" required value={form.city} error={errors.city}
                  placeholder="Toronto" onChange={v => update('city', v)} />
                <ProvinceSelect required value={form.province} error={errors.province}
                  onChange={v => update('province', v)} />
              </div>
              <TextField label="Phone" required value={form.phone} error={errors.phone}
                placeholder="416-555-0100" onChange={v => update('phone', v)} />
              <TextField label="Website (optional)" value={form.website}
                placeholder="https://yourrescue.org" onChange={v => update('website', v)} />
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Account Credentials</p>
            <div className="space-y-3">
              <EmailField label="Email" value={form.email} error={errors.email}
                placeholder="contact@yourrescue.org"
                onChange={v => update('email', v)}
                onBlur={() => {
                  const e = form.email ? emailError(form.email) : null;
                  setErrors(prev => ({ ...prev, email: e || '' }));
                }} />
              <TextField label="Password" required type="password" value={form.password} error={errors.password}
                placeholder="Min. 8 characters" onChange={v => update('password', v)} />
              <TextField label="Confirm Password" required type="password" value={form.confirmPassword}
                error={errors.confirmPassword} placeholder="Repeat password"
                onChange={v => update('confirmPassword', v)} />
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
