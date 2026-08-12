const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Route params land straight in `WHERE id = $1` against a uuid column, and Postgres
 * raises a type error on anything malformed. Checking first turns what would be a
 * 500 into the 404 the caller expects.
 */
export function isUuid(value: string | undefined | null): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}
