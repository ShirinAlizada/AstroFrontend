import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan, usePlans } from "@/hooks/useSubscription";
import {
  annualPriceAzn,
  mockPurchase,
  ANNUAL_DISCOUNT_PCT,
  FREE_PLAN,
  localizedPlanFeature,
  localizedPlanTagline,
  type SubscriptionPlan,
  type UserSubscription,
} from "@/lib/subscription";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLongDate } from "@/lib/date-format";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Paketlər — Virgo Astrology" },
      { name: "description", content: "Standart və Premium abunəlik paketlərini müqayisə edin: hər paketin xüsusiyyətləri və qiyməti." },
      { property: "og:title", content: "Paketlər — Virgo Astrology" },
      { property: "og:description", content: "İhtiyacınıza uyğun astroloji abunəlik paketini seçin." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PaketlerPage,
});

function PaketlerPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const plansQ = usePlans();
  const { plan: effectivePlan, subscription } = useEffectivePlan();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [switchWarningPlan, setSwitchWarningPlan] = useState<SubscriptionPlan | null>(null);

  const plans = plansQ.data ?? [];
  const cards: SubscriptionPlan[] = [FREE_PLAN, ...plans];

  function handleSubscribe(plan: SubscriptionPlan) {
    const hasOtherActivePaidPlan =
      effectivePlan.key !== "pulsuz" && effectivePlan.key !== plan.key && subscription?.status === "active";
    if (hasOtherActivePaidPlan) {
      setSwitchWarningPlan(plan);
    } else {
      setCheckoutPlan(plan);
    }
  }

  return (
    <Page>
      <PageHeader kicker={t("paket.kicker")} title={t("paket.title")} subtitle={t("paket.subtitle")} />

      {plansQ.isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}

      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`text-sm px-5 py-2 rounded-full transition ${
              billingCycle === "monthly" ? "bg-gold text-ink font-semibold" : "text-mist hover:text-white"
            }`}
          >
            {t("paket.billing_monthly")}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1.5 text-sm px-5 py-2 rounded-full transition ${
              billingCycle === "yearly" ? "bg-gold text-ink font-semibold" : "text-mist hover:text-white"
            }`}
          >
            {t("paket.billing_yearly")}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                billingCycle === "yearly" ? "bg-ink/15 text-ink" : "bg-gold/15 text-goldsoft"
              }`}
            >
              {t("paket.billing_yearly_save").replace("{pct}", String(ANNUAL_DISCOUNT_PCT))}
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {cards.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            billingCycle={billingCycle}
            isCurrent={plan.key === effectivePlan.key}
            hasUser={Boolean(user)}
            onSubscribe={() => handleSubscribe(plan)}
          />
        ))}
      </div>

      <p className="mt-8 text-xs text-mist flex items-center gap-1.5">
        <ShieldCheck className="size-3.5 shrink-0" />
        {t("paket.demo_footnote")}
      </p>

      {switchWarningPlan && (
        <SwitchWarningModal
          currentPlan={effectivePlan}
          newPlan={switchWarningPlan}
          subscription={subscription}
          onCancel={() => setSwitchWarningPlan(null)}
          onConfirm={() => {
            setCheckoutPlan(switchWarningPlan);
            setSwitchWarningPlan(null);
          }}
        />
      )}

      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} billingCycle={billingCycle} onClose={() => setCheckoutPlan(null)} />
      )}
    </Page>
  );
}

