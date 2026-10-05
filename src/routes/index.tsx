import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Check, Flame, Gem, ShoppingCart, Sparkles, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { CurrentPlanetsPanel } from "@/components/CurrentPlanetsPanel";
import { SIGN_SYMBOLS, DAY_RULERS_AZ, sunSignFromDate, localizedBodyName, localizedSignName } from "@/lib/astrology";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useMenu } from "@/hooks/useMenu";
import { useEffectivePlan, usePlans } from "@/hooks/useSubscription";
import { FREE_PLAN, localizedPlanFeature, type SubscriptionPlan } from "@/lib/subscription";
import { useShopProducts } from "@/hooks/useShop";
import { useCart } from "@/hooks/useCart";
import { localizedName, type ShopCategory } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virgo Astrology — natal xəritə və horoskop platforması" },
      { name: "description", content: "Doğum məlumatlarına əsasən natal xəritə, günlük horoskop, uyğunluq təhlili, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:title", content: "Virgo Astrology — Səmavi xəritən" },
      { property: "og:description", content: "Natal xəritə, horoskop, uyğunluq, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const { open: menuOpen } = useMenu();

  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased overflow-x-hidden">
      <SiteNav />

      <div
        className={`mx-auto max-w-7xl px-6 transition-all duration-200 ease-out ${
          menuOpen ? "-translate-x-8 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
      >
        <div className="min-w-0 flex-1">
          {/* HERO — bir dəfəlik, pilləli giriş animasiyası (hər bölmə üçün ayrıca
              scroll-reveal deyil, səhifə açılanda tək, idarə olunan bir ardıcıllıq). */}
          <div className="pt-4 pb-6">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              {t("home.hero_kicker")}
            </p>
            <h1 className="font-display leading-[0.95] text-5xl md:text-7xl max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100 fill-mode-both">
              {t("home.hero_title_1")} <span className="text-goldsoft italic">{t("home.hero_title_em")}</span>{" "}
              {t("home.hero_title_2")}
            </h1>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
              <DailyZodiacStrip />
            </div>

            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <CurrentPlanetsPanel />
            </div>
          </div>

          {/* COMPATIBILITY STRIP */}
          <div className="py-10">
            <div className="rounded-3xl border border-white/10 bg-ink2/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:flex-1">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">
                  {t("home.compat_kicker")}
                </p>
                <h2 className="font-display text-3xl">
                  {t("home.compat_title")}
                </h2>
                <p className="text-mist text-sm mt-2">
                  {t("home.compat_desc")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full grid place-items-center border border-violet/40 text-violet text-2xl">
                  ♓
                </div>
                <div className="size-16 rounded-full grid place-items-center border border-gold/40 text-goldsoft text-2xl">
                  ♌
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl text-gold">
                    88<span className="text-lg text-mist">%</span>
                  </div>
                  <div className="text-mist text-xs tracking-widest uppercase">
                    {t("home.compat_label")}
                  </div>
                </div>
              </div>
              <Link
                to="/uygunluq"
                className="md:ml-auto text-sm px-5 py-3 rounded-full bg-gold text-ink font-semibold hover:bg-goldsoft transition"
              >
                {t("home.compat_button")}
              </Link>
            </div>
          </div>

          {/* FEATURES */}
          <div className="py-6">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-4">{t("home.platform_kicker")}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { to: "/profil", tKey: "home.f_profil_t", dKey: "home.f_profil_d" },
                { to: "/xerite", tKey: "home.f_xerite_t", dKey: "home.f_xerite_d" },
                { to: "/horoskop", tKey: "home.f_horoskop_t", dKey: "home.f_horoskop_d" },
                { to: "/uygunluq", tKey: "home.f_uygunluq_t", dKey: "home.f_uygunluq_d" },
                { to: "/numerologiya", tKey: "home.f_numerologiya_t", dKey: "home.f_numerologiya_d" },
                { to: "/gunun-beledcisi", tKey: "home.f_beledci_t", dKey: "home.f_beledci_d" },
                { to: "/astroloq", tKey: "home.f_astroloq_t", dKey: "home.f_astroloq_d" },
                { to: "/jurnal", tKey: "home.f_jurnal_t", dKey: "home.f_jurnal_d" },
                { to: "/forum", tKey: "home.f_forum_t", dKey: "home.f_forum_d" },
                { to: "/qezet", tKey: "home.f_meqale_t", dKey: "home.f_meqale_d" },
              ].map((f) => (
                <Link
                  key={f.to}
                  to={f.to}
                  className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 hover:border-gold/30 transition"
                >
                  <h3 className="font-display text-xl">{t(f.tKey)}</h3>
                  <p className="text-sm text-mist mt-1.5 leading-relaxed">{t(f.dKey)}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* SUBSCRIPTION PREVIEW */}
          <div className="py-10">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-gold text-xs tracking-[0.35em] uppercase mb-2">
                  {t("home.sub_kicker")}
                </p>
                <h2 className="font-display text-3xl">{t("home.sub_title")}</h2>
                <p className="text-mist text-sm mt-2 max-w-xl">{t("home.sub_desc")}</p>
              </div>
              <Link
                to="/paketler"
                className="hidden sm:inline-block shrink-0 text-sm px-5 py-2.5 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
              >
                {t("home.sub_button")}
              </Link>
            </div>

            <SubscriptionPreviewCards />

            <Link
              to="/paketler"
              className="sm:hidden mt-5 block text-center text-sm px-5 py-3 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
            >
              {t("home.sub_button")}
            </Link>
          </div>

          {/* SHOP PREVIEW */}
          <div className="py-10">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-gold text-xs tracking-[0.35em] uppercase mb-2">
                  {t("home.shop_kicker")}
                </p>
                <h2 className="font-display text-3xl">{t("home.shop_title")}</h2>
                <p className="text-mist text-sm mt-2 max-w-xl">{t("home.shop_desc")}</p>
              </div>
              <Link
                to="/tarot"
                className="hidden sm:inline-block shrink-0 text-sm px-5 py-2.5 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
              >
                {t("home.shop_button")}
              </Link>
            </div>

            <ShopPreviewGrid />

            <Link
              to="/tarot"
              className="sm:hidden mt-5 block text-center text-sm px-5 py-3 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
            >
              {t("home.shop_button")}
            </Link>
          </div>

          {/* CTA */}
          <div className="py-16">
            <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 md:p-10 text-center">
              <h3 className="font-display text-3xl md:text-4xl">
                {t("home.cta_title")}
              </h3>
              <p className="text-mist text-sm mt-3">{t("home.cta_desc")}</p>
              <Link
                to="/auth"
                className="inline-block mt-6 px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition"
              >
                {t("home.cta_button")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ana səhifədəki abunəlik önizləməsi — Pulsuz + bütün aktiv paketləri kiçik
 * kartlarda göstərir (hər paketin ilk 3 üstünlüyü ilə). Kartın özü /paketler-ə
 * keçid edir; faktiki abunə olma axını (checkout modalı) yalnız həmin
 * səhifədədir — burada sadəcə seçim üçün ilkin baxış verilir.
 */
function SubscriptionPreviewCards() {
  const { t, lang } = useLanguage();
  const plansQ = usePlans();
  const { plan: effectivePlan } = useEffectivePlan();

  if (plansQ.isLoading) {
    return (
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 rounded-2xl border border-white/5 bg-celestial-card/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards: SubscriptionPlan[] = [FREE_PLAN, ...(plansQ.data ?? [])];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((plan) => {
        const isPremium = plan.key === "premium";
        const isFree = plan.key === "pulsuz";
        const isCurrent = plan.key === effectivePlan.key;
        const features = isFree ? [t("paket.pulsuz_f1")] : plan.features.slice(0, 3);
        const extraCount = isFree ? 0 : Math.max(0, plan.features.length - 3);

        return (
          <Link
            key={plan.key}
            to="/paketler"
            className={`relative rounded-2xl border p-5 flex flex-col transition hover:border-gold/40 ${
              isPremium
                ? "border-gold/40 bg-gradient-to-b from-gold/10 to-celestial-card/60"
                : "border-white/8 bg-celestial-card/50"
            }`}
          >
            {isPremium && (
              <span className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-gold text-ink text-[10px] font-semibold px-2.5 py-1">
                <Sparkles className="size-3" /> {t("paket.en_populyar")}
              </span>
            )}

            <h3 className="font-display text-lg">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-2xl text-gold">{plan.priceAzn}</span>
              <span className="text-mist text-xs">
                {" "}
                AZN {plan.billingPeriod === "monthly" ? t("paket.ayliq") : t("paket.illik")}
              </span>
            </div>

            <ul className="mt-3 space-y-1.5 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-white/80">
                  <Check className={`size-3.5 shrink-0 mt-0.5 ${isFree ? "text-mist" : "text-gold"}`} />
                  <span>{isFree ? f : localizedPlanFeature(f, lang)}</span>
                </li>
              ))}
              {extraCount > 0 && (
                <li className="text-xs text-mist pl-5">
                  {t("home.sub_more_features").replace("{n}", String(extraCount))}
                </li>
              )}
            </ul>

            {isCurrent && (
              <span className="mt-3 inline-block text-center text-[11px] font-semibold text-goldsoft py-1.5 rounded-full border border-gold/40 bg-gold/10">
                {t("paket.cari_paketiniz")}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

const SHOP_PREVIEW_ICON: Record<ShopCategory, LucideIcon> = {
  tarot: Wand2,
  kristal: Gem,
  sham: Flame,
  kitab: BookOpen,
};

const SHOP_PREVIEW_GRADIENT: Record<ShopCategory, string> = {
  tarot: "from-indigo-500/30 via-transparent to-fuchsia-500/20",
  kristal: "from-cyan-400/25 via-transparent to-violet-500/20",
  sham: "from-amber-500/25 via-transparent to-orange-600/15",
  kitab: "from-emerald-500/20 via-transparent to-teal-600/15",
};

/**
 * Ana səhifədəki mağaza önizləməsi — kataloqdan ilk 4 aktiv məhsulu göstərir,
 * "Səbətə at" düyməsi tam işlək (useCart), beləliklə istifadəçi /tarot-a
 * getmədən birbaşa buradan da səbətə əlavə edə bilir.
 */
function ShopPreviewGrid() {
  const { t, lang } = useLanguage();
  const productsQ = useShopProducts();
  const { addToCart } = useCart();
  // Düymə basılandan 900ms sonra özünü sıfırlayan "əlavə olundu" bildirişi —
  // toast-la yanaşı, düymənin özündə də dərhal görünən əks-əlaqə.
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  if (productsQ.isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-60 rounded-2xl border border-white/5 bg-celestial-card/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const products = (productsQ.data ?? []).slice(0, 4);
  if (products.length === 0) {
    return <p className="text-mist text-sm">{t("magaza.empty_category")}</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const name = localizedName(product, lang);
        const Icon = SHOP_PREVIEW_ICON[product.category];
        const outOfStock = product.stockQty <= 0;

        return (
          <div key={product.id} className="rounded-2xl border border-white/8 bg-celestial-card/50 p-3.5 flex flex-col">
            <div className="relative">
              {product.imageUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-ink2">
                  <img src={product.imageUrl} alt={name} loading="lazy" className="absolute inset-0 size-full object-cover" />
                </div>
              ) : (
                <div
                  className={`relative aspect-square rounded-xl overflow-hidden bg-ink2 bg-gradient-to-br ${SHOP_PREVIEW_GRADIENT[product.category]} grid place-items-center`}
                >
                  <Icon className="size-8 text-goldsoft/70" />
                </div>
              )}
              {outOfStock && (
                <span className="absolute top-1.5 right-1.5 text-[9px] px-2 py-0.5 rounded-full bg-ink/90 border border-red-400/40 text-red-300 uppercase tracking-wide">
                  {t("magaza.out_of_stock")}
                </span>
              )}
            </div>

            <h3 className="font-display text-sm mt-3 leading-snug">{name}</h3>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-base text-gold">{product.priceAzn} AZN</span>
              <button
                type="button"
                aria-label={outOfStock ? t("magaza.out_of_stock") : t("magaza.add_to_cart")}
                disabled={outOfStock}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    nameEn: product.nameEn,
                    nameRu: product.nameRu,
                    priceAzn: product.priceAzn,
                    imageUrl: product.imageUrl,
                  });
                  toast.success(t("magaza.added_to_cart"));
                  setJustAddedId(product.id);
                  window.setTimeout(() => setJustAddedId((cur) => (cur === product.id ? null : cur)), 900);
                }}
                className={`size-8 grid place-items-center rounded-full text-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  justAddedId === product.id ? "bg-gold scale-110" : "bg-gold hover:bg-goldsoft hover:scale-105"
                }`}
              >
                {justAddedId === product.id ? (
                  <Check key="check" className="size-4 animate-in zoom-in-50 duration-200" />
                ) : (
                  <ShoppingCart key="cart" className="size-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DayCell {
  date: Date;
  label: string;
  weekdayIndex: number;
  sign: string;
  dayRuler: string;
  isToday: boolean;
}

function buildWeekStrip(): DayCell[] {
  const today = new Date();
  const cells: DayCell[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      date: d,
      label: String(d.getDate()),
      weekdayIndex: d.getDay(),
      sign: sunSignFromDate(iso),
      dayRuler: DAY_RULERS_AZ[d.getDay()] ?? "Günəş",
      isToday: offset === 0,
    });
  }
  return cells;
}

/**
 * Gündəlik bürc təqvimi — cari həftənin hər günü üçün Günəş bürcünü və
 * xaldey gün hakimini göstərən üfüqi zolaq. Client-only render (useEffect)
 * ilə server/client arasında tarix uyğunsuzluğu (hydration mismatch) qarşısı alınır.
 */
function DailyZodiacStrip() {
  const { t, lang } = useLanguage();
  const [days, setDays] = useState<DayCell[] | null>(null);

  useEffect(() => {
    setDays(buildWeekStrip());
  }, []);

  if (!days) {
    return <div className="mt-6 h-24" aria-hidden="true" />;
  }

  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {days.map((d) => (
        <div
          key={d.label + d.weekdayIndex}
          className={`shrink-0 w-20 rounded-2xl border p-3 text-center transition ${
            d.isToday
              ? "border-gold/60 bg-gold/10"
              : "border-white/10 bg-celestial-card/50"
          }`}
        >
          <div className="text-[10px] text-mist uppercase tracking-widest">{t(`common.weekday_short_${d.weekdayIndex}`)}</div>
          <div className={`font-display text-xl mt-0.5 ${d.isToday ? "text-gold" : "text-white"}`}>{d.label}</div>
          <div className="text-lg mt-1" title={localizedSignName(d.sign, lang)}>
            {SIGN_SYMBOLS[d.sign] ?? ""}
          </div>
          <div className="text-[10px] text-mist mt-0.5 truncate">{localizedBodyName(d.dayRuler, lang)}</div>
        </div>
      ))}
    </div>
  );
}
