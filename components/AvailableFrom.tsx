'use client';
import { formatDate, isAvailableNow } from '@/lib/date';

/**
 * The availability date is the thing a foster scans for first — it decides
 * whether a pet is relevant to them at all — so it gets warm colour and its own
 * framing rather than sitting in the grey detail grid.
 */
export function AvailableFromPanel({ date }: { date?: string | null }) {
  const label = formatDate(date);
  const now = isAvailableNow(date);

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden="true">📅</span>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-amber-700">
          Available from
        </p>
      </div>
      <p className="font-display text-2xl leading-tight text-amber-900">
        {label ?? 'Contact rescue'}
      </p>
      {label && (
        <p className="mt-0.5 text-xs font-medium text-amber-700">
          {now ? 'Ready for a foster home now' : 'Plan ahead — not available yet'}
        </p>
      )}
    </div>
  );
}

/** Compact variant for cards in a grid. */
export function AvailableFromBadge({ date }: { date?: string | null }) {
  const label = formatDate(date, { month: 'short', day: 'numeric' });
  const now = isAvailableNow(date);

  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        now ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
      }`}
    >
      <span aria-hidden="true">📅</span>
      {now ? 'Available now' : `Available ${label}`}
    </span>
  );
}
