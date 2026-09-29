import { useQuery } from "@tanstack/react-query";
import { fetchTarotProducts, type TarotProduct } from "@/lib/tarot";

export function useTarotProducts() {
  return useQuery({
    queryKey: ["tarot-products"],
    queryFn: fetchTarotProducts,
    staleTime: 5 * 60_000,
  });
}

export type { TarotProduct };
