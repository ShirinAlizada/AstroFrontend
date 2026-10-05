import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyShopOrders, fetchProductReviews, fetchRatingSummaries, fetchShopProducts, fetchStockByIds } from "@/lib/shop";

export function useShopProducts() {
  return useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
    staleTime: 5 * 60_000,
  });
}

/** İstifadəçinin öz mağaza sifarişlərinin tarixçəsi. */
export function useMyShopOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-shop-orders", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchMyShopOrders(user!.id),
  });
}

/** Səbətdəki məhsulların cari stokunu yoxlayır (checkout-dan əvvəl xəbərdarlıq üçün). */
export function useCartStockCheck(productIds: string[]) {
  return useQuery({
    queryKey: ["cart-stock-check", [...productIds].sort().join(",")],
    enabled: productIds.length > 0,
    queryFn: () => fetchStockByIds(productIds),
    staleTime: 15_000,
  });
}

/** Bir neçə məhsulun orta reytinqi/rəy sayı (mağaza kartlarında göstərmək üçün). */
export function useRatingSummaries(productIds: string[]) {
  return useQuery({
    queryKey: ["rating-summaries", [...productIds].sort().join(",")],
    enabled: productIds.length > 0,
    queryFn: () => fetchRatingSummaries(productIds),
    staleTime: 60_000,
  });
}

/** Bir məhsulun rəyləri — yalnız panel açılanda (`enabled`) yüklənir. */
export function useProductReviews(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    enabled,
    queryFn: () => fetchProductReviews(productId),
  });
}

export type { ShopProduct, ShopCategory, ShopOrderRow, ShopOrderItemRow, ProductReview, ProductRatingSummary } from "@/lib/shop";
