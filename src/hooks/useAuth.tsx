import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, loading };
}

export function useRoles(userId: string | undefined) {
  const [roles, setRoles] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) {
      setRoles([]);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => setRoles((data ?? []).map((r) => r.role)));
  }, [userId]);
  return roles;
}

/** True for "admin" and "super_admin" — super_admin can do everything an admin can. */
export function useIsAdmin(userId: string | undefined) {
  const roles = useRoles(userId);
  return roles.includes("admin") || roles.includes("super_admin");
}

/** True only for "super_admin" — manages user accounts and roles. */
export function useIsSuperAdmin(userId: string | undefined) {
  return useRoles(userId).includes("super_admin");
}
