import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useMyPayments, usePlans } from "@/hooks/useSubscription";
import type { PaymentRecord } from "@/hooks/useSubscription";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLongDate } from "@/lib/date-format";
import type { Lang } from "@/lib/i18n/translations";

export const Route = createFileRoute("/_authenticated/odenisler")({
  head: () => ({
    meta: [
      { title: "Ödənişlərim — Virgo Astrology" },
      { name: "description", content: "Abunəlik ödənişlərinin tam tarixçəsi və qəbzlər." },
      { property: "og:title", content: "Ödənişlərim — Virgo Astrology" },
      { property: "og:description", content: "Ödəniş tarixçən və qəbzlərin." },
    ],
  }),
  component: PaymentsPage,
});

const STATUS_BADGE: Record<string, string> = {
  succeeded: "border-emerald-400/40 text-emerald-300",
  failed: "border-red-400/40 text-red-300",
  refunded: "border-amber-400/40 text-amber-300",
};

function PaymentsPage() {
  const { t } = useLanguage();
  const { data: payments, isLoading } = useMyPayments();
  const { data: plans } = usePlans();

  function planName(planKey: string) {
    return plans?.find((p) => p.key === planKey)?.name ?? planKey;
  }

  return (
    <Page>
      <PageHeader kicker={t("odenis.kicker")} title={t("odenis.title")} subtitle={t("odenis.subtitle")} />

      {isLoading ? (
        <p className="text-sm text-mist">{t("common.yuklenir")}</p>
      ) : !payments || payments.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-celestial-card/50 p-10 text-center">
          <Receipt className="size-8 mx-auto text-mist" />
          <p className="mt-4 font-display text-xl">{t("odenis.empty_title")}</p>
          <p className="mt-1.5 text-sm text-mist">{t("odenis.empty_desc")}</p>
          <Link
            to="/paketler"
            className="mt-6 inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition"
          >
            {t("odenis.browse_button")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} planName={planName(p.planKey)} />
          ))}
        </div>
      )}
    </Page>
  );
}

function PaymentRow({ payment, planName }: { payment: PaymentRecord; planName: string }) {
  const { t, lang } = useLanguage();
  const badgeClass = STATUS_BADGE[payment.status] ?? "border-white/10 text-mist";

  return (
    <div className="rounded-2xl border border-white/8 bg-celestial-card/50 p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 rounded-full border border-white/10 bg-ink2 grid place-items-center">
          <Receipt className="size-4 text-goldsoft" />
        </div>
        <div>
          <p className="text-sm text-white">
            {planName} <span className="text-mist">· {payment.billingPeriod === "yearly" ? t("paket.billing_yearly") : t("paket.billing_monthly")}</span>
          </p>
          <p className="text-[11px] text-mist mt-0.5">{formatLongDate(new Date(payment.createdAt), lang as Lang)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display text-lg text-gold">{payment.amountAzn} AZN</span>
        <span className={`text-xs px-3 py-1 rounded-full border ${badgeClass}`}>
          {t(`odenis.status_${payment.status}`)}
        </span>
      </div>
    </div>
  );
}
