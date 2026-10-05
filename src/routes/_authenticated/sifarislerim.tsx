import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ShoppingBag } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useMyShopOrders } from "@/hooks/useShop";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLongDate } from "@/lib/date-format";
import type { Lang } from "@/lib/i18n/translations";
import type { ShopOrderRow } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/sifarislerim")({
  head: () => ({
    meta: [
      { title: "Sifarişlərim — Virgo Astrology" },
      { name: "description", content: "Mağazadan etdiyin bütün sifarişlərin tarixçəsi." },
      { property: "og:title", content: "Sifarişlərim — Virgo Astrology" },
      { property: "og:description", content: "Sifariş tarixçən və statusları." },
    ],
  }),
  component: OrdersPage,
});

const STATUS_BADGE: Record<string, string> = {
  yeni: "border-gold/40 text-goldsoft",
  tesdiqlenib: "border-blue-400/40 text-blue-300",
  gonderilib: "border-emerald-400/40 text-emerald-300",
  legv_edilib: "border-red-400/40 text-red-300",
};

function statusLabel(t: (key: string) => string, status: string) {
  const key = `sifaris.status_${status}`;
  const label = t(key);
  return label === key ? status : label;
}

function OrdersPage() {
  const { t } = useLanguage();
  const { data: orders, isLoading } = useMyShopOrders();

  return (
    <Page>
      <PageHeader kicker={t("sifaris.kicker")} title={t("sifaris.title")} subtitle={t("sifaris.subtitle")} />

      {isLoading ? (
        <p className="text-sm text-mist">{t("common.yuklenir")}</p>
      ) : !orders || orders.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-celestial-card/50 p-10 text-center">
          <ShoppingBag className="size-8 mx-auto text-mist" />
          <p className="mt-4 font-display text-xl">{t("sifaris.empty_title")}</p>
          <p className="mt-1.5 text-sm text-mist">{t("sifaris.empty_desc")}</p>
          <Link
            to="/tarot"
            className="mt-6 inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition"
          >
            {t("sifaris.browse_button")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </Page>
  );
}

function OrderCard({ order }: { order: ShopOrderRow }) {
  const { t, lang } = useLanguage();
  const badgeClass = STATUS_BADGE[order.status] ?? "border-white/10 text-mist";
  const subtotal = order.items.reduce((sum, i) => sum + i.unitPriceAzn * i.quantity, 0);
  const discountAmount = subtotal - order.totalAzn;

  return (
    <div className="rounded-2xl border border-white/8 bg-celestial-card/50 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Package className="size-4 text-mist shrink-0" />
          <div>
            <p className="text-sm text-white">{formatLongDate(new Date(order.createdAt), lang as Lang)}</p>
            <p className="text-[11px] text-mist mt-0.5">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${badgeClass}`}>{statusLabel(t, order.status)}</span>
      </div>

      <div className="mt-4 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm text-mist">
            <span>
              {item.quantity} × {item.productName}
            </span>
            <span className="text-white">{item.unitPriceAzn * item.quantity} AZN</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
        {order.discountPct > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-mist">
              <span>{t("sifaris.subtotal_label")}</span>
              <span>{subtotal} AZN</span>
            </div>
            <div className="flex items-center justify-between text-xs text-goldsoft">
              <span>
                {t("sifaris.discount_label")}
                {order.discountCode ? ` (${order.discountCode})` : ""}
              </span>
              <span>−{discountAmount} AZN</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-goldsoft">{t("sifaris.total_label")}</span>
          <span className="font-display text-xl text-gold">{order.totalAzn} AZN</span>
        </div>
      </div>
    </div>
  );
}
