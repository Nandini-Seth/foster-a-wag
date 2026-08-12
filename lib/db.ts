import { Pool, types } from 'pg';

// Postgres returns DATE (oid 1082) as a JS Date by default, which serializes to a
// full ISO timestamp over JSON. The UI feeds these straight into <input type="date">
// and renders them as-is, both of which need a bare YYYY-MM-DD, so keep them as text.
types.setTypeParser(1082, (value) => value);

// NUMERIC (oid 1700) arrives as a string to preserve precision. weight_kg and
// age_years are display values, so a JS number matches what the UI expects.
types.setTypeParser(1700, (value) => (value === null ? null : parseFloat(value)));

declare global {
  // eslint-disable-next-line no-var
  var __fosterAWagPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Point it at Cloud SQL, or at local Postgres for development.');
  }

  return new Pool({
    connectionString,
    // Cloud Run runs many instances, each with its own pool, so per-instance
    // pools must stay small or they exhaust the Cloud SQL connection limit
    // together. Keep max * --max-instances under the instance tier's ceiling.
    max: Number(process.env.PG_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

// Next.js dev mode re-evaluates modules on hot reload; without this the pools leak.
function getPool(): Pool {
  if (!global.__fosterAWagPool) {
    const pool = createPool();
    pool.on('error', (err) => console.error('[db] idle client error', err));
    global.__fosterAWagPool = pool;
  }
  return global.__fosterAWagPool;
}

/** Single row, or undefined when there is no match. */
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | undefined> {
  const result = await getPool().query(text, params);
  return result.rows[0] as T | undefined;
}

/** All matching rows. */
export async function queryAll<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

/** Write statement. Returns the number of rows affected. */
export async function execute(text: string, params: any[] = []): Promise<number> {
  const result = await getPool().query(text, params);
  return result.rowCount ?? 0;
}

/** Runs the callback inside a transaction, rolling back if it throws. */
export async function transaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { getPool };
