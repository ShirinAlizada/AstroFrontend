import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "./SiteNav";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useMenu } from "@/hooks/useMenu";

export function Page({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  // Sabit sol panel yoxdur — naviqasiya yalnız SiteNav-ın menyu düyməsi ilə
  // açılır. Menyu açıq olanda əsas məzmun (bu "əsas səhifədəkilər") sola
  // sürüşüb solğunlaşır, bağlananda isə geri qayıdır (bax: menu-store.ts).
  const { open: menuOpen } = useMenu();
  const contentClass = `mx-auto max-w-7xl px-6 transition-all duration-200 ease-out ${
    menuOpen ? "-translate-x-8 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
  }`;
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased overflow-x-hidden">
      <SiteNav />
      <div className={contentClass}>
        <main className="min-w-0 pb-20">{children}</main>
      </div>
      <footer className={`border-t border-white/5 mt-10 transition-all duration-200 ease-out ${
        menuOpen ? "-translate-x-8 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
      }`}>
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-mist flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between items-start sm:items-center">
          <span>© {new Date().getFullYear()} Virgo Astrology</span>
          <span className="sm:flex-1 sm:text-center">{t("footer.tagline")}</span>
          <span className="flex gap-4 shrink-0">
            <Link to="/sertler" className="hover:text-goldsoft transition">İstifadə şərtləri</Link>
            <Link to="/mexfilik" className="hover:text-goldsoft transition">Məxfilik</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <header className="pt-2 pb-8">
      <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">{kicker}</p>
      <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 text-mist max-w-2xl leading-relaxed">{subtitle}</p>}
    </header>
  );
}
