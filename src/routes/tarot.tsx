import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Check, ChevronDown, Flame, Gem, Heart, Search, ShieldCheck, ShoppingCart, Star, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviews, useRatingSummaries, useShopProducts } from "@/hooks/useShop";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { localizedDescription, localizedName, localizedUnitLabel, upsertProductReview, type ShopCategory, type ShopProduct } from "@/lib/shop";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLongDate } from "@/lib/date-format";
import type { Lang } from "@/lib/i18n/translations";

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

type SortKey = "default" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: "default", labelKey: "magaza.sort_default" },
  { key: "price_asc", labelKey: "magaza.sort_price_asc" },
  { key: "price_desc", labelKey: "magaza.sort_price_desc" },
  { key: "name_asc", labelKey: "magaza.sort_name_asc" },
  { key: "name_desc", labelKey: "magaza.sort_name_desc" },
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

/** Statik ulduz göstəricisi — orta reytinqi göstərmək üçün (yarım ulduz dəstəklənmir, ən yaxın tam ədədə yuvarlanır). */
function StarRow({ value, size = "size-3.5" }: { value: number; size?: string }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= rounded ? "fill-gold text-gold" : "text-white/15"}`} />
      ))}
    </div>
  );
}

/** İnteraktiv ulduz seçicisi — istifadəçi öz rəyini yazarkən. */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={String(n)} className="p-0.5">
          <Star className={`size-5 transition ${n <= value ? "fill-gold text-gold" : "text-white/20 hover:text-white/40"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewsPanel({ productId }: { productId: string }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useProductReviews(productId, true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t("magaza.review_login_prompt"));
      if (rating < 1) return;
      await upsertProductReview(user.id, productId, rating, comment);
    },
    onSuccess: () => {
      toast.success(t("magaza.review_submitted"));
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["rating-summaries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-3 pt-3 border-t border-white/8 space-y-3">
      {isLoading && <p className="text-xs text-mist">{t("common.yuklenir")}</p>}
      {!isLoading && (reviews?.length ?? 0) === 0 && <p className="text-xs text-mist">{t("magaza.review_empty")}</p>}
      {!isLoading && reviews && reviews.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {reviews.map((r) => (
            <div key={r.id} className="text-xs">
              <div className="flex items-center gap-2">
                <StarRow value={r.rating} size="size-3" />
                <span className="text-mist">{formatLongDate(new Date(r.createdAt), lang as Lang)}</span>
              </div>
              {r.comment && <p className="mt-0.5 text-mist leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {user ? (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-mist">{t("magaza.review_your_rating")}</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder={t("magaza.review_placeholder")}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={() => submit.mutate()}
            disabled={rating < 1 || submit.isPending}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-gold text-ink hover:bg-goldsoft transition disabled:opacity-50"
          >
            {t("magaza.review_submit")}
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-mist">{t("magaza.review_login_prompt")}</p>
      )}
    </div>
  );
}

function ShopPage() {
  const { t, lang } = useLanguage();
  const productsQ = useShopProducts();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [tab, setTab] = useState<"all" | ShopCategory>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [openReviews, setOpenReviews] = useState<Record<string, boolean>>({});
  // "Səbətə atıldı" və "sevimlilərə əlavə/çıxarıldı" üçün qısa, özü-sıfırlanan əks-əlaqə.
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [wishlistPulseId, setWishlistPulseId] = useState<string | null>(null);

  const products = productsQ.data ?? [];
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const { data: ratingSummaries } = useRatingSummaries(productIds);

  const filtered = useMemo(() => {
    let list = tab === "all" ? products : products.filter((p) => p.category === tab);

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((p) => {
        const name = localizedName(p, lang).toLowerCase();
        const description = localizedDescription(p, lang).toLowerCase();
        const unitLabel = (localizedUnitLabel(p, lang) ?? "").toLowerCase();
        return name.includes(query) || description.includes(query) || unitLabel.includes(query);
      });
    }

    if (sort !== "default") {
      list = [...list].sort((a, b) => {
        switch (sort) {
          case "price_asc":
            return a.priceAzn - b.priceAzn;
          case "price_desc":
            return b.priceAzn - a.priceAzn;
          case "name_asc":
            return localizedName(a, lang).localeCompare(localizedName(b, lang));
          case "name_desc":
            return localizedName(b, lang).localeCompare(localizedName(a, lang));
          default:
            return 0;
        }
      });
    }

    return list;
  }, [products, tab, search, sort, lang]);

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
    setJustAddedId(product.id);
    window.setTimeout(() => setJustAddedId((cur) => (cur === product.id ? null : cur)), 900);
  }

  function handleToggleWishlist(productId: string) {
    toggleWishlist(productId);
    setWishlistPulseId(productId);
    window.setTimeout(() => setWishlistPulseId((cur) => (cur === productId ? null : cur)), 300);
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

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("magaza.search_placeholder")}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label={t("magaza.sort_label")}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key} className="bg-ink">
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {productsQ.isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}
      {!productsQ.isLoading && filtered.length === 0 && (
        <p className="text-mist">{search.trim() ? t("magaza.no_search_results") : t("magaza.empty_category")}</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product) => {
          const name = localizedName(product, lang);
          const description = localizedDescription(product, lang);
          const unitLabel = localizedUnitLabel(product, lang);
          const outOfStock = product.stockQty <= 0;
          const lowStock = !outOfStock && product.stockQty <= 5;
          const summary = ratingSummaries?.[product.id];
          const reviewsOpen = Boolean(openReviews[product.id]);
          return (
            <div key={product.id} className="rounded-3xl border border-white/8 bg-celestial-card/50 p-4 flex flex-col">
              <div className="relative">
                <ProductArt product={product} name={name} />
                <button
                  type="button"
                  onClick={() => handleToggleWishlist(product.id)}
                  aria-label={isWishlisted(product.id) ? t("magaza.remove_from_wishlist_aria") : t("magaza.add_to_wishlist_aria")}
                  className={`absolute top-2 left-2 size-8 grid place-items-center rounded-full bg-ink/80 border border-white/10 text-goldsoft hover:text-gold transition-transform ${
                    wishlistPulseId === product.id ? "scale-125" : "scale-100"
                  }`}
                >
                  <Heart className={`size-4 transition-colors ${isWishlisted(product.id) ? "fill-gold text-gold" : ""}`} />
                </button>
                {outOfStock && (
                  <span className="absolute top-2 right-2 text-[10px] px-2.5 py-1 rounded-full bg-ink/90 border border-red-400/40 text-red-300 uppercase tracking-wide">
                    {t("magaza.out_of_stock")}
                  </span>
                )}
              </div>
              <h2 className="font-display text-lg mt-4">{name}</h2>
              <p className="mt-1.5 text-xs text-mist leading-relaxed flex-1">{description}</p>

              <button
                type="button"
                onClick={() => setOpenReviews((prev) => ({ ...prev, [product.id]: !prev[product.id] }))}
                className="mt-2 flex items-center gap-1.5 text-xs text-mist hover:text-goldsoft transition"
              >
                {summary && summary.count > 0 ? (
                  <>
                    <StarRow value={summary.avgRating} />
                    <span>{t("magaza.reviews_count").replace("{n}", String(summary.count))}</span>
                  </>
                ) : (
                  <span>{t("magaza.no_rating")}</span>
                )}
                <ChevronDown className={`size-3.5 transition-transform ${reviewsOpen ? "rotate-180" : ""}`} />
              </button>

              {reviewsOpen && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200 fill-mode-both">
                  <ReviewsPanel productId={product.id} />
                </div>
              )}

              {lowStock && (
                <p className="mt-1.5 text-xs text-amber-300">
                  {t("magaza.low_stock").replace("{n}", String(product.stockQty))}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-mist">
                {unitLabel && <span>{unitLabel}</span>}
                <span className="font-display text-lg text-gold ml-auto">{product.priceAzn} AZN</span>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={outOfStock}
                className={`mt-4 w-full flex items-center justify-center gap-2 text-center text-sm font-semibold py-2.5 rounded-full text-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  justAddedId === product.id ? "bg-gold scale-[1.02]" : "bg-gold hover:bg-goldsoft"
                }`}
              >
                {justAddedId === product.id ? (
                  <Check key="check" className="size-4 animate-in zoom-in-50 duration-200" />
                ) : (
                  <ShoppingCart key="cart" className="size-4" />
                )}
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
