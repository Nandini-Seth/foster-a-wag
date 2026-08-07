# 🐾 Foster A Wag — Implementation Plan

> A web platform connecting rescue operations with foster families to find loving temporary homes for animals in need.

---

## 1. Project Overview

**Foster A Wag** is a two-sided marketplace-style platform where:
- **Fosters** self-register, describe their home, and indicate when they're available to care for a pet.
- **Rescue Operations** post animals available for fostering with full pet profiles.
- **Matching** allows both sides to find each other and initiate the fostering relationship.

---

## 2. Recommended Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React (Next.js 14) | SEO-friendly SSR, App Router, great DX |
| **Styling** | Tailwind CSS + shadcn/ui | Fast, consistent, accessible components |
| **Backend** | Node.js + Express (or Next.js API Routes) | Unified codebase, REST API |
| **Database** | PostgreSQL (via Prisma ORM) | Relational data fits well; Prisma adds type safety |
| **Auth** | NextAuth.js (or Clerk) | Supports email/password + OAuth (Google) |
| **File Storage** | AWS S3 or Cloudinary | Pet photo uploads |
| **Email/Notifications** | Resend or SendGrid | Reminders, application alerts |
| **Hosting** | Vercel (frontend) + Railway or Supabase (DB) | Simple deploys, scalable |

---

## 3. User Roles

| Role | Description |
|---|---|
| `FOSTER` | An individual or family offering a temporary home |
| `RESCUE` | A rescue organization posting pets for fostering |
| `ADMIN` | Platform administrator (moderation, oversight) |

---

## 4. Feature Implementation by Category

---

### 4.1 Foster Registration

**Goal:** Allow individuals to create and manage a foster profile.

#### Features & Implementation

**Self-Registration (`/register/foster`)**
- Form fields: Full name, email, password
- Role selection: "I want to foster a pet"
- Email verification on sign-up
- Database: Create `users` record with `role = FOSTER` + linked `foster_profiles` record

**Contact Information**
- Fields: Phone number, city, province/state, postal code
- Stored in `foster_profiles.contact_info (JSONB)`

**Home Setup**
- Fields: Type of dwelling (house / apartment / condo / farm), fenced backyard (yes/no), number of adults, number of children, other pets currently in home (type + count), square footage (optional)
- Stored in `foster_profiles.home_setup (JSONB)`

**Availability Date**
- Date picker: "Available to foster from [date]"
- Optional end date for known availability windows
- Stored in `foster_profiles.available_from` and `available_until`

**Pet Preferences**
- Multi-select checkboxes: Dog, Cat, Small animal, Bird, Reptile
- Sub-preferences per animal type: size (small/medium/large), age (puppy/adult/senior), special needs (yes/no/open)
- Stored in `foster_profiles.preferences (JSONB)`

**Availability Reminders**
- Foster sets a reminder frequency: Weekly / Monthly / Custom interval
- Reminder email is sent asking foster to confirm or update their availability
- Implementation: Cron job (node-cron or Vercel Cron) queries fosterswhose `reminder_next_send <= today`, sends email via Resend/SendGrid, updates `reminder_next_send`
- Stored in `foster_profiles.reminder_frequency` and `reminder_next_send`

---

### 4.2 Rescue Registration

**Goal:** Allow rescue organizations to create accounts and post animals needing fosters.

#### Features & Implementation

**Rescue Account Registration (`/register/rescue`)**
- Fields: Organization name, email, password, phone number, city/province, website (optional)
- Role: `RESCUE`
- Optional: Upload organization logo
- Stored in `users` + `rescue_profiles` tables

**Post a Pet for Fostering (`/rescue/pets/new`)**
- Multi-step form:
  1. Basic Info (name, species, breed, age, sex, weight)
  2. Status (house training, spay/neuter status, microchipped, vaccinations up to date)
  3. Personality & Needs (good with kids, good with dogs, good with cats, special medical needs, description/bio)
  4. Availability (date available for fostering, estimated foster duration)
  5. Photos (upload up to 10 images)
  6. Location (city of pet — not precise address for privacy)
  7. Contact info for foster coordination (can differ from main rescue contact)
- Stored in `pets` table with FK to `rescue_profiles`

**Photo Uploads**
- Drag-and-drop uploader (react-dropzone)
- Images stored in Cloudinary or S3, URLs stored in `pet_photos` table
- First image designated as "primary photo" for cards/listings

