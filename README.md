# 🐾 Foster A Wag

A web platform connecting rescue organizations with foster families to find loving temporary homes for animals in need.

## Quick Start

The app needs a Postgres database. Either Homebrew or Docker works.

**Homebrew (no Docker needed):**

```bash
brew install postgresql@16
brew services start postgresql@16
# postgresql@16 is keg-only, so its tools are not on PATH by default:
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
# match the connection string the app expects
psql -d postgres -c "CREATE ROLE postgres LOGIN SUPERUSER PASSWORD 'postgres';"
createdb -O postgres fosterawag
```

**Docker:** `npm run db:up` instead of the above.

Then, either way:

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL and SESSION_SECRET
npm run migrate                   # creates the schema
ALLOW_SEED=true npm run seed      # optional: demo rescue, foster, and 6 pets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Generate a session secret with `openssl rand -base64 32`. In production the app
refuses to start without one — see `lib/session.ts`.

### Accounts

`npm run seed` creates two demo accounts, `foster@demo.com` and
`rescue@demo.com`, both with the password `password123`. They are for local
development only; the seed script refuses to run against a production database.

Admin accounts are created explicitly, with a generated password printed once:

```bash
npm run create-admin -- you@yourdomain.com
```

To set the password yourself, pass it through the environment rather than as an
argument, so it stays out of the process list:

```bash
ADMIN_PASSWORD='...' npm run create-admin -- you@yourdomain.com
```

## Account Approval

Registering does not grant access. Fosters and rescues are reviewed by an admin
before they can sign in, and the account moves through these states:

| State | Meaning | Who moves it |
|---|---|---|
| `PENDING` | Signed up; nothing sent yet | — |
| `INFO_REQUESTED` | We emailed asking for verification (rescues: proof of legitimacy) | Admin |
| `INFO_RECEIVED` | They replied; email confirmed and details collected | Admin |
| `ACTIVE` | Approved and activated — **the only state that can sign in** | Admin |
| `REJECTED` | Declined | Admin |

Steps 2 and 3 happen over email, which the app does not send yet — the admin does
it manually and records the outcome from the admin dashboard. The applicant sees
a confirmation page after signing up and is told to expect contact in 24-48 hours.

Admins are created `ACTIVE` and skip this sequence entirely.

## Features

### Foster Registration
- Self-registration with 3-step onboarding
- Home setup details (dwelling type, fenced yard, household composition)
- Availability date + reminder frequency settings
- Pet preferences (species, size, age, special needs)

### Rescue Registration
- Organization profile with contact info
- Multi-step pet posting form (bio, health status, photos, location)
- Toggle pet availability status (Active / Inactive / Adopted)

### Pet Matching
- Fosters browse and filter available pets by species, city, compatibility
- Apply to foster with formal application form (motivation, references, digital signature)
- Rescues browse available foster profiles
- Rescue dashboard: review, accept, or decline applications
- Status tracking: PENDING → UNDER_REVIEW → ACCEPTED / DECLINED

## Tech Stack

- **Framework**: Next.js 14 (App Router), standalone output
- **Database**: PostgreSQL via `pg` (Cloud SQL in production)
- **Storage**: Google Cloud Storage for uploads, local disk in development
- **Auth**: iron-session (cookie-based sessions)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
app/
  api/              # API routes (auth, pets, fosters, applications, media)
  dashboard/        # Foster, rescue & admin dashboards
  pets/             # Browse + pet detail pages
  apply/[petId]/    # Foster application form
  rescue/pets/new/  # Post a pet (rescue only)
  fosters/          # Browse foster profiles (rescue only)
  register/         # Role-selection + onboarding forms
  login/            # Login page
lib/
  db.ts             # Postgres pool + query helpers
  session.ts        # Session management
  storage.ts        # Upload storage (GCS or local disk)
  validate.ts       # Shared input guards
components/
  Navbar.tsx        # Role-aware navigation
migrations/         # Numbered SQL migrations
scripts/            # migrate / seed / create-admin
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (standalone output) |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run migrate` | Apply pending migrations |
| `npm run seed` | Demo data (requires `ALLOW_SEED=true`, refuses in production) |
| `npm run create-admin -- <email>` | Create an admin with a generated password |
| `npm run db:up` / `db:down` | Local Postgres via docker compose |

## Environment Variables

See `.env.example`. `DATABASE_URL` and `SESSION_SECRET` are required;
`GCS_BUCKET` switches uploads from local disk to Cloud Storage.

## Deployment

Built for Cloud Run with Cloud SQL. The `Dockerfile` produces a standalone
image; migrations ship inside it and are applied as a deploy step with
`node scripts/migrate.mjs`, before the new revision takes traffic.

## Not Yet Built

- Automated email. The approval flow assumes an admin sends and receives the
  verification emails by hand and records the result in the dashboard.
- Email notifications to rescues when an application arrives
- Availability reminder job
- Rate limiting on login
- Multiple photos per pet
- In-app messaging between fosters and rescues
