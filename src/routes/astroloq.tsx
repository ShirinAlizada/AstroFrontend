import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/astroloq")({
  head: () => ({
    meta: [
      { title: "Astroloq — Ruh Astrolojiya" },
      { name: "description", content: "Ruh Astrolojiya komandası və astroloqların təqdimatı." },
      { property: "og:title", content: "Astroloq — Ruh Astrolojiya" },
      { property: "og:description", content: "Ruh Astrolojiya komandası və astroloqların təqdimatı." },
    ],
  }),
  component: AstroloqPage,
});

function AstroloqPage() {
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
          <Link to="/astroloq" className="text-white hover:text-goldsoft transition">Astroloq</Link>
          <Link to="/metnu" className="hover:text-goldsoft transition">Mətnu</Link>
        </div>
        <button type="button" className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition">Daxil ol</button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Komanda</p>
        <h1 className="font-display text-4xl md:text-5xl max-w-2xl">Səmavi xəritələrin arxasındakı insanlar</h1>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-8">
            <div className="size-20 rounded-full bg-gradient-to-br from-gold/30 to-violet/30 grid place-items-center text-3xl">☾</div>
            <h2 className="font-display text-3xl mt-6">Leyla Ruh</h2>
            <p className="text-goldsoft text-sm mt-1">Baş astroloq · 12 illik təcrübə</p>
            <p className="mt-4 text-mist leading-relaxed">
              Leyla Qərb və Vedic astrolojiyasını birləşdirərək, hər bir xəritəyə dərin və şəxsi mənada yanaşır.
            </p>
          </div>

          <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-8">
            <div className="size-20 rounded-full bg-gradient-to-br from-violet/30 to-gold/30 grid place-items-center text-3xl">✦</div>
            <h2 className="font-display text-3xl mt-6">Emil Səmavi</h2>
            <p className="text-goldsoft text-sm mt-1">Transit təhlilçisi · 8 illik təcrübə</p>
            <p className="mt-4 text-mist leading-relaxed">
              Emil gündəlik planet hərəkətlərini sadə və praktik dilə çevirməkdə ixtisaslaşıb.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
