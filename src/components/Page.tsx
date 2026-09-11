import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 pb-20">{children}</main>
      <footer className="border-t border-white/5 mt-10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-mist flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} Ruh Astrolojiya</span>
          <span>Səmavi məsləhət · Bakı</span>
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
