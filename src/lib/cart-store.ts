// Yüngül səbət anbarı: heç bir Provider tələb etmir (useSyncExternalStore ilə
// istənilən komponentdən oxuna bilər), localStorage-da saxlanılır ki, səhifə
// yenilənəndə itməsin. SSR-də (TanStack Start server render zamanı) window
// yoxdur — buna görə hər yerdə typeof window yoxlanılır.
const STORAGE_KEY = "va-cart-v2";

export interface CartItem {
  productId: string;
  /** Azərbaycan adı — sifariş qeydində (admin panel) həmişə bu istifadə olunur. */
  name: string;
  nameEn: string | null;
  nameRu: string | null;
  priceAzn: number;
  imageUrl: string | null;
  quantity: number;
}

let items: CartItem[] = [];
const subscribers = new Set<() => void>();

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    // pozulmuş/əlçatmaz localStorage — boş səbətlə davam edilir
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // saxlama uğursuz olsa belə (məs. private mode) səbət yaddaşda qalır
  }
}

loadFromStorage();

function notify() {
  saveToStorage();
  for (const cb of subscribers) cb();
}

export function subscribeCart(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function getCartSnapshot(): CartItem[] {
  return items;
}

export function getServerCartSnapshot(): CartItem[] {
  return [];
}

export function addToCart(
  product: { id: string; name: string; nameEn?: string | null; nameRu?: string | null; priceAzn: number; imageUrl: string | null },
  quantity = 1,
) {
  const existing = items.find((i) => i.productId === product.id);
  if (existing) {
    items = items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i));
  } else {
    items = [
      ...items,
      {
        productId: product.id,
        name: product.name,
        nameEn: product.nameEn ?? null,
        nameRu: product.nameRu ?? null,
        priceAzn: product.priceAzn,
        imageUrl: product.imageUrl,
        quantity,
      },
    ];
  }
  notify();
}

export function setCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  items = items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
  notify();
}

export function removeFromCart(productId: string) {
  items = items.filter((i) => i.productId !== productId);
  notify();
}

export function clearCart() {
  items = [];
  notify();
}
