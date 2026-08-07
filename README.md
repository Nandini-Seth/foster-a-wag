# 🐾 Foster A Wag

A web platform connecting rescue organizations with foster families to find loving temporary homes for animals in need.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Foster | foster@demo.com | password123 |
| Rescue Org | rescue@demo.com | password123 |

The demo data is seeded automatically on first run (6 pets, 2 accounts).

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

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite via better-sqlite3
- **Auth**: iron-session (cookie-based sessions)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
app/
  api/              # API routes (auth, pets, fosters, applications)
  dashboard/        # Foster & rescue dashboards
  pets/             # Browse + pet detail pages
  apply/[petId]/    # Foster application form
  rescue/pets/new/  # Post a pet (rescue only)
  fosters/          # Browse foster profiles (rescue only)
  register/         # Role-selection + onboarding forms
  login/            # Login page
lib/
  db.ts             # SQLite schema, queries & seed data
  session.ts        # Session management
components/
  Navbar.tsx        # Role-aware navigation
data/               # SQLite database file (auto-created)
```

## Environment Variables

```
SESSION_SECRET=your-secret-key-min-32-chars
```

## Next Steps (V2)

- In-app messaging between fosters and rescues
- Cloudinary photo uploads
- Email notifications (Resend/SendGrid)
- Availability reminder cron job
- Foster compatibility scoring algorithm
