// Authenticated (and, for the contact form, deliberately public) server
// functions that send a transactional email for one specific, server-
// verified event. Same shape as push.functions.ts: a function re-derives
// its own data server-side rather than trusting client-supplied content
// for anything that matters (amounts, order ownership), and is called
// directly from client code right after the matching Supabase mutation
// succeeds.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AuthedContext = { supabase: SupabaseClient<Database>; userId: string; claims: Record<string, unknown> };

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

/**
 * Contact form (/metnu) auto-reply. Deliberately NOT behind
 * requireSupabaseAuth — the form itself is public (anon can insert into
 * contact_messages), so this mirrors that: anyone can trigger a confirmation
 * email, but only to the address they just typed into the form themselves,
 * with tightly bounded, validated content. Best-effort from the caller's
 * side (metnu.tsx never lets an email failure block the actual submission).
 */
export const sendContactConfirmation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(200),
    }),
  )
  .handler(async ({ data }) => {
    const { sendEmail, emailShell } = await import("@/lib/email.server");
    await sendEmail({
      to: data.email,
      subject: "Mesajınız alındı — Virgo Astrology",
      html: emailShell(
        "Mesajınız bizə çatdı",
        `<p>Salam ${data.name},</p>
         <p>Əlaqə formu vasitəsilə göndərdiyiniz mesajı aldıq. Komandamız 48 saat ərzində sizə geri dönəcək.</p>
         <p style="color:#a7a2c6;font-size:13px;">Bu, avtomatik göndərilən təsdiq mesajıdır.</p>`,
      ),
    });
    return { ok: true };
  });

/** Order owner only (RLS-scoped lookup): sends the confirmation email right after checkout. */
export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("shop_orders")
      .select("full_name, total_azn, address, phone, shop_order_items(product_name, quantity, unit_price_azn)")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw new Error("Sifariş tapılmadı");

    const email = (context.claims.email as string | undefined) ?? null;
    if (!email) return { ok: false, reason: "no-email" };

    const itemsHtml = (order.shop_order_items ?? [])
      .map((it) => `<tr><td style="padding:4px 0;">${it.quantity} × ${it.product_name}</td><td style="padding:4px 0;text-align:right;">${it.unit_price_azn * it.quantity} AZN</td></tr>`)
      .join("");

    const { sendEmail, emailShell } = await import("@/lib/email.server");
    await sendEmail({
      to: email,
      subject: "Sifarişiniz qəbul edildi — Virgo Astrology",
      html: emailShell(
        "Sifarişiniz qəbul edildi",
        `<p>Salam ${order.full_name},</p>
         <p>Sifarişiniz uğurla qeydə alındı və tezliklə hazırlanmağa başlayacaq.</p>
         <table width="100%" style="margin:16px 0;border-top:1px solid rgba(255,255,255,0.1);border-bottom:1px solid rgba(255,255,255,0.1);">
           ${itemsHtml}
         </table>
         <p><strong>Cəmi: ${order.total_azn} AZN</strong></p>
         <p style="color:#a7a2c6;font-size:13px;">Çatdırılma ünvanı: ${order.address}, ${order.phone}</p>
         <p style="color:#a7a2c6;font-size:13px;">Sifarişinizin statusunu "Sifarişlərim" bölməsindən izləyə bilərsiniz.</p>`,
      ),
    });
    return { ok: true };
  });

/** Admin-only: emails the buyer about their order's current status, alongside the push notification. */
export const sendOrderStatusEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);

    const { data: order, error } = await context.supabase
      .from("shop_orders")
      .select("user_id, status, full_name")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw new Error("Sifariş tapılmadı");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: buyer } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    const email = buyer?.user?.email;
    if (!email) return { ok: false, reason: "no-email" };

    const label = ORDER_STATUS_LABEL[order.status] ?? order.status;

    const { sendEmail, emailShell } = await import("@/lib/email.server");
    await sendEmail({
      to: email,
      subject: `Sifariş statusu: ${label} — Virgo Astrology`,
      html: emailShell(
        "Sifariş statusu yeniləndi",
        `<p>Salam ${order.full_name},</p>
         <p>Sifarişiniz <strong>"${label}"</strong> statusuna keçdi.</p>
         <p style="color:#a7a2c6;font-size:13px;">Ətraflı məlumat üçün "Sifarişlərim" bölməsinə baxın.</p>`,
      ),
    });
    return { ok: true };
  });
