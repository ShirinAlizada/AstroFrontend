-- Adds the super_admin role. Must run in its own transaction, before the
-- migration that uses the new enum value (Postgres cannot use a new enum
-- value in the same transaction that adds it).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
