'use client';
import { useState } from 'react';

/**
 * A pet photo that fits inside its frame without cropping, and falls back to the
 * Foster A Wag mark when there is no usable image.
 *
 * `object-contain` rather than `object-cover`: rescues upload whatever their
 * phone took, and cover crops to fill — which on a tall portrait shot cuts the
 * animal's head off. Letterboxing shows the whole photo at its true aspect
 * ratio. The bars are painted with the card's own background (passed in via
 * `className`) so they read as part of the card, not as grey gutters.
 *
 * `cover` remains available for the few places where a full bleed is wanted and
 * the frame is close to square.
 */
export default function PetPhoto({
  src,
  alt,
  className = '',
  imgClassName = '',
  fit = 'contain',
}: {
  src?: string | null;
  alt: string;
  /** Sizing and background for the frame — include a bg-* to colour the bars. */
  className?: string;
  /** Extra classes for the <img> itself, e.g. hover transforms. */
  imgClassName?: string;
  fit?: 'contain' | 'cover';
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      {...(showFallback ? { role: 'img', 'aria-label': `${alt} — no photo available` } : {})}
    >
      {showFallback ? (
        /* Plain <img>: next/image would need hosts allow-listed, and the mark is
           a local asset rendered at many sizes. */
        <img
          src="/logo.jpeg"
          alt=""
          aria-hidden="true"
          className="h-1/2 w-1/2 max-h-24 max-w-24 rounded-full object-cover opacity-40"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} ${imgClassName}`.trim()}
        />
      )}
    </div>
  );
}
