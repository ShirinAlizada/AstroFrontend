import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

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
      <SiteNav />

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
