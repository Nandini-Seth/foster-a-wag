'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PetPhoto from '@/components/PetPhoto';
import { AvailableFromPanel } from '@/components/AvailableFrom';
import { formatDate } from '@/lib/date';
import {
  PET_STATE_HELP, PET_STATE_LABEL, isEditableState, compatLabel, houseTrainedLabel,
  type PetState,
} from '@/lib/pets';

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

  if (loading) return <><Navbar /><div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">Loading…</div></>;
  if (!pet || pet.error) return <><Navbar /><div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">Pet not found.</div></>;

  // Full class strings, not interpolated: Tailwind only emits classes it can see
  // literally in the source, so `bg-${color}-50` compiles to nothing.
  const PILL_TONE: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    stone: 'bg-stone-100 text-stone-600',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  const Pill = ({ children, color = 'green' }: any) => (
    <span className={`${PILL_TONE[color] ?? PILL_TONE.green} text-sm px-3 py-1.5 rounded-full font-medium`}>{children}</span>
  );

  const state = (pet.status ?? 'ACTIVE') as PetState;
  const isOwner = session?.isLoggedIn && session.role === 'RESCUE' && session.profileId === pet.rescue_id;
  const isFoster = session?.isLoggedIn && session.role === 'FOSTER';

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pets" className="text-sm text-stone-500 hover:text-amber-600 inline-flex items-center gap-1 mb-6">
          ← Back to all pets
        </Link>

        {/* Only the owning rescue can reach a post that is not ACTIVE. */}
        {isOwner && state !== 'ACTIVE' && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 ${state === 'DELETED' ? 'border-stone-300 bg-stone-100' : 'border-amber-300 bg-amber-50'}`}>
            <p className={`font-semibold ${state === 'DELETED' ? 'text-stone-700' : 'text-amber-900'}`}>
              {PET_STATE_LABEL[state]} — not visible to the public
            </p>
            <p className={`text-sm ${state === 'DELETED' ? 'text-stone-500' : 'text-amber-800'}`}>
              {PET_STATE_HELP[state]}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Photo */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-amber-50 border border-stone-100 h-80 md:h-96">
              {/* Letterbox bars take the page ground so the photo sits on the page
                  rather than in a white box of its own. */}
              <PetPhoto src={pet.primary_photo} alt={pet.name} className="w-full h-full bg-amber-50" />
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
            <p className="text-stone-500 mb-5">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''} · {pet.age_years} year{pet.age_years !== 1 ? 's' : ''} old · {pet.sex}</p>

            {/* Availability leads — it is what decides whether this pet is relevant. */}
            <div className="mb-6">
              <AvailableFromPanel date={pet.available_from} />
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">{pet.bio}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {(() => {
                const ht = houseTrainedLabel(pet.house_trained);
                return ht ? (
                  <Pill color={ht.tone === 'good' ? 'green' : ht.tone === 'partial' ? 'amber' : 'stone'}>{ht.text}</Pill>
                ) : null;
              })()}
              {pet.spayed_neutered ? <Pill>✂️ Spayed/Neutered</Pill> : null}
              {pet.vaccinated ? <Pill color="blue">💉 Vaccinated</Pill> : null}
              {([
                [pet.good_with_kids, '👶 Good w/ Kids', '⚠️ No Young Kids'],
                [pet.good_with_dogs, '🐶 Good w/ Dogs', '⚠️ Not Good w/ Dogs'],
                [pet.good_with_cats, '🐱 Good w/ Cats', '⚠️ Not Good w/ Cats'],
              ] as const).map(([value, yes, no], i) => {
                const c = compatLabel(value, yes, no);
                return c ? <Pill key={i} color={c.tone === 'good' ? 'green' : 'stone'}>{c.text}</Pill> : null;
              })}
            </div>

            {/* Named explicitly rather than left as a silent gap, so a foster can
                see the difference between "no" and "the rescue does not know". */}
            {(() => {
              const unknowns = [
                pet.good_with_kids === 'UNKNOWN' && 'children',
                pet.good_with_dogs === 'UNKNOWN' && 'dogs',
                pet.good_with_cats === 'UNKNOWN' && 'cats',
              ].filter(Boolean);
              return unknowns.length > 0 ? (
                <p className="text-stone-500 text-sm mb-6 -mt-3">
                  The rescue has not been able to test {pet.name} with {unknowns.join(', ')}.
                </p>
              ) : null;
            })()}

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-stone-400 text-xs uppercase font-semibold mb-1">Location</p>
                <p className="text-stone-700">{pet.city}, {pet.province}</p>
              </div>
              {pet.urgent_by && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-red-500 text-xs uppercase font-semibold mb-1">Needs placement by</p>
                  <p className="text-red-800">{formatDate(pet.urgent_by)}</p>
                </div>
              )}
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

            {/* Call to action, by who is looking */}
            {isOwner ? (
              isEditableState(state) ? (
                <Link href={`/rescue/pets/${pet.id}/edit`}
                  className="w-full block text-center bg-green-800 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors">
                  ✏️ Edit this post
                </Link>
              ) : (
                <div className="bg-stone-100 text-stone-500 text-center py-4 rounded-xl font-medium">
                  Deleted posts cannot be edited
                </div>
              )
            ) : state !== 'ACTIVE' ? (
              <div className="bg-stone-100 text-stone-500 text-center py-4 rounded-xl font-medium">
                This pet is not currently accepting applications
              </div>
            ) : isFoster ? (
              <Link href={`/apply/${pet.id}`}
                className="w-full block text-center bg-green-800 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg">
                📋 Submit Full Application
              </Link>
            ) : session?.isLoggedIn ? null : (
              // Visitors can read everything; applying is where an account is needed.
              <div className="rounded-2xl border-2 border-green-800 bg-green-50 p-5 text-center">
                <p className="font-display text-xl text-green-900">Interested in fostering {pet.name}?</p>
                <p className="mt-1 text-sm text-green-800">
                  Create a free foster account to apply. Rescues review every application before a match is made.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link href={`/register/foster?next=${encodeURIComponent(`/apply/${pet.id}`)}`}
                    className="flex-1 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
                    Create an account
                  </Link>
                  <Link href="/login"
                    className="flex-1 border border-green-800 hover:bg-green-100 text-green-900 font-semibold py-3 rounded-xl transition-colors">
                    I already have one
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
