-- House training and compatibility become three-valued.
--
-- A boolean forced rescues to assert something they often do not know. "Good
-- with cats: false" and "we have never tested him with cats" are different
-- claims, and a foster deciding whether to take an animal needs to tell them
-- apart. House training gets its own third value because "working on it" is the
-- common real answer for a young or newly surrendered animal.
--
--   house_trained    YES | NO | WORKING_ON_IT
--   good_with_*      YES | NO | UNKNOWN
--
-- Existing booleans map straight across: true -> YES, false -> NO. Nothing is
-- guessed as UNKNOWN, because the old data really did assert a value.

ALTER TABLE pets ALTER COLUMN house_trained DROP DEFAULT;
ALTER TABLE pets
  ALTER COLUMN house_trained TYPE text
  USING CASE WHEN house_trained THEN 'YES' ELSE 'NO' END;
ALTER TABLE pets ALTER COLUMN house_trained SET DEFAULT 'UNKNOWN';

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_house_trained_check;
ALTER TABLE pets ADD CONSTRAINT pets_house_trained_check
  CHECK (house_trained IN ('YES', 'NO', 'WORKING_ON_IT', 'UNKNOWN'));

DO $$
DECLARE col text;
BEGIN
  FOREACH col IN ARRAY ARRAY['good_with_kids', 'good_with_dogs', 'good_with_cats'] LOOP
    EXECUTE format('ALTER TABLE pets ALTER COLUMN %I DROP DEFAULT', col);
    EXECUTE format(
      'ALTER TABLE pets ALTER COLUMN %I TYPE text USING CASE WHEN %I THEN ''YES'' ELSE ''NO'' END',
      col, col);
    EXECUTE format('ALTER TABLE pets ALTER COLUMN %I SET DEFAULT ''UNKNOWN''', col);
    EXECUTE format('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_%s_check', col);
    EXECUTE format(
      'ALTER TABLE pets ADD CONSTRAINT pets_%s_check CHECK (%I IN (''YES'', ''NO'', ''UNKNOWN''))',
      col, col);
  END LOOP;
END $$;

-- Microchipping is a detail the rescue handles before placement; it does not
-- inform a foster's decision, and it was cluttering the posting form.
ALTER TABLE pets DROP COLUMN IF EXISTS microchipped;

-- The browse filters select on 'YES' only.
CREATE INDEX IF NOT EXISTS pets_compat_idx
  ON pets (good_with_kids, good_with_dogs, good_with_cats);
