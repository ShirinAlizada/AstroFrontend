// Authenticated server functions that trigger a Web Push notification for a
// specific, server-verified event. Deliberately NOT a generic "push anything
// to any userId" endpoint — each function re-derives the target user and
// the message server-side instead of trusting client input, the same way
// admin-users.functions.ts re-checks the caller's role rather than trusting
// the UI. Called directly from client code right after the matching
// Supabase mutation succeeds (order status change, forum reply).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AuthedContext = { supabase: SupabaseClient<Database>; userId: string };

async function requireAdmin(ctx: AuthedContext) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Bu əməliyyat üçün icazəniz yoxdur");
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  yeni: "Yeni",
  tesdiqlenib: "Təsdiqləndi",
  gonderilib: "Göndərildi",
  legv_edilib: "Ləğv edildi",
};

/** Admin-only: push the buyer a notification about their order's current status. */
export const pushOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);

    const { data: order, error } = await context.supabase
      .from("shop_orders")
      .select("user_id, status")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw new Error("Sifariş tapılmadı");

    const label = ORDER_STATUS_LABEL[order.status] ?? order.status;

    const { sendPushToUser } = await import("@/lib/push.server");
    return sendPushToUser(order.user_id, {
      title: "Sifariş statusu yeniləndi",
      body: `Sifarişiniz "${label}" statusuna keçdi.`,
      link: "/sifarislerim",
    });
  });

/** Push the topic owner a notification about a new reply. No-ops quietly if the topic can't be read or the author is replying to their own topic. */
export const pushForumReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      topicId: z.string().uuid(),
      authorName: z.string().trim().min(1).max(120),
      preview: z.string().trim().min(1).max(200),
    }),
  )
  .handler(async ({ data, context }) => {
    const { data: topic, error } = await context.supabase
      .from("forum_topics")
      .select("user_id")
      .eq("id", data.topicId)
      .single();
    if (error || !topic?.user_id || topic.user_id === context.userId) {
      return { sent: 0 };
    }

    const { sendPushToUser } = await import("@/lib/push.server");
    return sendPushToUser(topic.user_id, {
      title: "Mövzuna yeni cavab",
      body: `${data.authorName}: ${data.preview}`,
      link: `/forum/${data.topicId}`,
    });
  });
