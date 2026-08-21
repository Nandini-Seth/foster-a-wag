import fs from 'fs';
import path from 'path';
import { queryAll } from '@/lib/db';

/**
 * Guards against the app serving traffic on a database that is behind on
 * migrations.
 *
 * This is not hypothetical: the tri-state release shipped while Cloud SQL still
 * had `good_with_kids` as a boolean. Postgres accepts 'YES' and 'NO' as boolean
 * literals, so those inserts succeeded silently and only 'UNKNOWN' failed —
 * intermittent 500s that looked like an application bug rather than a skipped
 * deploy step.
 *
 * The migration files ship inside the image, so the image itself knows which
 * schema it needs. Comparing that against `schema_migrations` turns "some posts
 * mysteriously fail" into "this revision refuses to start".
 */

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

/** Once every migration is applied it stays applied, so a clean result is cached. */
let verified = false;

function expectedMigrations(): string[] {
  try {
    return fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch {
    // No migrations directory (some test setups). Nothing to assert.
    return [];
  }
}

/** Migration files present in this build that the database has not run yet. */
export async function pendingMigrations(): Promise<string[]> {
  if (verified) return [];

  const expected = expectedMigrations();
  if (expected.length === 0) {
    verified = true;
    return [];
  }

  const rows = await queryAll<{ name: string }>(
    `SELECT name FROM schema_migrations`
  ).catch((err: any) => {
    // The table itself is missing — nothing has ever been migrated.
    if (err?.code === '42P01') return [] as { name: string }[];
    throw err;
  });

  const applied = new Set(rows.map((r) => r.name));
  const pending = expected.filter((name) => !applied.has(name));

  if (pending.length === 0) verified = true;
  return pending;
}

/**
 * Postgres error codes that mean "the schema is not what this code expects",
 * as opposed to bad user input.
 */
const SCHEMA_MISMATCH_CODES = new Set([
  '22P02', // invalid_text_representation — e.g. 'UNKNOWN' into a boolean column
  '42703', // undefined_column
  '42P01', // undefined_table
  '42804', // datatype_mismatch
]);

export function isSchemaMismatch(err: unknown): boolean {
  const code = (err as any)?.code;
  return typeof code === 'string' && SCHEMA_MISMATCH_CODES.has(code);
}

/**
 * Logs a database failure with the detail needed to tell a schema drift apart
 * from an ordinary error, and reports whether it was drift.
 */
export function logDbError(route: string, err: unknown): boolean {
  const e = err as any;
  const drift = isSchemaMismatch(err);
  console.error(
    `[${route}] database error` +
      (drift ? ' — SCHEMA MISMATCH: the database is behind this build. Run the migrate job.' : ''),
    { code: e?.code, message: e?.message, detail: e?.detail, column: e?.column, table: e?.table }
  );
  return drift;
}
