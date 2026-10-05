// Abunəlik/ödəniş sisteminin data qatı: paketlər, istifadəçinin cari abunəliyi
// və (hələlik demo/mock) ödəniş axını. Real ödəniş provayderi (Stripe, yerli
// bank gateway və s.) qoşulanda yalnız `mockPurchase`-in içi dəyişəcək —
// çağıran tərəf (paketlər səhifəsi) və verilənlər bazası sxemi eyni qalır.
import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "@/lib/i18n/translations";

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
  billingPeriod: "monthly" | "yearly";
}

/** İllik ödəniş seçəndə tətbiq olunan endirim faizi (demo — backend-də saxlanmır). */
export const ANNUAL_DISCOUNT_PCT = 20;

/** 12 aylıq məbləğ üzərindən illik endirimli qiymət (yuxarı yuvarlanmadan, tam ədədə). */
export function annualPriceAzn(monthlyPriceAzn: number): number {
  return Math.round(monthlyPriceAzn * 12 * (1 - ANNUAL_DISCOUNT_PCT / 100));
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

/**
 * Paket tagline/features sətirləri Supabase-də (subscription_plans cədvəli)
 * yalnız Azərbaycan dilində saxlanılır (bax: 20260929163500_...sql seed-i).
 * Kataloq kiçik və nadir dəyişdiyi üçün tam DB-səviyyəli i18n (shop_products-da
 * olduğu kimi name_en/name_ru sütunları) əvəzinə yüngül frontend lüğəti —
 * digər displey-qatı funksiyaları ilə eyni nümunə (bax: localizedDayColor,
 * localizedElementName). Lüğətdə olmayan (admin tərəfindən sonradan əlavə
 * olunmuş) sətirlər sadəcə orijinal Azərbaycan mətni ilə geri qayıdır.
 */
const PLAN_TAGLINE_TRANSLATIONS: Record<string, Record<Lang, string>> = {
  "Əsas astroloji vasitələrə tam giriş": {
    az: "Əsas astroloji vasitələrə tam giriş",
    en: "Full access to the essential astrology tools",
    ru: "Полный доступ к основным астрологическим инструментам",
  },
  "Ən dərin təhlillər və limitsiz AI dəstəyi": {
    az: "Ən dərin təhlillər və limitsiz AI dəstəyi",
    en: "The deepest insights and unlimited AI support",
    ru: "Самые глубокие разборы и неограниченная поддержка AI",
  },
};

export function localizedPlanTagline(taglineAz: string | null, lang: Lang): string | null {
  if (!taglineAz) return taglineAz;
  return PLAN_TAGLINE_TRANSLATIONS[taglineAz]?.[lang] ?? taglineAz;
}

const PLAN_FEATURE_TRANSLATIONS: Record<string, Record<Lang, string>> = {
  "Tam natal xəritə təkəri (planet, ev və aspekt təfərrüatları)": {
    az: "Tam natal xəritə təkəri (planet, ev və aspekt təfərrüatları)",
    en: "Full natal chart wheel (planet, house and aspect details)",
    ru: "Полное колесо натальной карты (планеты, дома и аспекты)",
  },
  "Uyğunluq (sinastriya) — planet-planet detallı təhlil": {
    az: "Uyğunluq (sinastriya) — planet-planet detallı təhlil",
    en: "Compatibility (synastry) — detailed planet-to-planet analysis",
    ru: "Совместимость (синастрия) — детальный анализ планета-планета",
  },
  "Gündəlik, həftəlik və aylıq horoskop": {
    az: "Gündəlik, həftəlik və aylıq horoskop",
    en: "Daily, weekly and monthly horoscope",
    ru: "Ежедневный, еженедельный и ежемесячный гороскоп",
  },
  "Numerologiya hesablamaları": {
    az: "Numerologiya hesablamaları",
    en: "Numerology calculations",
    ru: "Нумерологические расчёты",
  },
  // "Günün Bələdçisi" səhifəsi artıq Vedik Panchang sistemi əsasında deyil, tam
  // Qərb astrologiyasına əsaslanır (bax: daily-guide.ts) — DB-dəki köhnə
  // "(Panchang)" qeydi 20261003120000_rename_daily_guide_feature.sql
  // miqrasiyası tətbiq olunana qədər qala bilər, ona görə hər iki variant
  // (köhnə və yeni mətn) eyni, yenilənmiş EN/RU tərcüməyə yönləndirilir.
  "Günün bələdçisi (Panchang)": {
    az: "Günün bələdçisi (Panchang)",
    en: "Daily guide",
    ru: "Гид дня",
  },
  "Günün bələdçisi": {
    az: "Günün bələdçisi",
    en: "Daily guide",
    ru: "Гид дня",
  },
  "AI Astroloq söhbəti — gündə 15 mesaj": {
    az: "AI Astroloq söhbəti — gündə 15 mesaj",
    en: "AI Astrologer chat — 15 messages a day",
    ru: "Чат с AI-астрологом — 15 сообщений в день",
  },
  "Jurnal — limitsiz qeyd": {
    az: "Jurnal — limitsiz qeyd",
    en: "Journal — unlimited entries",
    ru: "Журнал — неограниченные записи",
  },
  "Astroloqlarla rezervasiya": {
    az: "Astroloqlarla rezervasiya",
    en: "Booking with astrologers",
    ru: "Запись к астрологам",
  },
  "Standart paketin bütün imkanları": {
    az: "Standart paketin bütün imkanları",
    en: "Everything in the Standard plan",
    ru: "Все возможности пакета Standard",
  },
  "AI Astroloq söhbəti — limitsiz mesaj": {
    az: "AI Astroloq söhbəti — limitsiz mesaj",
    en: "AI Astrologer chat — unlimited messages",
    ru: "Чат с AI-астрологом — неограниченные сообщения",
  },
  "Astroloq rezervasiyalarında 15% endirim": {
    az: "Astroloq rezervasiyalarında 15% endirim",
    en: "15% discount on astrologer bookings",
    ru: "Скидка 15% на запись к астрологам",
  },
  "Yeni məqalələrə prioritet giriş": {
    az: "Yeni məqalələrə prioritet giriş",
    en: "Priority access to new articles",
    ru: "Приоритетный доступ к новым статьям",
  },
  "Prioritet dəstək": {
    az: "Prioritet dəstək",
    en: "Priority support",
    ru: "Приоритетная поддержка",
  },
};

export function localizedPlanFeature(featureAz: string, lang: Lang): string {
  return PLAN_FEATURE_TRANSLATIONS[featureAz]?.[lang] ?? featureAz;
}

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
    .select("plan_key, status, started_at, current_period_end, billing_period")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    planKey: data.plan_key as PlanKey,
    status: data.status as UserSubscription["status"],
    startedAt: data.started_at,
    currentPeriodEnd: data.current_period_end,
    billingPeriod: (data.billing_period as UserSubscription["billingPeriod"]) ?? "monthly",
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
export async function mockPurchase(
  userId: string,
  plan: SubscriptionPlan,
  billingPeriod: "monthly" | "yearly" = "monthly",
): Promise<void> {
  if (plan.key === "pulsuz") return;

  const amountAzn = billingPeriod === "yearly" ? annualPriceAzn(plan.priceAzn) : plan.priceAzn;

  const { error: txError } = await supabase.from("payment_transactions").insert({
    user_id: userId,
    plan_key: plan.key,
    amount_azn: amountAzn,
    provider: "mock",
    status: "succeeded",
    note: "Demo ödəniş axını — real pul köçürülməyib.",
    billing_period: billingPeriod,
  });
  if (txError) throw txError;

  const periodDays = billingPeriod === "yearly" ? 365 : 30;
  const periodEnd = new Date(Date.now() + periodDays * MS_IN_DAY).toISOString();
  const { error: subError } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan_key: plan.key,
      status: "active",
      started_at: new Date().toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      billing_period: billingPeriod,
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

export interface PaymentRecord {
  id: string;
  planKey: PlanKey;
  amountAzn: number;
  provider: string;
  status: "succeeded" | "failed" | "refunded";
  note: string | null;
  billingPeriod: "monthly" | "yearly";
  createdAt: string;
}

/** İstifadəçinin bütün ödəniş qəbzləri (ən yenidən köhnəyə) — Ödənişlərim səhifəsi üçün. */
export async function fetchMyPayments(userId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("id, plan_key, amount_azn, provider, status, note, billing_period, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    planKey: r.plan_key as PlanKey,
    amountAzn: r.amount_azn,
    provider: r.provider,
    status: r.status as PaymentRecord["status"],
    note: r.note,
    billingPeriod: (r.billing_period as PaymentRecord["billingPeriod"]) ?? "monthly",
    createdAt: r.created_at,
  }));
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
