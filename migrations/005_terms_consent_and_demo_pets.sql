-- Two unrelated additions that ship together.

-- 1. Record acceptance of the Terms of Service and Privacy Policy.
--
-- The Privacy Policy states that creating an account is how a person consents to
-- us collecting their information. A consent we cannot evidence is not much of a
-- consent, so the timestamp is stored rather than just gating the form.
--
-- Existing accounts predate the checkbox and are left NULL rather than
-- backfilled: recording a consent nobody gave would be worse than recording none.
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- 2. Flag every pet currently on the site as sample data.
--
-- Everything posted so far is seeded or test content. Marking it explicitly stops
-- a visitor mistaking a demo animal for one that actually needs a home — and
-- stops a foster applying for a dog that does not exist.
--
-- Anything posted from here defaults to false, so real listings need no action.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

UPDATE pets SET is_demo = true;
