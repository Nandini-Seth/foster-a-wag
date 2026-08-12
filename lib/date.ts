/**
 * Formats a bare YYYY-MM-DD date for display.
 *
 * `new Date('2026-09-01')` parses as UTC midnight, so in any timezone west of
 * UTC `toLocaleDateString` renders the *previous* day — an availability date of
 * Sep 1 shows as Aug 31 in Toronto. Splitting the parts and building a local
 * date keeps the day the rescue actually chose.
 */
export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string | null {
  if (!value) return null;

  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d).toLocaleDateString('en-CA', options);
}

/** True when the date is today or earlier — i.e. the pet is available now. */
export function isAvailableNow(value: string | null | undefined): boolean {
  if (!value) return false;

  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return false;

  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return target <= today;
}
