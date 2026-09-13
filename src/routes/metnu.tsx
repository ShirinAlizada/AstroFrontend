import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/metnu")({
  head: () => ({
    meta: [
      { title: "Mətnu — Ruh Astrolojiya" },
      { name: "description", content: "Astroloji məsləhət və xidmətlər üçün bizimlə əlaqə saxlayın." },
      { property: "og:title", content: "Mətnu — Ruh Astrolojiya" },
      { property: "og:description", content: "Astroloji məsləhət və xidmətlər üçün bizimlə əlaqə saxlayın." },
    ],
  }),
  component: MetnuPage,
});

function MetnuPage() {
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <SiteNav />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Əlaqə</p>
            <h1 className="font-display text-4xl md:text-5xl max-w-xl">Səmavi məsləhət al</h1>
            <p className="mt-5 text-mist leading-relaxed max-w-md">
              Doğum tarixini, saatını və sualını bizimlə paylaş. Komandamız 48 saat ərzində cavab verəcək.
            </p>
          </div>

          <form
            className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label htmlFor="name" className="block text-xs text-mist mb-1.5">Adınız</label>
              <input id="name" type="text" placeholder="Adınız" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs text-mist mb-1.5">E-poçt</label>
              <input id="email" type="email" placeholder="siz@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs text-mist mb-1.5">Sualınız</label>
              <textarea id="message" rows={4} placeholder="Səmavi xəritəniz haqqında nə öyrənmək istəyirsiniz?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50 resize-none" />
            </div>
            <button type="submit" className="w-full px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
              Göndər
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
