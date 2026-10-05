// Server-only Web Push sender. Never imported at the top level of a route
// file or a *.functions.ts module (those ship to the client bundle) —
// always `await import("@/lib/push.server")` from inside a server handler,
// the same convention used for client.server.ts elsewhere in this app.
import webpush from "web-push";

export interface PushPayload {
  title: string;
  body: string;
  link?: string;
}

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = process.env["VAPID_PUBLIC_KEY"];
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const subject = process.env["VAPID_SUBJECT"];

  if (!publicKey || !privateKey || !subject) {
    const missing = [
      ...(!publicKey ? ["VAPID_PUBLIC_KEY"] : []),
      ...(!privateKey ? ["VAPID_PRIVATE_KEY"] : []),
      ...(!subject ? ["VAPID_SUBJECT"] : []),
    ];
    throw new Error(`Missing push env variable(s): ${missing.join(", ")}`);
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

/**
 * Sends a push notification to every subscription on file for `userId`.
 * Subscriptions the push service reports as gone (404/410 — the browser
 * revoked or expired them) are pruned automatically. Never throws for an
 * individual failed subscription; only throws if VAPID isn't configured or
 * the subscriptions table can't be read.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number }> {
  ensureConfigured();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!subs || subs.length === 0) return { sent: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    link: payload.link ?? "/",
  });

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          body,
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription no longer exists on the push service — prune it.
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("[push] sendNotification failed", statusCode, err);
        }
      }
    }),
  );

  return { sent };
}
