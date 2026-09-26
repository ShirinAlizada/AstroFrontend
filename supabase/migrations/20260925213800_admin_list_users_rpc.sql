-- Lets the admin panel list users WITHOUT needing SUPABASE_SERVICE_ROLE_KEY
-- in the client/server env. Runs as SECURITY DEFINER (elevated), but checks
-- the caller's admin role itself before returning anything.
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Bu əməliyyat üçün icazəniz yoxdur';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    p.full_name,
    u.created_at,
    COALESCE(array_agg(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL), '{}')
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  GROUP BY u.id, u.email, p.full_name, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
