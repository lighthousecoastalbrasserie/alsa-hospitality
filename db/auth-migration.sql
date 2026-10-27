-- Run after db/schema.sql, once.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_open ON employee_invitations(email) WHERE accepted_at IS NULL;
