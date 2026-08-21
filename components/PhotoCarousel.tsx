'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Photo = { src: string; alt: string };

const ROTATE_MS = 6000;

/**
 * Captioned carousel of static photos.
 *
 * Entries whose file is missing are dropped as they fail to load, so the
 * carousel degrades to whatever is actually present rather than showing broken
 * images while a set is being filled in.
 */
export default function PhotoCarousel({
  photos,
  caption,
}: {
  photos: Photo[];
  caption?: string;
}) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const available = photos.filter((p) => !broken.has(p.src));
  const count = available.length;

  // A dropped photo can leave the index past the end.
  useEffect(() => {
    if (count > 0 && index >= count) setIndex(0);
  }, [count, index]);

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

  const markBroken = (src: string) =>
    setBroken((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  // Only the next photo is prefetched, so the page costs one image on load
  // rather than the whole set. Missing files are caught by the displayed image's
  // onError and dropped from rotation; with a full set that path never runs.
  useEffect(() => {
    if (count < 2) return;
    const next = available[(index + 1) % count];
    if (!next) return;
    const img = new Image();
    img.onerror = () => markBroken(next.src);
    img.src = next.src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-amber-100/60 px-8 text-center">
        <p className="text-sm text-amber-800">Photos coming soon.</p>
      </div>
    );
  }

  const current = available[Math.min(index, count - 1)];

  return (
    <figure
      className="m-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-amber-50 ring-1 ring-amber-200/70">
          <img
            key={current.src}
            src={current.src}
            alt={current.alt}
            loading="eager"
            decoding="async"
            onError={() => markBroken(current.src)}
            className="h-full w-full object-contain"
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute -left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-green-900 shadow-lg ring-1 ring-stone-200 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:-left-5"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute -right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-green-900 shadow-lg ring-1 ring-stone-200 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:-right-5"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {available.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Photo ${i + 1} of ${count}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                i === index ? 'w-6 bg-amber-500' : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>
      )}

      {caption && (
        <figcaption className="mt-4 text-center font-display text-xl italic text-green-900">
          {caption}
        </figcaption>
      )}

      <p className="sr-only" aria-live="polite">
        {current.alt}. Photo {index + 1} of {count}.
      </p>
    </figure>
  );
}
