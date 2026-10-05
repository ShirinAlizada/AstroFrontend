-- Basic abuse protection for the public contact form (public.contact_messages
-- allows anon INSERT with no auth at all — see 20261001000000_contact_messages.sql).
-- A per-email rate limit enforced here in the database catches any client
-- (form, script replay, curl) regardless of what wrote the insert; the
-- matching honeypot field is handled entirely client-side in metnu.tsx and
-- simply never calls insert when tripped.
--
-- SECURITY DEFINER is required: anon only has INSERT on contact_messages
-- (no SELECT, and the SELECT policy is admin-only), so a plain trigger
-- function would see zero rows under anon's RLS and the limit would never
-- trigger.
CREATE OR REPLACE FUNCTION public.check_contact_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.contact_messages
  WHERE lower(email) = lower(NEW.email)
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Çox sayda mesaj göndərilib, zəhmət olmasa bir saat sonra yenidən cəhd edin.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contact_message_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.check_contact_message_rate_limit();
