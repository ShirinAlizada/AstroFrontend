// Abunəlik/ödəniş sisteminin data qatı: paketlər, istifadəçinin cari abunəliyi
// və (hələlik demo/mock) ödəniş axını. Real ödəniş provayderi (Stripe, yerli
// bank gateway və s.) qoşulanda yalnız `mockPurchase`-in içi dəyişəcək —
// çağıran tərəf (paketlər səhifəsi) və verilənlər bazası sxemi eyni qalır.
import { supabase } from "@/integrations/supabase/client";

export type PlanKey = "pulsuz" | "standart" | "premium";

export interface SubscriptionPlan {
  key: PlanKey;
  name: string;
  tagline: string | null;
  priceAzn: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  /** null = limitsiz */
  aiMessagesPerDay: number | null;
  synastryFullDetail: boolean;
  bookingDiscountPct: number;
}

export interface UserSubscription {
  planKey: PlanKey;
  status: "active" | "cancelled" | "expired";
  startedAt: string;
  currentPeriodEnd: string;
}

/** Heç bir ödənişli abunəliyi olmayan istifadəçi üçün defolt (DB-də sətri yoxdur). */
export const FREE_PLAN: SubscriptionPlan = {
  key: "pulsuz",
  name: "Pulsuz",
  tagline: null,
  priceAzn: 0,
  billingPeriod: "monthly",
  features: [],
  aiMessagesPerDay: 3,
  synastryFullDetail: false,
  bookingDiscountPct: 0,
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("key, name, tagline, price_azn, billing_period, features, ai_messages_per_day, synastry_full_detail, booking_discount_pct")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    key: p.key as PlanKey,
    name: p.name,
    tagline: p.tagline,
    priceAzn: p.price_azn,
    billingPeriod: p.billing_period as "monthly" | "yearly",
    features: p.features ?? [],
    aiMessagesPerDay: p.ai_messages_per_day,
    synastryFullDetail: p.synastry_full_detail,
    bookingDiscountPct: p.booking_discount_pct,
  }));
}

export async function fetchMySubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("plan_key, status, started_at, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    planKey: data.plan_key as PlanKey,
    status: data.status as UserSubscription["status"],
    startedAt: data.started_at,
    currentPeriodEnd: data.current_period_end,
  };
}

/** Abunəlik aktivdirsə və dövrü bitməyibsə uyğun paketi, əks halda Pulsuz paketi qaytarır. */
export function getEffectivePlan(plans: SubscriptionPlan[], subscription: UserSubscription | null): SubscriptionPlan {
  if (!subscription || subscription.status !== "active") return FREE_PLAN;
  if (new Date(subscription.currentPeriodEnd).getTime() <= Date.now()) return FREE_PLAN;
  return plans.find((p) => p.key === subscription.planKey) ?? FREE_PLAN;
}

/**
 * Demo/mock ödəniş: real kart əməliyyatı yoxdur — dərhal "uğurlu" sayılır,
 * jurnal qeydi (payment_transactions) yazılır və abunəlik 30 günlük dövrlə
 * aktivləşdirilir/yenilənir. Real provayder qoşulanda bu funksiyanın içi
 * webhook-təsdiqli axınla əvəz olunacaq, çağıran kod dəyişməyəcək.
 */
export async function mockPurchase(userId: string, plan: SubscriptionPlan): Promise<void> {
  if (plan.key === "pulsuz") return;

  const { error: txError } = await supabase.from("payment_transactions").insert({
    user_id: userId,
    plan_key: plan.key,
    amount_azn: plan.priceAzn,
    provider: "mock",
    status: "succeeded",
    note: "Demo ödəniş axını — real pul köçürülməyib.",
  });
  if (txError) throw txError;

  const periodEnd = new Date(Date.now() + 30 * MS_IN_DAY).toISOString();
  const { error: subError } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan_key: plan.key,
      status: "active",
      started_at: new Date().toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    },
    { onConflict: "user_id" },
  );
  if (subError) throw subError;
}

/** Abunəliyi dərhal ləğv edir (demo sistemdə dövr sonuna qədər gözləmə yoxdur). */
export async function cancelSubscription(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId);
  if (error) throw error;
}

/** İstifadəçinin bu gün göndərdiyi AI mesaj sayı (bütün söhbətlər üzrə, gündəlik limit üçün). */
export async function countTodayAiMessages(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", startOfDay.toISOString());
  if (error) throw error;
  return count ?? 0;
}
