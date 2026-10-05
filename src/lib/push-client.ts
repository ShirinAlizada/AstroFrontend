// Client-side Web Push helpers: register the service worker, ask for
// permission, subscribe/unsubscribe, and persist the subscription into
// Supabase (push_subscriptions) so the server can send to it later.
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env["VITE_VAPID_PUBLIC_KEY"] as string | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js");
}

/** Returns the browser's current push subscription, if any (does not prompt). */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Requests notification permission (if needed), subscribes this browser to
 * push, and saves the subscription for `userId` in push_subscriptions.
 * Throws if the browser doesn't support push or the VAPID public key isn't
 * configured.
 */
export async function subscribeToPush(userId: string): Promise<void> {
  if (!isPushSupported()) throw new Error("Bu brauzer push bildirişləri dəstəkləmir.");
  if (!VAPID_PUBLIC_KEY) throw new Error("VITE_VAPID_PUBLIC_KEY konfiqurasiya edilməyib.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Bildiriş icazəsi verilmədi.");

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const authKey = json.keys?.auth;
  if (!json.endpoint || !p256dh || !authKey) {
    throw new Error("Push abunəliyi yaradıla bilmədi.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: userId, endpoint: json.endpoint, p256dh, auth_key: authKey },
    { onConflict: "user_id,endpoint" },
  );
  if (error) throw error;
}

/** Unsubscribes this browser from push and removes the row from Supabase. */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  const subscription = await getExistingSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);
  if (error) throw error;
}
