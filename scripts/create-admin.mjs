/**
 * Creates an ACTIVE admin account.
 *
 * Locally:
 *   npm run create-admin -- admin@yourdomain.com
 *   ADMIN_PASSWORD='...' npm run create-admin -- admin@yourdomain.com
 *
 * In production, as a Cloud Run job using the deployed image — no database
 * proxy or local tooling needed:
 *   gcloud run jobs execute create-admin --args=scripts/create-admin.mjs,you@example.com
 *
 * Plain JavaScript for the same reason as migrate.mjs: the runtime image has no
 * TypeScript toolchain, only the modules the standalone build traced.
 *
 * Admins skip the foster/rescue review sequence — they are created ACTIVE.
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { loadEnv } from './load-env.mjs';

// crypto.randomUUID rather than the `uuid` package: Next bundles uuid into the
// route chunks instead of leaving it in the standalone node_modules, so it is
// not importable from a script running inside the runtime image.

loadEnv();

const { Pool } = pg;
const MIN_PASSWORD_LENGTH = 8;

function generatePassword() {
  // 24 base64url chars — no ambiguity about shell escaping when it gets pasted.
  return crypto.randomBytes(18).toString('base64url');
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    console.error('Usage: create-admin <email>   (password via ADMIN_PASSWORD, otherwise generated)');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const supplied = process.env.ADMIN_PASSWORD;
  if (supplied && supplied.length < MIN_PASSWORD_LENGTH) {
    console.error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error(`${email} already exists.`);
      process.exit(1);
    }

    const password = supplied || generatePassword();
    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, email_verified, status, activated_at)
       VALUES ($1, $2, $3, 'ADMIN', true, 'ACTIVE', now())`,
      [crypto.randomUUID(), email, hash]
    );

    console.log('\nAdmin account created and activated.\n');
    console.log(`  email:    ${email}`);
    if (supplied) {
      console.log('  password: (the ADMIN_PASSWORD you supplied)\n');
    } else {
      console.log(`  password: ${password}\n`);
      console.log('This password is not stored anywhere and will not be shown again.\n');
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
