import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Heart, ShoppingCart } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useShopProducts } from "@/hooks/useShop";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { localizedName, type ShopProduct } from "@/lib/shop";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Route = createFileRoute("/sevimlilerim")({
  head: () => ({
    meta: [
      { title: "Sevimlilərim — Virgo Astrology" },
      { name: "description", content: "Mağazada bəyəndiyin məhsulları bura topla, sonra rahatca sifariş et." },
      { property: "og:title", content: "Sevimlilərim — Virgo Astrology" },
      { property: "og:description", content: "Sevimli mağaza məhsullarının siyahısı." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { t, lang } = useLanguage();
  const productsQ = useShopProducts();
  const { addToCart } = useCart();
  const { productIds, removeFromWishlist } = useWishlist();

  const products = productsQ.data ?? [];
  const wishlisted = useMemo(
    () => productIds.map((id) => products.find((p) => p.id === id)).filter((p): p is ShopProduct => Boolean(p)),
    [productIds, products],
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
      <PageHeader kicker={t("sevimlilerim.kicker")} title={t("sevimlilerim.title")} subtitle={t("sevimlilerim.subtitle")} />

      {productsQ.isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}

      {!productsQ.isLoading && wishlisted.length === 0 && (
        <div className="rounded-3xl border border-white/8 bg-celestial-card/50 p-10 text-center">
          <Heart className="size-8 mx-auto text-mist" />
          <p className="mt-4 font-display text-xl">{t("sevimlilerim.empty_title")}</p>
          <p className="mt-1.5 text-sm text-mist">{t("sevimlilerim.empty_desc")}</p>
          <Link
            to="/tarot"
            className="mt-6 inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition"
          >
            {t("sevimlilerim.browse_button")}
          </Link>
        </div>
      )}

      {wishlisted.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlisted.map((product) => {
            const name = localizedName(product, lang);
            const outOfStock = product.stockQty <= 0;
            return (
              <div key={product.id} className="rounded-3xl border border-white/8 bg-celestial-card/50 p-4 flex flex-col">
                <div className="relative aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-ink2">
                  {product.imageUrl && <img src={product.imageUrl} alt={name} loading="lazy" className="absolute inset-0 size-full object-cover" />}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={t("magaza.remove_from_wishlist_aria")}
                    className="absolute top-2 right-2 size-8 grid place-items-center rounded-full bg-ink/80 border border-white/10 text-gold hover:text-red-300 transition"
                  >
                    <Heart className="size-4 fill-current" />
                  </button>
                </div>
                <h2 className="font-display text-lg mt-4">{name}</h2>
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
      )}
    </Page>
  );
}
