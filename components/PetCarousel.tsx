'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PetPhoto from '@/components/PetPhoto';
import { formatDate, isAvailableNow } from '@/lib/date';

const ROTATE_MS = 5000;

/**
 * Rotating showcase of pets currently looking for a foster home. Replaces the
 * static logo in the hero — real animals make a better case than a mark does.
 *
 * Auto-advance stops on hover and on keyboard focus, and never starts at all
 * when the visitor has asked for reduced motion.
 */
export default function PetCarousel() {
  const [pets, setPets] = useState<any[] | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cancelled = false;
    fetch('/api/pets')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setPets(Array.isArray(data) ? data.slice(0, 8) : []);
      })
      .catch(() => {
        if (!cancelled) setPets([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = pets?.length ?? 0;

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || reducedMotion.current || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  const frame =
    'w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 bg-white/10';

  if (pets === null) {
    return <div className={`${frame} animate-pulse`} aria-hidden="true" />;
  }

  // Nothing listed yet — say so rather than showing an empty frame.
  if (count === 0) {
    return (
      <div className={`${frame} flex flex-col items-center justify-center gap-3 px-8 text-center`}>
        <span className="text-5xl" aria-hidden="true">🐾</span>
        <p className="font-display text-xl text-white">No pets listed just yet</p>
        <p className="text-sm text-green-100">
          Rescues are getting set up. Check back soon.
        </p>
      </div>
    );
  }

  const pet = pets[index];
  const available = formatDate(pet.available_from, { month: 'short', day: 'numeric' });
  const now = isAvailableNow(pet.available_from);

  return (
    <div
      className="flex flex-col items-center gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <Link
          href={`/pets/${pet.id}`}
          className={`${frame} group relative block focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300`}
          aria-label={`View ${pet.name}, ${pet.breed || pet.species} in ${pet.city ?? 'your area'}`}
        >
          <PetPhoto
            src={pet.primary_photo}
            alt={pet.name}
            className="h-full w-full object-cover"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />

          {/* Caption sits over the photo so the frame stays a fixed size. */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 pt-12 text-left">
            {available && (
              <span
                className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  now ? 'bg-amber-500 text-white' : 'bg-white/90 text-amber-800'
                }`}
              >
                <span aria-hidden="true">📅</span>
                {now ? 'Available now' : `Available ${available}`}
              </span>
            )}
            <p className="font-display text-3xl leading-tight text-white">{pet.name}</p>
            <p className="text-sm text-green-100">
              {pet.breed || pet.species}
              {pet.city ? ` · ${pet.city}` : ''}
            </p>
          </div>

          {pet.urgent_by && (
            <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              URGENT
            </span>
          )}
        </Link>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous pet"
              className="absolute -left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-green-900 shadow-lg transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:-left-5"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next pet"
              className="absolute -right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-green-900 shadow-lg transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:-right-5"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose a pet to preview">
          {pets.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={p.name}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                i === index ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Announces the change for screen readers without moving focus. */}
      <p className="sr-only" aria-live="polite">
        {pet.name}, {index + 1} of {count}
      </p>
    </div>
  );
}
