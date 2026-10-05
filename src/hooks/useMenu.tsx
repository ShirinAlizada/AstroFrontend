import { useSyncExternalStore } from "react";
import {
  closeMenu,
  getMenuSnapshot,
  getServerMenuSnapshot,
  openMenu,
  subscribeMenu,
  toggleMenu,
} from "@/lib/menu-store";

/** Qlobal hamburger-menyu vəziyyəti — SiteNav (açır) və hər tərtibatın əsas məzmun sarğısı (sürüşmə/solğunlaşma animasiyası üçün oxuyur) eyni bu hook-dan istifadə edir. */
export function useMenu() {
  const { open, visible } = useSyncExternalStore(subscribeMenu, getMenuSnapshot, getServerMenuSnapshot);
  return { open, visible, openMenu, closeMenu, toggleMenu };
}
