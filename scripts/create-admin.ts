/**
 * Creates an ACTIVE admin account.
 *
 *   npm run create-admin -- admin@yourdomain.com
 *
 * By default the password is generated and printed once. To set a specific one,
 * pass it through the environment rather than as an argument, so it does not end
 * up in the process list:
 *
 *   ADMIN_PASSWORD='...' npm run create-admin -- admin@yourdomain.com
 *
 * Admins bypass the foster/rescue review sequence — they are created ACTIVE and
 * can sign in immediately.
 *
 * This replaces the old behaviour where lib/db.ts silently created
 * admin@fosterwag.com / admin1234 on any empty database.
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { loadEnv } from './load-env.mjs';

loadEnv();

const MIN_PASSWORD_LENGTH = 8;

function generatePassword(): string {
  // 24 base64url chars — no ambiguity about shell escaping when it gets pasted.
  return crypto.randomBytes(18).toString('base64url');
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    console.error('Usage: npm run create-admin -- <email>');
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
      [uuidv4(), email, hash]
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
