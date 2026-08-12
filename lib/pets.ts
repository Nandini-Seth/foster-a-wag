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

export const PET_STATE_HELP: Record<PetState, string> = {
  ACTIVE: 'Visible to everyone and accepting applications.',
  PENDING: 'Hidden from the public — only you can see it. Use this once you have enough applications.',
  DELETED: 'Hidden from everyone and locked. Restore it to make changes again.',
};