**Post Availability Date**
- "Available to foster from [date]" — shows on pet listing
- Optional: "Urgent — needs placement by [date]" flag
- Stored in `pets.available_from` and `pets.urgent_by`

**Rescue Contact Info**
- Stored on `rescue_profiles`: org name, address, phone, email, website
- Displayed on each pet listing page with a "Contact Rescue" button

---

### 4.3 Pet Matching

**Goal:** Connect fosters with pets and facilitate the application process.

#### Features & Implementation

**Browse & Search (`/pets`)**
- Foster-facing browse page with filters:
  - Species, breed, size, age, location, availability date
  - "Good with kids" / "Good with other pets" toggles
- Pet cards show: primary photo, name, breed, age, city, availability date, rescue org name
- Pagination or infinite scroll

**Foster Selects a Pet & Sends a Request**
- On a pet's detail page (`/pets/[id]`), foster clicks "I'm Interested in Fostering [Name]"
- System checks: Is foster profile complete? If not, prompts to complete profile first.
- Creates a `foster_requests` record with status `PENDING`
- Rescue receives an email notification: "[Foster Name] is interested in fostering [Pet Name]"
- Stored in `foster_requests`: `foster_id`, `pet_id`, `status`, `message (optional)`, `created_at`

**Rescue Reaches Out to a Foster (`/rescue/fosters`)**
- Rescue can browse foster profiles (name, home setup summary, availability, preferences, location — no private contact details until matched)
- Filter by: availability date, location, pet preferences, home type
- Rescue clicks "Reach Out" → sends a message/inquiry to a specific foster
- Creates a `rescue_outreach` record; foster receives email notification
- Stored in `rescue_outreach`: `rescue_id`, `foster_id`, `pet_id`, `message`, `status`

**Foster Submits Application Form**
- After expressing interest or receiving an outreach, foster can complete a formal application
- Application form fields:
  - Why do you want to foster this pet?
  - Describe your daily schedule
  - Vet reference (name + phone)
  - Personal reference (name + phone)
  - Agreement to foster terms (checkbox)
  - Digital signature (typed name)
- Application submitted to the rescue; they can Accept, Decline, or Request More Info
- Status workflow: `PENDING → UNDER_REVIEW → ACCEPTED | DECLINED`
- Stored in `applications` table with all fields

**Messaging (optional V2 feature)**
- In-app messaging thread between rescue and foster after a match is initiated
- Simple threaded messages stored in `messages` table

---

## 5. Database Schema (Core Tables)

```sql
-- Users (all roles)
users (id, email, password_hash, role, email_verified, created_at)

-- Foster Profiles
foster_profiles (
  id, user_id FK,
  full_name, phone, city, province, postal_code,
  home_setup JSONB,       -- dwelling type, fenced yard, children, other pets
  preferences JSONB,      -- species, size, age, special needs
  available_from DATE,
  available_until DATE,
  reminder_frequency,     -- 'weekly' | 'monthly' | 'custom'
  reminder_next_send DATE,
  profile_complete BOOLEAN
)

-- Rescue Profiles
rescue_profiles (
  id, user_id FK,
  org_name, phone, city, province, website,
  logo_url, contact_email, address
)

-- Pets
pets (
  id, rescue_id FK,
  name, species, breed, age_years, sex, weight_kg,
  house_trained, spayed_neutered, microchipped, vaccinated,
  good_with_kids, good_with_dogs, good_with_cats,
  special_needs TEXT,
  bio TEXT,
  available_from DATE,
  urgent_by DATE,
  city, province,
  status  -- 'AVAILABLE' | 'IN_FOSTER' | 'ADOPTED' | 'INACTIVE'
)

-- Pet Photos
pet_photos (id, pet_id FK, url, is_primary, uploaded_at)

-- Foster Requests (foster initiates)
foster_requests (
  id, foster_id FK, pet_id FK,
  message TEXT,
  status  -- 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DECLINED'
  created_at, updated_at
)

-- Rescue Outreach (rescue initiates)
rescue_outreach (
  id, rescue_id FK, foster_id FK, pet_id FK,
  message TEXT,
  status  -- 'SENT' | 'VIEWED' | 'RESPONDED'
  created_at
)

-- Applications (formal foster application)
applications (
  id, foster_id FK, pet_id FK, rescue_id FK,
  motivation TEXT,
  daily_schedule TEXT,
  vet_reference JSONB,
  personal_reference JSONB,
  agreed_to_terms BOOLEAN,
  signature TEXT,
  status  -- 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DECLINED'
  created_at, reviewed_at
)
```

