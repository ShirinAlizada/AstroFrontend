// Ümumi mağaza data qatı: tarot, kristal, şam və kitab kateqoriyalarını
// tək kataloqdan (shop_products) oxuyur, sifariş isə çox-məhsullu səbəti
// (shop_orders + shop_order_items) demo/mock ödəniş ilə yazır — real ödəniş
// provayderi qoşulanda yalnız placeShopOrder-in içi dəyişəcək.
import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "@/lib/i18n/translations";
import type { CartItem } from "@/lib/cart-store";

export type ShopCategory = "tarot" | "kristal" | "sham" | "kitab";

export interface ShopProduct {
  id: string;
  category: ShopCategory;
  slug: string;
  name: string;
  nameEn: string | null;
  nameRu: string | null;
  description: string;
  descriptionEn: string | null;
  descriptionRu: string | null;
  priceAzn: number;
  unitLabel: string | null;
  imageUrl: string | null;
  stockQty: number;
}

export interface PlaceShopOrderInput {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

/** name/description AZ-da saxlanılır, tərcümə yoxdursa UI avtomatik AZ mətninə qayıdır. */
export function localizedName(p: { name: string; nameEn: string | null; nameRu: string | null }, lang: Lang): string {
  if (lang === "en") return p.nameEn || p.name;
  if (lang === "ru") return p.nameRu || p.name;
  return p.name;
}

export function localizedDescription(
  p: { description: string; descriptionEn: string | null; descriptionRu: string | null },
  lang: Lang,
): string {
  if (lang === "en") return p.descriptionEn || p.description;
  if (lang === "ru") return p.descriptionRu || p.description;
  return p.description;
}

export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const { data, error } = await supabase
    .from("shop_products")
    .select("id, category, slug, name, name_en, name_ru, description, description_en, description_ru, price_azn, unit_label, image_url, stock_qty")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    category: p.category as ShopCategory,
    slug: p.slug,
    name: p.name,
    nameEn: p.name_en,
    nameRu: p.name_ru,
    description: p.description,
    descriptionEn: p.description_en,
    descriptionRu: p.description_ru,
    priceAzn: p.price_azn,
    unitLabel: p.unit_label,
    imageUrl: p.image_url,
    stockQty: p.stock_qty,
  }));
}

/**
 * Səbətdəki sətirlər üçün stoku atomik şəkildə (Postgres SECURITY DEFINER
 * funksiyası ilə, hər sətir üçün ayrıca) azaldır. Kifayət qədər stok
 * yoxdursa, bu ana qədər uğurla azaldılan sətirləri dərhal geri qaytarır
 * (compensating rollback) və həmin məhsulun adını göstərən xəta atır.
 */
async function reserveStock(items: CartItem[]): Promise<void> {
  const reserved: { productId: string; quantity: number }[] = [];

  for (const item of items) {
    const { data: ok, error } = await supabase.rpc("decrement_shop_stock", {
      _product_id: item.productId,
      _qty: item.quantity,
    });
    if (error) {
      await releaseStock(reserved);
      throw error;
    }
    if (!ok) {
      await releaseStock(reserved);
      throw new Error(`"${item.name}" üçün kifayət qədər stok yoxdur`);
    }
    reserved.push({ productId: item.productId, quantity: item.quantity });
  }
}

async function releaseStock(items: { productId: string; quantity: number }[]): Promise<void> {
  for (const item of items) {
    await supabase.rpc("increment_shop_stock", { _product_id: item.productId, _qty: item.quantity });
  }
}

/**
 * Demo/mock sifariş: real ödəniş əməliyyatı yoxdur — sifariş dərhal "yeni"
 * statusu ilə, səbətdəki bütün sətirlərlə birlikdə qeydə alınır. Sətir adı
 * həmişə Azərbaycan dilində (admin panelinin işçi dili) saxlanılır — müştəri
 * hansı dildə baxırsa baxsın. Real ödəniş provayderi qoşulanda burada
 * webhook-təsdiqli axın istifadə olunacaq.
 *
 * Sifariş yazılmazdan əvvəl stok rezerv edilir (reserveStock); order/order
 * items yazısı uğursuz olsa, rezerv edilmiş stok geri qaytarılır ki, real
 * mal "itməsin".
 */
export async function placeShopOrder(userId: string, items: CartItem[], input: PlaceShopOrderInput): Promise<void> {
  if (items.length === 0) throw new Error("Səbət boşdur");

  await reserveStock(items);

  const totalAzn = items.reduce((sum, i) => sum + i.priceAzn * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("shop_orders")
    .insert({
      user_id: userId,
      total_azn: totalAzn,
      full_name: input.fullName,
      phone: input.phone,
      address: input.address,
      note: input.note || null,
      status: "yeni",
    })
    .select("id")
    .single();
  if (orderError) {
    await releaseStock(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    throw orderError;
  }

  const { error: itemsError } = await supabase.from("shop_order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      quantity: i.quantity,
      unit_price_azn: i.priceAzn,
    })),
  );
  if (itemsError) {
    await releaseStock(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    throw itemsError;
  }
}
