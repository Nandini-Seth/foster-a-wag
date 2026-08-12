-- Account approval workflow.
--
-- Registration no longer grants access. Every foster and rescue account moves
-- through a review sequence before it can sign in:
--
--   PENDING         signed up; nothing sent yet
--   INFO_REQUESTED  we emailed asking for verification / proof of legitimacy
--   INFO_RECEIVED   they replied; email confirmed and details collected
--   ACTIVE          approved and activated — the only state that can log in
--   REJECTED        declined
--
-- This replaces the admin_verified tri-state, which could not express the
-- difference between "not contacted yet" and "waiting on their reply".

ALTER TABLE users ADD COLUMN IF NOT EXISTS status text;

UPDATE users SET status = CASE
  WHEN admin_verified = 1  THEN 'ACTIVE'
  WHEN admin_verified = -1 THEN 'REJECTED'
  ELSE 'PENDING'
END
WHERE status IS NULL;

-- Admins are created by the create-admin script and are active by definition.
UPDATE users SET status = 'ACTIVE' WHERE role = 'ADMIN';

ALTER TABLE users ALTER COLUMN status SET NOT NULL;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('PENDING', 'INFO_REQUESTED', 'INFO_RECEIVED', 'ACTIVE', 'REJECTED'));

-- Timestamps for the two steps that are currently handled out of band, so the
-- admin list can show how long an applicant has been waiting.
ALTER TABLE users ADD COLUMN IF NOT EXISTS info_requested_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activated_at timestamptz;

UPDATE users SET activated_at = created_at WHERE status = 'ACTIVE' AND activated_at IS NULL;

ALTER TABLE users DROP COLUMN IF EXISTS admin_verified;

CREATE INDEX IF NOT EXISTS users_status_idx ON users (status, created_at DESC);
