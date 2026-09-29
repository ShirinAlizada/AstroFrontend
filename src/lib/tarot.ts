// Tarot kartları mağazasının data qatı: kataloq və (hələlik demo/mock
// ödəniş ilə) sifariş yaratma. Abunəlik sistemindəki mockPurchase ilə eyni
// fəlsəfə — real ödəniş provayderi qoşulanda yalnız placeOrder-in içi
// dəyişəcək, çağıran tərəf (tarot.tsx) eyni qalır.
import { supabase } from "@/integrations/supabase/client";

export type TarotSlug = "classic" | "moon" | "stars" | "shadow";

export interface TarotProduct {
  id: string;
  slug: TarotSlug;
  name: string;
  description: string;
  priceAzn: number;
  cardCount: number;
}

export interface PlaceTarotOrderInput {
  productId: string;
  quantity: number;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export async function fetchTarotProducts(): Promise<TarotProduct[]> {
  const { data, error } = await supabase
    .from("tarot_products")
    .select("id, slug, name, description, price_azn, card_count")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug as TarotSlug,
    name: p.name,
    description: p.description,
    priceAzn: p.price_azn,
    cardCount: p.card_count,
  }));
}

/**
 * Demo/mock sifariş: real ödəniş əməliyyatı yoxdur — sifariş dərhal "yeni"
 * statusu ilə qeydə alınır, sanki ödəniş edilib. Real ödəniş provayderi
 * qoşulanda burada webhook-təsdiqli axın istifadə olunacaq.
 */
export async function placeTarotOrder(userId: string, input: PlaceTarotOrderInput, priceAzn: number): Promise<void> {
  const { error } = await supabase.from("tarot_orders").insert({
    user_id: userId,
    product_id: input.productId,
    quantity: input.quantity,
    total_azn: priceAzn * input.quantity,
    full_name: input.fullName,
    phone: input.phone,
    address: input.address,
    note: input.note || null,
    status: "yeni",
  });
  if (error) throw error;
}
