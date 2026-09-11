import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/qezet")({
  head: () => ({
    meta: [
      { title: "Səmavi Qəzet — Ruh Astrolojiya" },
      { name: "description", content: "Astroloji məqalələr, ay təqvimləri və səmavi hadisələrin təhlili." },
      { property: "og:title", content: "Səmavi Qəzet — Ruh Astrolojiya" },
      { property: "og:description", content: "Astroloji məqalələr, ay təqvimləri və səmavi hadisələrin təhlili." },
    ],
  }),
  component: QezetPage,
});

const articles = [
  {
    title: "Mercury retrogradında necə qərar vermək olar?",
    excerpt: "Görünüşdə geriyə hərəkət edən planetlər bizi yavaşlatmağa çağırır, dayandırmaq isə qorxutmur.",
    tag: "Təlimat",
  },
  {
    title: "Tam ayın bürclərə təsiri",
    excerpt: "Dolunay dövründə duyğular güclənir, bu isə özünü dərk etmək üçün əla fürsətdir.",
    tag: "Ay",
  },
  {
    title: "Doğum xəritəsindəki 12 ev nə deməkdir?",
    excerpt: "Hər ev həyatınızın bir sahəsini göstərir — maddi, ruhani, əlaqələr və karyera.",
    tag: "Xəritə",
  },
];

function QezetPage() {
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
          <Link to="/qezet" className="text-white hover:text-goldsoft transition">Qəzet</Link>
          <Link to="/astroloq" className="hover:text-goldsoft transition">Astroloq</Link>
          <Link to="/metnu" className="hover:text-goldsoft transition">Mətnu</Link>
        </div>
        <button type="button" className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition">Daxil ol</button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Səmavi Qəzet</p>
        <h1 className="font-display text-4xl md:text-5xl max-w-2xl">Astroloji düşüncələr</h1>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {articles.map((article) => (
            <article key={article.title} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 hover:border-gold/30 transition">
              <span className="text-xs tracking-widest uppercase text-gold">{article.tag}</span>
              <h2 className="font-display text-2xl mt-3 leading-tight">{article.title}</h2>
              <p className="mt-3 text-sm text-mist leading-relaxed">{article.excerpt}</p>
              <button type="button" className="mt-5 text-sm text-goldsoft hover:text-gold transition">Davamını oxu →</button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
