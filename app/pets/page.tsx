'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PetPhoto from '@/components/PetPhoto';
import { AvailableFromBadge } from '@/components/AvailableFrom';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ species: '', city: '', goodWithKids: false, goodWithDogs: false, goodWithCats: false });

  const fetchPets = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.species) params.set('species', filters.species);
    if (filters.city) params.set('city', filters.city);
    if (filters.goodWithKids) params.set('goodWithKids', '1');
    if (filters.goodWithDogs) params.set('goodWithDogs', '1');
    if (filters.goodWithCats) params.set('goodWithCats', '1');
    const res = await fetch(`/api/pets?${params}`);
    const data = await res.json();
    setPets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPets();
    fetch('/api/auth/me').then(r => r.json()).then(setSession).catch(() => setSession({ isLoggedIn: false }));
  }, []);

  const speciesEmoji: Record<string, string> = { Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰', 'Small Animal': '🐹' };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-green-900 mb-2">Find Your Temporary Companion</h1>
          <p className="text-stone-500">Browse animals looking for loving foster homes right now.</p>
        </div>

        {/* Browsing is open to everyone; applying is what needs an account. */}
        {session && !session.isLoggedIn && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="flex-1 text-sm text-green-900">
              <span className="font-semibold">Browsing as a guest.</span>{' '}
              Look around as much as you like — you will need a free foster account when you are ready to apply.
            </p>
            <Link href="/register/foster"
              className="flex-shrink-0 rounded-full bg-green-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">
              Create an account
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase mb-1.5">Species</label>
            <select value={filters.species} onChange={e => setFilters(f => ({...f, species: e.target.value}))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">All Animals</option>
              <option value="Dog">🐶 Dogs</option>
              <option value="Cat">🐱 Cats</option>
              <option value="Bird">🐦 Birds</option>
              <option value="Rabbit">🐰 Rabbits</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase mb-1.5">City</label>
            <input value={filters.city} onChange={e => setFilters(f => ({...f, city: e.target.value}))} placeholder="e.g. Toronto"
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex flex-wrap gap-3">
            {[['goodWithKids', '👶 Good w/ Kids'], ['goodWithDogs', '🐶 Good w/ Dogs'], ['goodWithCats', '🐱 Good w/ Cats']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(filters as any)[key]}
                  onChange={e => setFilters(f => ({...f, [key]: e.target.checked}))}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-stone-700">{label}</span>
              </label>
            ))}
          </div>
          <button onClick={fetchPets} className="bg-green-800 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
            Search
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-2xl text-stone-600 mb-2">No pets found</h3>
            <p className="text-stone-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <Link key={pet.id} href={`/pets/${pet.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <PetPhoto src={pet.primary_photo} alt={pet.name}
                    className="w-full h-full object-cover"
                    imgClassName="group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-stone-700">
                    {speciesEmoji[pet.species]} {pet.species}
                  </div>
                  {pet.urgent_by && <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">URGENT</div>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display text-xl text-green-900">{pet.name}</h3>
                    <span className="text-stone-400 text-sm">{pet.age_years}yr</span>
                  </div>
                  <p className="text-stone-500 text-sm mb-3">{pet.breed || pet.species} · {pet.sex} · {pet.city}, {pet.province}</p>
                  <div className="mb-3">
                    <AvailableFromBadge date={pet.available_from} />
                  </div>
                  <p className="text-stone-600 text-sm line-clamp-2 mb-4">{pet.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pet.house_trained ? <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">House trained</span> : null}
                    {pet.good_with_kids ? <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">Good w/ kids</span> : null}
                    {pet.vaccinated ? <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">Vaccinated</span> : null}
                  </div>
                  <p className="text-xs text-stone-400 mt-3">Posted by {pet.org_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
