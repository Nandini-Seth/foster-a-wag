'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function FostersPage() {
  const [fosters, setFosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', available: false });

  const fetchFosters = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.available) params.set('available', '1');
    const res = await fetch(`/api/fosters?${params}`);
    if (res.ok) { const data = await res.json(); setFosters(data); }
    setLoading(false);
  };

  useEffect(() => { fetchFosters(); }, []);

  const dwellingEmoji: Record<string, string> = { house: '🏠', apartment: '🏢', condo: '🏙️', townhouse: '🏘️', farm: '🌾' };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-green-900 mb-2">Browse Foster Families</h1>
          <p className="text-stone-500">Find available fosters who are ready to open their homes to an animal in need.</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase mb-1.5">City</label>
            <input value={filters.city} onChange={e => setFilters(f => ({...f, city: e.target.value}))} placeholder="e.g. Toronto"
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.available} onChange={e => setFilters(f => ({...f, available: e.target.checked}))}
              className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-stone-700">Available now</span>
          </label>
          <button onClick={fetchFosters} className="bg-green-800 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
            Search
          </button>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-56 animate-pulse" />)}
          </div>
        ) : fosters.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-stone-400">No fosters found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fosters.map(foster => {
              const prefs = typeof foster.preferences === 'string' ? JSON.parse(foster.preferences) : foster.preferences;
              return (
                <div key={foster.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                      {dwellingEmoji[foster.dwelling_type] || '🏠'}
                    </div>
                    {foster.available_from && new Date(foster.available_from) <= new Date() && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Available Now</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-stone-800 text-lg">{foster.full_name}</h3>
                  <p className="text-stone-500 text-sm mb-3">{foster.city}, {foster.province}</p>
                  <div className="space-y-1.5 text-sm text-stone-600 mb-4">
                    <p>🏠 {foster.dwelling_type || 'Home'}{foster.fenced_backyard ? ' · Fenced yard' : ''}</p>
                    <p>👥 {foster.num_adults} adult{foster.num_adults !== 1 ? 's' : ''}{foster.num_children > 0 ? `, ${foster.num_children} child${foster.num_children !== 1 ? 'ren' : ''}` : ''}</p>
                    {foster.available_from && <p>📅 Available {new Date(foster.available_from).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</p>}
                  </div>
                  {prefs?.species && prefs.species.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {prefs.species.map((s: string) => (
                        <span key={s} className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
