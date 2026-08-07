'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    if (data.role === 'ADMIN') router.push('/dashboard/admin');
    else if (data.role === 'RESCUE') router.push('/dashboard/rescue');
    else router.push('/dashboard/foster');
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl">🐾</Link>
            <h1 className="font-display text-3xl text-green-900 mt-2">Welcome back</h1>
            <p className="text-stone-500 text-sm mt-1">Sign in to your Foster A Wag account</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <strong>Demo accounts:</strong><br />
            Foster: foster@demo.com / password123<br />
            Rescue: rescue@demo.com / password123<br />
            Admin: admin@fosterwag.com / admin1234
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don't have an account? <Link href="/register" className="text-amber-600 hover:underline font-medium">Get started</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
