// Sevimlilər anbarı: cart-store.ts ilə eyni nümunə — heç bir giriş/Provider
// tələb etmir, localStorage-da saxlanılır (useSyncExternalStore ilə oxunur).
// Yalnız məhsul id-lərini saxlayır; göstərmək üçün lazım olan ad/qiymət/şəkil
// hər dəfə useShopProducts()-dən (artıq yüklənmiş kataloqdan) götürülür.
const STORAGE_KEY = "va-wishlist-v1";

let productIds: string[] = [];
const subscribers = new Set<() => void>();

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) productIds = parsed.filter((id): id is string => typeof id === "string");
  } catch {
    // pozulmuş/əlçatmaz localStorage — boş siyahı ilə davam edilir
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  } catch {
    // saxlama uğursuz olsa belə (məs. private mode) siyahı yaddaşda qalır
  }
}

loadFromStorage();

function notify() {
  saveToStorage();
  for (const cb of subscribers) cb();
}

export function subscribeWishlist(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function getWishlistSnapshot(): string[] {
  return productIds;
}

export function getServerWishlistSnapshot(): string[] {
  return [];
}

export function addToWishlist(productId: string) {
  if (productIds.includes(productId)) return;
  productIds = [...productIds, productId];
  notify();
}

export function removeFromWishlist(productId: string) {
  productIds = productIds.filter((id) => id !== productId);
  notify();
}

export function toggleWishlist(productId: string) {
  if (productIds.includes(productId)) removeFromWishlist(productId);
  else addToWishlist(productId);
}

export function clearWishlist() {
  productIds = [];
  notify();
}
