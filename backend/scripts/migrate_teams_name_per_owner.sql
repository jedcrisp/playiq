-- One-time migration: team names were globally unique; they should be unique per owner only.
-- Run against production Postgres (Railway → Postgres → Query, or psql) BEFORE or RIGHT AFTER
-- deploying the API that expects uq_team_owner_name.
--
-- 1) Drop the old single-column unique constraint on teams.name (PostgreSQL default name).
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_name_key;

-- If that fails, list constraints on teams and drop the one enforcing uniqueness on name:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.teams'::regclass;

-- 2) Enforce uniqueness per owner (matches SQLAlchemy Team.__table_args__).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_team_owner_name'
  ) THEN
    ALTER TABLE teams
      ADD CONSTRAINT uq_team_owner_name UNIQUE (owner_user_id, name);
  END IF;
END $$;
