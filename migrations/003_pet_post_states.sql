-- Pet posts get three states, replacing AVAILABLE / IN_FOSTER / ADOPTED / INACTIVE.
--
--   ACTIVE   visible to the public and to the owning rescue; accepting applications
--   PENDING  hidden from the public, visible and editable to the owning rescue —
--            used once a post has had enough applications
--   DELETED  hidden from the public; shown to the owning rescue greyed out and
--            not editable (a soft delete, so applications keep their pet row)
--
-- Everything that was not AVAILABLE becomes PENDING rather than DELETED: PENDING
-- stays editable, so no existing post silently becomes read-only.

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_status_check;

UPDATE pets SET status = CASE WHEN status = 'AVAILABLE' THEN 'ACTIVE' ELSE 'PENDING' END;

ALTER TABLE pets ALTER COLUMN status SET DEFAULT 'ACTIVE';

ALTER TABLE pets ADD CONSTRAINT pets_status_check
  CHECK (status IN ('ACTIVE', 'PENDING', 'DELETED'));

-- Records when a post was soft-deleted, so it can be ordered/purged later.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
UPDATE pets SET deleted_at = now() WHERE status = 'DELETED' AND deleted_at IS NULL;
