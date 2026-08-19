/** The three states a pet post can be in. */
export const PET_STATES = ['ACTIVE', 'PENDING', 'DELETED'] as const;
export type PetState = (typeof PET_STATES)[number];

export function isPetState(value: unknown): value is PetState {
  return typeof value === 'string' && (PET_STATES as readonly string[]).includes(value);
}

/** Only ACTIVE posts are visible to the public and open to applications. */
export const PUBLIC_PET_STATE: PetState = 'ACTIVE';

/** A soft-deleted post is read-only — the rescue can see it but not change it. */
export function isEditableState(state: string): boolean {
  return state === 'ACTIVE' || state === 'PENDING';
}

export const PET_STATE_LABEL: Record<PetState, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  DELETED: 'Deleted',
};

/**
 * How a three-valued answer reads on a listing.
 * `null` means say nothing — an unknown is not worth a badge, but it must not be
 * shown as a "no" either, which is what a boolean forced.
 */
export function compatLabel(
  value: string | null | undefined,
  yes: string,
  no: string
): { text: string; tone: 'good' | 'warn' } | null {
  if (value === 'YES') return { text: yes, tone: 'good' };
  if (value === 'NO') return { text: no, tone: 'warn' };
  return null;
}

export function houseTrainedLabel(
  value: string | null | undefined
): { text: string; tone: 'good' | 'warn' | 'partial' } | null {
  if (value === 'YES') return { text: '🏠 House Trained', tone: 'good' };
  if (value === 'NO') return { text: '⚠️ Not House Trained', tone: 'warn' };
  if (value === 'WORKING_ON_IT') return { text: '🏠 House Training in Progress', tone: 'partial' };
  return null;
}

export const PET_STATE_HELP: Record<PetState, string> = {
  ACTIVE: 'Visible to everyone and accepting applications.',
  PENDING: 'Hidden from the public — only you can see it. Use this once you have enough applications.',
  DELETED: 'Hidden from everyone and locked. Restore it to make changes again.',
};
