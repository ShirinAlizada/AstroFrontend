import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Flame, Gem, ShieldCheck, ShoppingCart, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useShopProducts } from "@/hooks/useShop";
import { useCart } from "@/hooks/useCart";
import { localizedDescription, localizedName, type ShopCategory, type ShopProduct } from "@/lib/shop";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Route = createFileRoute("/tarot")({
  head: () => ({
    meta: [
      { title: "Mağaza — Virgo Astrology" },
      { name: "description", content: "Tarot dəstləri, kristallar, şamlar və kitablar — astroloji mağazamızdan sifariş edin." },
      { property: "og:title", content: "Mağaza — Virgo Astrology" },
      { property: "og:description", content: "Astroloji mağazamızdan tarot, kristal, şam və kitab sifariş edin." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

const CATEGORY_ICON: Record<ShopCategory, LucideIcon> = {
  tarot: Wand2,
  kristal: Gem,
  sham: Flame,
  kitab: BookOpen,
};

const CATEGORY_GRADIENT: Record<ShopCategory, string> = {
  tarot: "from-indigo-500/30 via-transparent to-fuchsia-500/20",
  kristal: "from-cyan-400/25 via-transparent to-violet-500/20",
  sham: "from-amber-500/25 via-transparent to-orange-600/15",
  kitab: "from-emerald-500/20 via-transparent to-teal-600/15",
};

const TABS: { key: "all" | ShopCategory; labelKey: string }[] = [
  { key: "all", labelKey: "magaza.tab_all" },
  { key: "tarot", labelKey: "magaza.tab_tarot" },
  { key: "kristal", labelKey: "magaza.tab_kristal" },
  { key: "sham", labelKey: "magaza.tab_sham" },
  { key: "kitab", labelKey: "magaza.tab_kitab" },
];

function ProductArt({ product, name }: { product: ShopProduct; name: string }) {
  const Icon = CATEGORY_ICON[product.category];
  if (product.imageUrl) {
    return (
      <div className="relative aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-ink2">
        <img src={product.imageUrl} alt={name} loading="lazy" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>
    );
  }
  return (
    <div className={`relative aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-ink2 bg-gradient-to-br ${CATEGORY_GRADIENT[product.category]} grid place-items-center`}>
      <Icon className="size-10 text-goldsoft/70" />
    </div>
  );
}

function ShopPage() {
  const { t, lang } = useLanguage();
  const productsQ = useShopProducts();
  const { addToCart } = useCart();
  const [tab, setTab] = useState<"all" | ShopCategory>("all");

  const products = productsQ.data ?? [];
  const filtered = useMemo(
    () => (tab === "all" ? products : products.filter((p) => p.category === tab)),
    [products, tab],
  );

  function handleAdd(product: ShopProduct) {
    addToCart({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      nameRu: product.nameRu,
      priceAzn: product.priceAzn,
      imageUrl: product.imageUrl,
    });
    toast.success(t("magaza.added_to_cart"));
  }

  return (
    <Page>
      <PageHeader kicker={t("magaza.kicker")} title={t("magaza.title")} subtitle={t("magaza.subtitle")} />

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`text-sm px-5 py-2 rounded-full border transition ${
              tab === tb.key ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      {productsQ.isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}
      {!productsQ.isLoading && filtered.length === 0 && <p className="text-mist">{t("magaza.empty_category")}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product) => {
          const name = localizedName(product, lang);
          const description = localizedDescription(product, lang);
          const outOfStock = product.stockQty <= 0;
          const lowStock = !outOfStock && product.stockQty <= 5;
          return (
            <div key={product.id} className="rounded-3xl border border-white/8 bg-celestial-card/50 p-4 flex flex-col">
              <div className="relative">
                <ProductArt product={product} name={name} />
                {outOfStock && (
                  <span className="absolute top-2 right-2 text-[10px] px-2.5 py-1 rounded-full bg-ink/90 border border-red-400/40 text-red-300 uppercase tracking-wide">
                    {t("magaza.out_of_stock")}
                  </span>
                )}
              </div>
              <h2 className="font-display text-lg mt-4">{name}</h2>
              <p className="mt-1.5 text-xs text-mist leading-relaxed flex-1">{description}</p>
              {lowStock && (
                <p className="mt-1.5 text-xs text-amber-300">
                  {t("magaza.low_stock").replace("{n}", String(product.stockQty))}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-mist">
                {product.unitLabel && <span>{product.unitLabel}</span>}
                <span className="font-display text-lg text-gold ml-auto">{product.priceAzn} AZN</span>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={outOfStock}
                className="mt-4 w-full flex items-center justify-center gap-2 text-center text-sm font-semibold py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition disabled:opacity-40 disabled:hover:bg-gold disabled:cursor-not-allowed"
              >
                <ShoppingCart className="size-4" />
                {outOfStock ? t("magaza.out_of_stock") : t("magaza.add_to_cart")}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-mist flex items-center gap-1.5">
        <ShieldCheck className="size-3.5 shrink-0" />
        {t("tarot.demo_footnote")}
      </p>
    </Page>
  );
}