function SwitchWarningModal({
  currentPlan,
  newPlan,
  subscription,
  onCancel,
  onConfirm,
}: {
  currentPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  subscription: UserSubscription | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t, lang } = useLanguage();
  const endDate = subscription ? formatLongDate(new Date(subscription.currentPeriodEnd), lang) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label={t("nav.baglat")} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-3xl border border-gold/30 bg-ink2 p-7 text-center">
        <AlertTriangle className="size-7 text-gold mx-auto" />
        <h2 className="font-display text-xl mt-3">{t("paket.switch_warning_title")}</h2>
        <p className="mt-3 text-sm text-mist leading-relaxed">
          {t("paket.switch_warning_desc")
            .replace("{current}", currentPlan.name)
            .replace("{date}", endDate)
            .replace("{newp}", newPlan.name)}
        </p>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="text-center text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition"
          >
            {t("paket.switch_warning_confirm")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-center text-sm px-5 py-2.5 rounded-full border border-white/10 text-mist hover:text-white transition"
          >
            {t("paket.switch_warning_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  billingCycle,
  isCurrent,
  hasUser,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  isCurrent: boolean;
  hasUser: boolean;
  onSubscribe: () => void;
}) {
  const { t, lang } = useLanguage();
  const isPremium = plan.key === "premium";
  const isFree = plan.key === "pulsuz";
  const isYearly = billingCycle === "yearly" && !isFree;
  const displayPrice = isYearly ? annualPriceAzn(plan.priceAzn) : plan.priceAzn;

  return (
    <div
      className={`relative rounded-3xl border p-7 flex flex-col ${
        isPremium
          ? "border-gold/50 bg-gradient-to-b from-gold/10 to-celestial-card/70"
          : "border-white/8 bg-celestial-card/50"
      }`}
    >
      {isPremium && (
        <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-gold text-ink text-[11px] font-semibold px-3 py-1">
          <Sparkles className="size-3" /> {t("paket.en_populyar")}
        </span>
      )}

      <h2 className="font-display text-2xl">{plan.name}</h2>
      {plan.tagline && <p className="mt-1.5 text-sm text-mist">{localizedPlanTagline(plan.tagline, lang)}</p>}

      <div className="mt-5 flex items-baseline gap-1">
        {/* billingCycle dəyişəndə qiymət yenidən mount olunur — rəqəmin özü
            dəyişdiyini göstərən qısa bir keçid, aylıq/illik arasında sıçrayış əvəzinə. */}
        <span key={isYearly ? "yearly" : "monthly"} className="font-display text-4xl text-gold animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both">
          {displayPrice}
        </span>
        <span className="text-mist text-sm"> AZN {isYearly ? t("paket.illik") : t("paket.ayliq")}</span>
      </div>
      {isYearly && (
        <p className="mt-1 text-[11px] text-mist">
          {t("paket.billing_yearly_equiv").replace("{price}", String(Math.round(displayPrice / 12)))}
        </p>
      )}

      <ul className="mt-6 space-y-2.5 flex-1">
        {isFree ? (
          <>
            <FreeFeature text={t("paket.pulsuz_f1")} />
            <FreeFeature text={t("paket.pulsuz_f2")} />
            <FreeFeature text={t("paket.pulsuz_f3")} />
          </>
        ) : (
          plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/85">
              <Check className="size-4 text-gold shrink-0 mt-0.5" />
              <span>{localizedPlanFeature(f, lang)}</span>
            </li>
          ))
        )}
      </ul>

      <div className="mt-7">
        {isFree ? (
          <div className="text-center text-xs text-mist py-3 rounded-full border border-white/10">
            {t("paket.pulsuz_badge")}
          </div>
        ) : isCurrent ? (
          <div className="text-center text-sm font-semibold text-goldsoft py-3 rounded-full border border-gold/40 bg-gold/10">
            {t("paket.cari_paketiniz")}
          </div>
        ) : !hasUser ? (
          <Link
            to="/auth"
            className={`block text-center text-sm font-semibold py-3 rounded-full transition ${
              isPremium ? "bg-gold text-ink hover:bg-goldsoft" : "border border-gold/40 text-goldsoft hover:bg-gold/10"
            }`}
          >
            {t("paket.daxil_ol_ve_abune_ol")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onSubscribe}
            className={`w-full text-center text-sm font-semibold py-3 rounded-full transition ${
              isPremium ? "bg-gold text-ink hover:bg-goldsoft" : "border border-gold/40 text-goldsoft hover:bg-gold/10"
            }`}
          >
            {t("paket.abune_ol")}
          </button>
        )}
      </div>
    </div>
  );
}

function FreeFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-mist">
      <Check className="size-4 text-mist shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

function CheckoutModal({
  plan,
  billingCycle,
  onClose,
}: {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const isYearly = billingCycle === "yearly";
  const price = isYearly ? annualPriceAzn(plan.priceAzn) : plan.priceAzn;

  const purchase = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t("paket.daxil_ol_ve_abune_ol"));
      await mockPurchase(user.id, plan, billingCycle);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-subscription", user?.id] });
      toast.success(t("paket.checkout_success").replace("{plan}", plan.name));
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || t("paket.checkout_error")),
  });

  const formComplete = card.trim().length >= 12 && expiry.trim().length >= 4 && cvv.trim().length >= 3 && name.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label={t("nav.baglat")} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-ink2 p-7">
        <button type="button" aria-label={t("nav.baglat")} onClick={onClose} className="absolute right-5 top-5 text-mist hover:text-white">
          <X className="size-5" />
        </button>

        <p className="text-gold text-xs tracking-[0.3em] uppercase">{plan.name}</p>
        <h2 className="font-display text-2xl mt-1.5">
          {price} AZN <span className="text-base text-mist">{isYearly ? t("paket.illik") : t("paket.ayliq")}</span>
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (formComplete) purchase.mutate();
          }}
          className="mt-6 space-y-3.5"
        >
          <div>
            <label htmlFor="co-name" className="block text-xs text-mist mb-1.5">
              {t("paket.checkout_name_label")}
            </label>
            <input
              id="co-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label htmlFor="co-card" className="block text-xs text-mist mb-1.5">
              {t("paket.checkout_card_label")}
            </label>
            <input
              id="co-card"
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
              placeholder="4111 1111 1111 1111"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="co-expiry" className="block text-xs text-mist mb-1.5">
                {t("paket.checkout_expiry_label")}
              </label>
              <input
                id="co-expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="AA/İİ"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label htmlFor="co-cvv" className="block text-xs text-mist mb-1.5">
                {t("paket.checkout_cvv_label")}
              </label>
              <input
                id="co-cvv"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <p className="text-[11px] text-mist leading-relaxed pt-1">{t("paket.checkout_demo_notice")}</p>

          <button
            type="submit"
            disabled={!formComplete || purchase.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-50"
          >
            {purchase.isPending && <Loader2 className="size-4 animate-spin" />}
            {purchase.isPending ? t("paket.checkout_processing") : t("paket.checkout_pay_button").replace("{price}", String(price))}
          </button>
        </form>
      </div>
    </div>
  );
}
