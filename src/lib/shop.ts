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
  unitLabelEn: string | null;
  unitLabelRu: string | null;
  imageUrl: string | null;
  stockQty: number;
}

export interface PlaceShopOrderInput {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  discountCode?: string;
  discountPct?: number;
}

export interface ShopOrderItemRow {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPriceAzn: number;
}

export interface ShopOrderRow {
  id: string;
  totalAzn: number;
  fullName: string;
  phone: string;
  address: string;
  note: string | null;
  status: string;
  discountCode: string | null;
  discountPct: number;
  createdAt: string;
  items: ShopOrderItemRow[];
}

/**
 * Demo endirim kodları — sadə sabit siyahı, backend-də ayrıca cədvəl yoxdur.
 * Real kupon sistemi lazım olsa (istifadə limiti, tarix aralığı və s.),
 * bunun yerinə bir DB cədvəli və server tərəfində yoxlama qurulmalıdır.
 */
const DEMO_DISCOUNT_CODES: Record<string, number> = {
  XOSGELDIN10: 10,
  ULDUZ15: 15,
  ASTRO20: 20,
};

/** Kodu böyük hərflərə çevirib siyahıda axtarır; tapılmasa null qaytarır. */
export function findDiscountCode(code: string): { code: string; pct: number } | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const pct = DEMO_DISCOUNT_CODES[normalized];
  return pct ? { code: normalized, pct } : null;
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

/** Ölçü vahidi (məs. "78 kart", "180 qram") — AZ-da saxlanılır, tərcümə yoxdursa AZ mətninə qayıdır. unit_label özü boşdursa (null) null qalır. */
export function localizedUnitLabel(
  p: { unitLabel: string | null; unitLabelEn: string | null; unitLabelRu: string | null },
  lang: Lang,
): string | null {
  if (!p.unitLabel) return null;
  if (lang === "en") return p.unitLabelEn || p.unitLabel;
  if (lang === "ru") return p.unitLabelRu || p.unitLabel;
  return p.unitLabel;
}

export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const { data, error } = await supabase
    .from("shop_products")
    .select(
      "id, category, slug, name, name_en, name_ru, description, description_en, description_ru, price_azn, unit_label, unit_label_en, unit_label_ru, image_url, stock_qty",
    )
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
    unitLabelEn: p.unit_label_en,
    unitLabelRu: p.unit_label_ru,
    imageUrl: p.image_url,
    stockQty: p.stock_qty,
  }));
}

/** Səbətdəki məhsulların cari stokunu yoxlamaq üçün (checkout-dan əvvəl xəbərdarlıq göstərmək məqsədilə). */
export async function fetchStockByIds(productIds: string[]): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const { data, error } = await supabase.from("shop_products").select("id, stock_qty").in("id", productIds);
  if (error) throw error;
  const map: Record<string, number> = {};
  for (const row of data ?? []) map[row.id] = row.stock_qty;
  return map;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ProductRatingSummary {
  avgRating: number;
  count: number;
}

/** Mağaza kartlarında orta reytinq/rəy sayını göstərmək üçün — client tərəfdə aqreqasiya (DB view-a ehtiyac yoxdur). */
export async function fetchRatingSummaries(productIds: string[]): Promise<Record<string, ProductRatingSummary>> {
  if (productIds.length === 0) return {};
  const { data, error } = await supabase.from("shop_product_reviews").select("product_id, rating").in("product_id", productIds);
  if (error) throw error;
  const buckets: Record<string, { sum: number; count: number }> = {};
  for (const row of data ?? []) {
    const bucket = buckets[row.product_id] ?? { sum: 0, count: 0 };
    bucket.sum += row.rating;
    bucket.count += 1;
    buckets[row.product_id] = bucket;
  }
  const result: Record<string, ProductRatingSummary> = {};
  for (const [productId, { sum, count }] of Object.entries(buckets)) {
    result[productId] = { avgRating: Math.round((sum / count) * 10) / 10, count };
  }
  return result;
}

/** Bir məhsulun ən son rəyləri (ən yenidən köhnəyə, maks. 20). */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("shop_product_reviews")
    .select("id, product_id, user_id, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

/** İstifadəçinin bir məhsul üçün rəyini yazır/yeniləyir (hər istifadəçi/məhsul cütü üçün 1 rəy — upsert). */
export async function upsertProductReview(userId: string, productId: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase
    .from("shop_product_reviews")
    .upsert({ user_id: userId, product_id: productId, rating, comment: comment.trim() || null }, { onConflict: "product_id,user_id" });
  if (error) throw error;
}

/** İstifadəçinin öz mağaza sifarişlərinin tarixçəsi (ən yenidən köhnəyə). */
export async function fetchMyShopOrders(userId: string): Promise<ShopOrderRow[]> {
  const { data, error } = await supabase
    .from("shop_orders")
    .select(
      "id, total_azn, full_name, phone, address, note, status, discount_code, discount_pct, created_at, shop_order_items(id, product_id, product_name, quantity, unit_price_azn)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((o) => ({
    id: o.id,
    totalAzn: o.total_azn,
    fullName: o.full_name,
    phone: o.phone,
    address: o.address,
    note: o.note,
    status: o.status,
    discountCode: o.discount_code,
    discountPct: o.discount_pct,
    createdAt: o.created_at,
    items: (o.shop_order_items ?? []).map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      unitPriceAzn: i.unit_price_azn,
    })),
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
export async function placeShopOrder(userId: string, items: CartItem[], input: PlaceShopOrderInput): Promise<string> {
  if (items.length === 0) throw new Error("Səbət boşdur");

  await reserveStock(items);

  const subtotalAzn = items.reduce((sum, i) => sum + i.priceAzn * i.quantity, 0);
  const discountPct = input.discountPct ?? 0;
  const totalAzn = Math.round(subtotalAzn * (1 - discountPct / 100));

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
      discount_code: input.discountCode || null,
      discount_pct: discountPct,
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

  return order.id;
}
