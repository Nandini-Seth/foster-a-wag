/**
 * Loads .env.local for the standalone scripts.
 *
 * Next.js reads .env.local by itself, but `node` and `tsx` do not — so without
 * this, `npm run migrate` and friends see no DATABASE_URL however the file is
 * filled in.
 *
 * Real environment variables always win, which is what makes this a no-op on
 * Cloud Run, where the values are injected from Secret Manager and no file exists.
 */
export function loadEnv() {
  // process.loadEnvFile is built in from Node 20.12 — no dependency needed, and
  // it is absent from the runtime image's node_modules by design.
  if (typeof process.loadEnvFile !== 'function') return;

  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
      return;
    } catch {
      // File missing or unreadable — try the next one.
    }
  }
}
