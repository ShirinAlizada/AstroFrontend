import { useQuery } from "@tanstack/react-query";
import { fetchShopProducts } from "@/lib/shop";

export function useShopProducts() {
  return useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
    staleTime: 5 * 60_000,
  });
}

export type { ShopProduct, ShopCategory } from "@/lib/shop";