---

## 6. Page Structure & Routes

| Route | Description | Accessible By |
|---|---|---|
| `/` | Homepage / marketing landing page | Public |
| `/register` | Choose role: Foster or Rescue | Public |
| `/register/foster` | Foster sign-up form | Public |
| `/register/rescue` | Rescue sign-up form | Public |
| `/login` | Login page | Public |
| `/pets` | Browse pets available for fostering | Foster (logged in) |
| `/pets/[id]` | Individual pet detail + "I'm Interested" CTA | Foster |
| `/fosters` | Browse available foster profiles | Rescue (logged in) |
| `/fosters/[id]` | Individual foster profile + "Reach Out" CTA | Rescue |
| `/dashboard/foster` | Foster dashboard: profile, requests, applications | Foster |
| `/dashboard/foster/profile` | Edit foster profile | Foster |
| `/dashboard/foster/applications` | Track application statuses | Foster |
| `/dashboard/rescue` | Rescue dashboard: pets, requests, applications | Rescue |
| `/dashboard/rescue/pets` | Manage posted pets | Rescue |
| `/dashboard/rescue/pets/new` | Post a new pet | Rescue |
| `/dashboard/rescue/requests` | View incoming foster requests | Rescue |
| `/dashboard/rescue/applications` | Review foster applications | Rescue |
| `/apply/[pet_id]` | Formal foster application form | Foster |
| `/admin` | Admin panel: moderation, user management | Admin |

---

## 7. Implementation Phases

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Project scaffolding (Next.js, Tailwind, Prisma, PostgreSQL)
- [ ] Authentication: registration, login, email verification, role assignment
- [ ] Foster registration form + profile storage
- [ ] Rescue registration form + profile storage
- [ ] Basic navigation and layout (header, footer, dashboards shells)

### Phase 2 — Core Features (Weeks 4–6)
- [ ] Pet posting flow (multi-step form + photo uploads)
- [ ] Pet browse page with search & filters
- [ ] Pet detail page
- [ ] Foster profile browse page (for rescues)
- [ ] Foster profile detail page

### Phase 3 — Matching & Applications (Weeks 7–9)
- [ ] Foster "I'm Interested" request flow
- [ ] Rescue "Reach Out to Foster" flow
- [ ] Email notifications for both flows (Resend/SendGrid)
- [ ] Formal application form (foster → rescue)
- [ ] Application status tracking (foster dashboard)
- [ ] Application review & status update (rescue dashboard)

### Phase 4 — Reminders & Polish (Weeks 10–11)
- [ ] Availability reminder system (cron job + email)
- [ ] Reminder frequency settings in foster profile
- [ ] Responsive mobile design review
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Error states, empty states, loading states

### Phase 5 — Testing & Launch (Week 12)
- [ ] End-to-end testing (Playwright or Cypress)
- [ ] Unit tests for critical API routes
- [ ] Staging environment QA
- [ ] Production deploy
- [ ] Analytics setup (PostHog or Plausible)

---

## 8. Key Design Considerations

- **Privacy First:** Foster home addresses and personal contact details are never shown publicly. Contact is brokered through the platform.
- **Profile Completeness Gate:** Fosters cannot send a request until their profile is at least 80% complete — prompt them with a checklist.
- **Mobile Responsive:** Many users will browse on phones; pet cards and application flows must work well on small screens.
- **Trust Signals:** Show rescue organization verification badges; display number of successful fosters.
- **Accessibility:** All forms must be keyboard-navigable with proper ARIA labels; images require alt text.

---

## 9. Future Enhancements (V2+)

- In-app messaging between fosters and rescues
- Foster reviews / reputation system
- Automated pet-to-foster compatibility matching algorithm
- Calendar integration for availability syncing
- Native mobile app (React Native)
- SMS reminders (Twilio) in addition to email
- Donation / fundraising features for rescues
- Foster success stories / blog

---

*Implementation Plan — Foster A Wag | Prepared June 2026*
