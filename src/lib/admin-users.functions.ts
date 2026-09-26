// Server functions for the admin panel's user management: listing accounts,
// creating/deleting them, and granting/revoking roles. These run only on the
// server (service-role Supabase client), never in the browser bundle, and
// every one of them re-checks the caller's role itself — the UI hiding a
// button is not access control.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ASSIGNABLE_ROLES = ["super_admin", "admin", "astrologer", "user"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

type AuthedContext = { supabase: SupabaseClient<Database>; userId: string };

async function requireAdmin(ctx: AuthedContext) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Bu əməliyyat üçün icazəniz yoxdur");
}

async function requireSuperAdmin(ctx: AuthedContext) {
  const { data, error } = await ctx.supabase.rpc("is_super_admin", {
    _user_id: ctx.userId,
  });
  if (error || !data) throw new Error("Bu əməliyyat yalnız super admin üçündür");
}

// Row shape returned by the admin_list_users() SECURITY DEFINER RPC. Not yet
// in the generated Database types (regenerate types after applying the
// migration to pick this up properly) — cast context.supabase locally so we
// don't have to `any` the whole client.
type AdminListUsersRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
};

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);

    // Uses the admin_list_users() SECURITY DEFINER RPC instead of the
    // service-role client, so this works without SUPABASE_SERVICE_ROLE_KEY
    // being set. The RPC itself re-checks the caller's admin role.
    const { data, error } = await (
      context.supabase as unknown as {
        rpc: (fn: "admin_list_users") => Promise<{
          data: AdminListUsersRow[] | null;
          error: { message: string } | null;
        }>;
      }
    ).rpc("admin_list_users");
    if (error) throw new Error(error.message);

    return (data ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: u.full_name,
      created_at: u.created_at,
      roles: u.roles ?? [],
    }));
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      role: z.enum(ASSIGNABLE_ROLES),
      grant: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (data.role === "super_admin") {
      if (data.userId === context.userId) {
        throw new Error("Öz super admin rolunuzu özünüzdən ala bilməzsiniz");
      }
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin");
      if ((count ?? 0) <= 1) {
        throw new Error("Sonuncu super admin silinə bilməz");
      }
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      email: z.string().trim().toLowerCase().email().max(255),
      password: z.string().min(6).max(72),
      full_name: z.string().trim().max(80).optional(),
      role: z.enum(ASSIGNABLE_ROLES),
    }),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.full_name ? { full_name: data.full_name } : undefined,
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "İstifadəçi yaradıla bilmədi");
    }

    if (data.role !== "user") {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: created.user.id, role: data.role }, { onConflict: "user_id,role" });
      if (roleError) throw new Error(roleError.message);
    }

    return { ok: true, id: created.user.id };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    if (data.userId === context.userId) {
      throw new Error("Öz hesabınızı bu paneldən silə bilməzsiniz");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", data.userId)
      .eq("role", "super_admin");
    if ((count ?? 0) > 0) {
      throw new Error("Başqa bir super adminin hesabı bu paneldən silinə bilməz");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type { AssignableRole };
