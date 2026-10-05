import { useSyncExternalStore } from "react";
import {
  addToWishlist,
  clearWishlist,
  getServerWishlistSnapshot,
  getWishlistSnapshot,
  removeFromWishlist,
  subscribeWishlist,
  toggleWishlist,
} from "@/lib/wishlist-store";

export function useWishlist() {
  const productIds = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getServerWishlistSnapshot);

  function isWishlisted(productId: string) {
    return productIds.includes(productId);
  }

  return {
    productIds,
    count: productIds.length,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };
}
