-- super_admin can do everything an admin can (has_role('admin', ...) now
-- also matches a super_admin row), plus manage user accounts and roles.
-- Only super_admin may create/delete accounts or change roles, and that
-- only happens through server functions using the service-role client, so
-- the "Admins manage roles" self-service policy is removed rather than
-- widened.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (_role = 'admin' AND role = 'super_admin'))
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Role changes now go only through server functions (service role, bypasses
-- RLS), never straight from the browser.
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

-- Let a user account be deleted even if they have chat history or wrote
-- articles, instead of the delete failing on a foreign key.
ALTER TABLE public.chat_threads
  DROP CONSTRAINT IF EXISTS chat_threads_user_id_fkey,
  ADD CONSTRAINT chat_threads_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey,
  ADD CONSTRAINT chat_messages_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_author_id_fkey,
  ADD CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Grant the initial roles. Both accounts must already exist (sign up first);
-- rows are skipped silently for an email that hasn't registered yet.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE lower(email) = lower('shirinma@code.edu.az')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = lower('shirin.elizade127@gmail.com')
ON CONFLICT DO NOTHING;
