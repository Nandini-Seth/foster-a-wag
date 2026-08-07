'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PetDetailPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch(`/api/pets/${params.id}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([petData, sessionData]) => {
      setPet(petData);
      setSession(sessionData);
      setLoading(false);
    });
  }, [params.id]);

  const speciesEmoji: Record<string, string> = { Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰' };

  if (loading) return <><Navbar /><div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">Loading…</div></>;
  if (!pet || pet.error) return <><Navbar /><div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">Pet not found.</div></>;

  const Pill = ({ children, color = 'green' }: any) => (
    <span className={`bg-${color}-50 text-${color}-700 text-sm px-3 py-1.5 rounded-full font-medium`}>{children}</span>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pets" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">
          ← Back to all pets
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Photo */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-stone-100 h-80 md:h-96">
              {pet.primary_photo ? (
                <img src={pet.primary_photo} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">{speciesEmoji[pet.species] || '🐾'}</div>
              )}
            </div>
            <div className="mt-4 bg-white rounded-2xl p-5 border border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Posted by</p>
              <p className="font-semibold text-green-900">{pet.org_name}</p>
              <p className="text-stone-500 text-sm">{pet.rescue_city}</p>
              {pet.rescue_email && <p className="text-sm text-amber-600 mt-1">{pet.rescue_email}</p>}
              {pet.rescue_website && (
                <a href={pet.rescue_website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{pet.rescue_website}</a>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="font-display text-5xl text-green-900">{pet.name}</h1>
              {pet.urgent_by && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">URGENT</span>}
            </div>
            <p className="text-stone-500 mb-4">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''} · {pet.age_years} year{pet.age_years !== 1 ? 's' : ''} old · {pet.sex}</p>
            <p className="text-stone-600 leading-relaxed mb-6">{pet.bio}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {pet.house_trained ? <Pill>🏠 House Trained</Pill> : <Pill color="stone">⚠️ Not House Trained</Pill>}
              {pet.spayed_neutered ? <Pill>✂️ Spayed/Neutered</Pill> : null}
              {pet.vaccinated ? <Pill color="blue">💉 Vaccinated</Pill> : null}
              {pet.microchipped ? <Pill color="purple">📡 Microchipped</Pill> : null}
              {pet.good_with_kids ? <Pill color="yellow">👶 Good w/ Kids</Pill> : <Pill color="stone">⚠️ No Young Kids</Pill>}
              {pet.good_with_dogs ? <Pill color="orange">🐶 Good w/ Dogs</Pill> : null}
              {pet.good_with_cats ? <Pill color="pink">🐱 Good w/ Cats</Pill> : null}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-stone-400 text-xs uppercase font-semibold mb-1">Location</p>
                <p className="text-stone-700">{pet.city}, {pet.province}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-stone-400 text-xs uppercase font-semibold mb-1">Available From</p>
                <p className="text-stone-700">{pet.available_from ? new Date(pet.available_from).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Contact rescue'}</p>
              </div>
              {pet.weight_kg && (
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-stone-400 text-xs uppercase font-semibold mb-1">Weight</p>
                  <p className="text-stone-700">{pet.weight_kg} kg</p>
                </div>
              )}
              {pet.special_needs && (
                <div className="bg-amber-50 rounded-xl p-3 col-span-2">
                  <p className="text-amber-600 text-xs uppercase font-semibold mb-1">Special Needs</p>
                  <p className="text-amber-800 text-sm">{pet.special_needs}</p>
                </div>
              )}
            </div>

            {session?.isLoggedIn && session.role === 'FOSTER' ? (
              pet.status === 'AVAILABLE' ? (
                <Link href={`/apply/${pet.id}`}
                  className="w-full block text-center bg-green-800 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg">
                  📋 Submit Full Application
                </Link>
              ) : (
                <div className="bg-stone-100 text-stone-500 text-center py-4 rounded-xl font-medium">
                  This pet is currently {pet.status.toLowerCase().replace('_', ' ')}
                </div>
              )
            ) : !session?.isLoggedIn ? (
              <Link href="/login" className="w-full block text-center bg-green-800 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors">
                Sign in to Apply
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
