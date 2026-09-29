-- Ensures shirinma@code.edu.az has the super_admin role. The original grant
-- in 20260919190100_super_admin_setup.sql only takes effect if that account
-- already existed in auth.users at the time that migration ran — if the
-- account was created afterwards, the INSERT there silently matched zero
-- rows. Re-running the same grant here is safe either way:
--   - UNIQUE (user_id, role) + ON CONFLICT DO NOTHING makes it a no-op if
--     the row is already there.
--   - If the account still doesn't exist yet, the SELECT matches zero rows
--     and nothing happens (sign up first, then re-run this migration).
--
-- super_admin already unlocks the full "Users" tab in /admin: list all
-- accounts, create new ones, delete accounts, and grant/revoke roles
-- (super_admin / admin / astrologer) — see src/lib/admin-users.functions.ts
-- and the UsersTab component in src/routes/_authenticated/admin.tsx. No
-- code changes are needed for that; this migration just grants the role.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE lower(email) = lower('shirinma@code.edu.az')
ON CONFLICT DO NOTHING;
