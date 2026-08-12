'use client';
import { useState } from 'react';

/**
 * A pet photo that falls back to the Foster A Wag mark.
 *
 * Photos break for reasons the poster cannot see at upload time — a remote host
 * going away, a file that never made it to storage, a format the browser will
 * not decode. A broken-image icon reads as a bug; the logo reads as "no photo
 * yet" and keeps the card looking finished.
 */
export default function PetPhoto({
  src,
  alt,
  className = '',
  imgClassName = '',
}: {
  src?: string | null;
  alt: string;
  /** Applied to the wrapper in both states, so layout does not shift. */
  className?: string;
  /** Applied to the <img> only. */
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-green-900/5 ${className}`}
        role="img"
        aria-label={`${alt} — no photo available`}
      >
        {/* Plain <img>: next/image would need this host allow-listed, and the
            mark is a local asset shown at many sizes. */}
        <img
          src="/logo.jpeg"
          alt=""
          aria-hidden="true"
          className="h-1/2 w-1/2 max-h-24 max-w-24 rounded-full object-cover opacity-40"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`.trim()}
    />
  );
}
