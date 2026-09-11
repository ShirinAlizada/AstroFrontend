import { createFileRoute, Link } from "@tanstack/react-router";

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
      <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="size-8 grid place-items-center rounded-full border border-gold/40 text-gold text-sm">☾</span>
          <span className="font-display text-2xl tracking-wide">Ruh</span>
          <span className="text-mist text-xs tracking-[0.3em] uppercase ml-1">Astrolojiya</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-mist">
          <Link to="/horoskop" className="hover:text-goldsoft transition">Horoskop</Link>
          <Link to="/qezet" className="hover:text-goldsoft transition">Qəzet</Link>
          <Link to="/astroloq" className="hover:text-goldsoft transition">Astroloq</Link>
          <Link to="/metnu" className="text-white hover:text-goldsoft transition">Mətnu</Link>
        </div>
        <button type="button" className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition">Daxil ol</button>
      </nav>

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
