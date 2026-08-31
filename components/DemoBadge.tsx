/**
 * Marks a listing as sample data.
 *
 * Everything on the site at launch is seeded or test content. Without a marker a
 * visitor could reasonably believe these animals need homes — and a foster could
 * apply for one that does not exist. Deliberately high-contrast rather than
 * subtle, because the cost of it being missed is someone's wasted hope.
 */
export default function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white ${className}`}
    >
      <span aria-hidden="true">🧪</span>
      Sample
    </span>
  );
}

/** Fuller explanation for a pet's own page, where there is room to say why. */
export function DemoNotice() {
  return (
    <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 px-5 py-4">
      <p className="font-semibold text-purple-900">This is a sample listing</p>
      <p className="mt-1 text-sm leading-relaxed text-purple-800">
        This animal is demonstration data used while we set the site up. It is not a real animal
        waiting for a foster home, so please do not apply. Real listings will not carry this
        notice.
      </p>
    </div>
  );
}
