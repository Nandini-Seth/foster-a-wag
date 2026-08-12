/**
 * Applies any migrations in ./migrations that have not run yet.
 *
 *   npm run migrate
 *
 * Run this as a deploy step, before the new Cloud Run revision takes traffic —
 * never from application startup, where concurrent instances would race on DDL.
 *
 * Plain JavaScript on purpose: this has to run inside the runtime container,
 * which has no TypeScript toolchain, using the `pg` copy the standalone build
 * already traced into node_modules.
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { loadEnv } from './load-env.mjs';

loadEnv();

const { Pool } = pg;
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Serialises concurrent migrate runs: a second one blocks here until the
    // first commits, then sees its rows and skips them.
    const client = await pool.connect();
    let ran = 0;

    try {
      await client.query('BEGIN');
      await client.query('LOCK TABLE schema_migrations IN EXCLUSIVE MODE');

      const applied = new Set(
        (await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name)
      );

      const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (applied.has(file)) continue;

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        console.log(`applied  ${file}`);
        ran++;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    console.log(ran === 0 ? 'Already up to date.' : `Applied ${ran} migration(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
