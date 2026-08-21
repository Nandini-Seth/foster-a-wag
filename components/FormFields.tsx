'use client';
import { PROVINCES, normalizePhone, formatPhone } from '@/lib/forms';

const INPUT =
  'w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:bg-stone-100 disabled:text-stone-400';
const OK = 'border-stone-200 focus:ring-green-400';
const BAD = 'border-red-300 bg-red-50 focus:ring-red-400';

export function fieldClass(error?: string) {
  return `${INPUT} ${error ? BAD : OK}`;
}

/** Label + control + inline error, so the message sits with the thing it describes. */
export function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  required,
  hint,
  type = 'text',
  placeholder,
  disabled,
  ...rest
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  const id = `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <Field label={label} required={required} error={error} hint={hint} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={fieldClass(error)}
        {...rest}
      />
    </Field>
  );
}

/**
 * Email input that validates on blur rather than on every keystroke — flagging
 * "j" as invalid while someone is still typing their address is noise.
 */
export function EmailField({
  label = 'Email Address',
  value,
  onChange,
  onBlur,
  error,
  required = true,
  disabled,
  placeholder = 'name@example.com',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const id = `email-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <Field label={label} required={required} error={error} htmlFor={id}>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={fieldClass(error)}
      />
    </Field>
  );
}

export function ProvinceSelect({
  value,
  onChange,
  error,
  required,
  disabled,
  label = 'Province / Territory',
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const id = 'province-select';
  return (
    <Field label={label} required={required} error={error} htmlFor={id}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={fieldClass(error)}
      >
        <option value="">Select…</option>
        {PROVINCES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.code} — {p.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * Segmented three-way choice. A control with three visible options is honest
 * about there being a third answer, which a toggle cannot express — it silently
 * defaults to one of two.
 */
export function TriState({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-1">
      <span className="text-sm text-stone-700">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className={`inline-flex rounded-lg bg-white p-0.5 ring-1 ring-stone-200 ${disabled ? 'opacity-60' : ''}`}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed ${
                active
                  ? opt.value === 'YES'
                    ? 'bg-green-600 text-white'
                    : opt.value === 'NO'
                      ? 'bg-stone-600 text-white'
                      : 'bg-amber-500 text-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Phone input that will not accept anything but digits.
 *
 * Non-digits are stripped as the person types rather than rejected afterwards —
 * they can still paste "(416) 555-0100" and it simply becomes the digits. The
 * value handed to the form is always bare digits; the display is formatted once
 * all ten are present, so the field is not fighting the cursor mid-entry.
 */
export function PhoneField({
  label = 'Phone',
  value,
  onChange,
  onBlur,
  error,
  required = true,
  disabled,
  placeholder = '416 555 0100',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const id = `phone-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const digits = normalizePhone(value);
  // Show the tidy form only once it is complete, so formatting never appears
  // and disappears while someone is still typing.
  const shown = digits.length === 10 ? formatPhone(digits) : value;

  return (
    <Field
      label={label}
      required={required}
      error={error}
      hint={error ? undefined : '10 digits'}
      htmlFor={id}
    >
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        maxLength={20}
        value={shown}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(normalizePhone(e.target.value).slice(0, 10))}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={fieldClass(error)}
      />
    </Field>
  );
}
