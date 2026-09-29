import { useSyncExternalStore } from "react";
import {
  addToCart,
  clearCart,
  getCartSnapshot,
  getServerCartSnapshot,
  removeFromCart,
  setCartQuantity,
  subscribeCart,
  type CartItem,
} from "@/lib/cart-store";

export function useCart() {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAzn = items.reduce((sum, i) => sum + i.priceAzn * i.quantity, 0);

  return {
    items,
    totalCount,
    totalAzn,
    addToCart,
    removeFromCart,
    setCartQuantity,
    clearCart,
  };
}

export type { CartItem };
