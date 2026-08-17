/** Canadian provinces and territories, in the order Statistics Canada lists them. */
export const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
] as const;

export const PROVINCE_CODES = PROVINCES.map((p) => p.code);

export function isProvinceCode(value: unknown): boolean {
  return typeof value === 'string' && (PROVINCE_CODES as readonly string[]).includes(value);
}

/**
 * Practical email check: one @, something either side, a dot in the domain, and
 * no spaces. Deliberately not RFC 5322 — that accepts addresses no mail server
 * would route, and rejecting a valid address is worse than accepting an odd one.
 * Deliverability is proven by the person replying to our email, not by a regex.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

/** The message shown when an email does not pass. */
export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email address is required';
  if (!v.includes('@')) return "Include an @ — for example, name@example.com";
  if (EMAIL_RE.test(v)) return null;
  if (/\s/.test(v)) return 'Email addresses cannot contain spaces';
  if (!/\.[^\s@]{2,}$/.test(v.split('@')[1] ?? '')) {
    return 'Add a domain ending — for example, name@example.com';
  }
  return 'Enter a valid email address, like name@example.com';
}

/** Three-valued answers used on pet posts. */
export const TRISTATE_COMPAT = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'UNKNOWN', label: "Don't know" },
] as const;

export const TRISTATE_HOUSE_TRAINED = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'WORKING_ON_IT', label: 'Working on it' },
] as const;

export const COMPAT_VALUES = ['YES', 'NO', 'UNKNOWN'];
export const HOUSE_TRAINED_VALUES = ['YES', 'NO', 'WORKING_ON_IT', 'UNKNOWN'];

/**
 * Collects the first error for each required field.
 * Returns an empty object when the step is good to submit.
 */
export function requiredErrors(
  values: Record<string, any>,
  fields: { name: string; label: string }[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const { name, label } of fields) {
    const v = values[name];
    if (v === undefined || v === null || String(v).trim() === '') {
      errors[name] = `${label} is required`;
    }
  }
  return errors;
}
