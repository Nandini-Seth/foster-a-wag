-- Initial schema, ported from the SQLite definition that used to live in lib/db.ts.
--
-- Translation notes:
--   TEXT PRIMARY KEY  -> uuid          (ids were already uuidv4 strings)
--   INTEGER 0/1       -> boolean       (admin_verified stays integer: it is tri-state -1/0/1)
--   TEXT dates        -> date          (returned as YYYY-MM-DD strings, see lib/db.ts)
--   TEXT json         -> jsonb         (pg parses these on read, so no JSON.parse in routes)
--   datetime('now')   -> now()

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY,
  email          text UNIQUE NOT NULL,
  password_hash  text NOT NULL,
  role           text NOT NULL CHECK (role IN ('FOSTER', 'RESCUE', 'ADMIN')),
  email_verified boolean NOT NULL DEFAULT false,
  -- Tri-state moderation flag: -1 rejected, 0 pending, 1 verified.
  admin_verified integer NOT NULL DEFAULT 0 CHECK (admin_verified IN (-1, 0, 1)),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS foster_profiles (
  id                 uuid PRIMARY KEY,
  user_id            uuid NOT NULL UNIQUE REFERENCES users(id),
  full_name          text,
  phone              text,
  city               text,
  province           text,
  postal_code        text,
  dwelling_type      text,
  fenced_backyard    boolean NOT NULL DEFAULT false,
  num_adults         integer NOT NULL DEFAULT 1,
  num_children       integer NOT NULL DEFAULT 0,
  other_pets         jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferences        jsonb NOT NULL DEFAULT '{}'::jsonb,
  available_from     date,
  available_until    date,
  reminder_frequency text NOT NULL DEFAULT 'monthly',
  profile_complete   boolean NOT NULL DEFAULT false,
  photo_url          text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rescue_profiles (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL UNIQUE REFERENCES users(id),
  org_name      text,
  phone         text,
  city          text,
  province      text,
  website       text,
  contact_email text,
  address       text,
  logo_url      text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pets (
  id              uuid PRIMARY KEY,
  rescue_id       uuid NOT NULL REFERENCES rescue_profiles(id),
  name            text NOT NULL,
  species         text NOT NULL,
  breed           text,
  age_years       numeric,
  sex             text,
  weight_kg       numeric,
  house_trained   boolean NOT NULL DEFAULT false,
  spayed_neutered boolean NOT NULL DEFAULT false,
  microchipped    boolean NOT NULL DEFAULT false,
  vaccinated      boolean NOT NULL DEFAULT false,
  good_with_kids  boolean NOT NULL DEFAULT true,
  good_with_dogs  boolean NOT NULL DEFAULT true,
  good_with_cats  boolean NOT NULL DEFAULT true,
  special_needs   text,
  bio             text,
  available_from  date,
  urgent_by       date,
  city            text,
  province        text,
  status          text NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE', 'IN_FOSTER', 'ADOPTED', 'INACTIVE')),
  primary_photo   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS foster_requests (
  id         uuid PRIMARY KEY,
  foster_id  uuid NOT NULL REFERENCES foster_profiles(id),
  pet_id     uuid NOT NULL REFERENCES pets(id),
  message    text,
  status     text NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id                 uuid PRIMARY KEY,
  foster_id          uuid NOT NULL REFERENCES foster_profiles(id),
  pet_id             uuid NOT NULL REFERENCES pets(id),
  rescue_id          uuid NOT NULL REFERENCES rescue_profiles(id),
  motivation         text,
  daily_schedule     text,
  vet_ref_name       text,
  vet_ref_phone      text,
  personal_ref_name  text,
  personal_ref_phone text,
  agreed_to_terms    boolean NOT NULL DEFAULT false,
  signature          text,
  status             text NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED')),
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- The routes already check for duplicates before inserting; these enforce it at the
-- database level so a double-submit cannot slip two rows through.
CREATE UNIQUE INDEX IF NOT EXISTS foster_requests_foster_pet_key ON foster_requests (foster_id, pet_id);
CREATE UNIQUE INDEX IF NOT EXISTS applications_foster_pet_key ON applications (foster_id, pet_id);

-- Indexes covering the filters the browse and dashboard queries actually use.
CREATE INDEX IF NOT EXISTS pets_status_created_idx ON pets (status, created_at DESC);
CREATE INDEX IF NOT EXISTS pets_rescue_idx ON pets (rescue_id);
CREATE INDEX IF NOT EXISTS foster_requests_pet_idx ON foster_requests (pet_id);
CREATE INDEX IF NOT EXISTS applications_rescue_idx ON applications (rescue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_foster_idx ON applications (foster_id, created_at DESC);
CREATE INDEX IF NOT EXISTS foster_profiles_complete_idx ON foster_profiles (profile_complete, available_from);
