import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { Sidebar } from "./Sidebar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

export function Page({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 flex gap-8 items-start">
        <Sidebar
          isAdmin={isAdmin}
          hasUser={Boolean(user)}
          className="hidden lg:flex sticky top-20 shrink-0 w-52 py-1"
        />
        <main className="min-w-0 flex-1 pb-20">{children}</main>
      </div>
      <footer className="border-t border-white/5 mt-10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-mist flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} Virgo Astrology</span>
          <span>{t("footer.tagline")}</span>
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
