import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/horoskop")({
  head: () => ({
    meta: [
      { title: "Horoskop — Ruh Astrolojiya" },
      { name: "description", content: "Gündəlik horoskop və bürclərin səmavi təlimatları." },
      { property: "og:title", content: "Horoskop — Ruh Astrolojiya" },
      { property: "og:description", content: "Gündəlik horoskop və bürclərin səmavi təlimatları." },
    ],
  }),
  component: HoroskopPage,
});

const signs = [
  { name: "Qoç", symbol: "♈", date: "21 Mar — 19 Apr" },
  { name: "Buğa", symbol: "♉", date: "20 Apr — 20 May" },
  { name: "Əkizlər", symbol: "♊", date: "21 May — 20 İyun" },
  { name: "Xərçəng", symbol: "♋", date: "21 İyun — 22 İyul" },
  { name: "Aslan", symbol: "♌", date: "23 İyul — 22 Avq" },
  { name: "Qız", symbol: "♍", date: "23 Avq — 22 Sen" },
  { name: "Tərəzi", symbol: "♎", date: "23 Sen — 22 Okt" },
  { name: "Əqrəb", symbol: "♏", date: "23 Okt — 21 Noy" },
  { name: "Oxatan", symbol: "♐", date: "22 Noy — 21 Dek" },
  { name: "Oğlaq", symbol: "♑", date: "22 Dek — 19 Yan" },
  { name: "Dolça", symbol: "♒", date: "20 Yan — 18 Fev" },
  { name: "Balıqlar", symbol: "♓", date: "19 Fev — 20 Mar" },
];

function HoroskopPage() {
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="size-8 grid place-items-center rounded-full border border-gold/40 text-gold text-sm">☾</span>
          <span className="font-display text-2xl tracking-wide">Ruh</span>
          <span className="text-mist text-xs tracking-[0.3em] uppercase ml-1">Astrolojiya</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-mist">
          <Link to="/horoskop" className="text-white hover:text-goldsoft transition">Horoskop</Link>
          <Link to="/qezet" className="hover:text-goldsoft transition">Qəzet</Link>
          <Link to="/astroloq" className="hover:text-goldsoft transition">Astroloq</Link>
          <Link to="/metnu" className="hover:text-goldsoft transition">Mətnu</Link>
        </div>
        <button type="button" className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition">Daxil ol</button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Gündəlik bürclər</p>
        <h1 className="font-display text-4xl md:text-5xl max-w-2xl">Bu gün səmavi xəritən nə deyir?</h1>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {signs.map((sign) => (
            <div
              key={sign.name}
              className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex flex-col items-center text-center hover:border-gold/30 transition"
            >
              <span className="text-3xl text-goldsoft">{sign.symbol}</span>
              <h3 className="font-display text-xl mt-3">{sign.name}</h3>
              <p className="text-mist text-xs mt-1">{sign.date}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
