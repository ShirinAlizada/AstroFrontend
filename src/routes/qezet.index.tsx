import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";

export const Route = createFileRoute("/qezet/")({
  head: () => ({
    meta: [
      { title: "Səmavi Qəzet — Ruh Astrolojiya" },
      { name: "description", content: "Astroloji məqalələr, ay təqvimləri və səmavi hadisələrin təhlili." },
      { property: "og:title", content: "Səmavi Qəzet — Ruh Astrolojiya" },
      { property: "og:description", content: "Astroloji məqalələr, ay təqvimləri və səmavi hadisələrin təhlili." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QezetPage,
});

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function fmt(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" });
}

const PAGE_SIZE = 6;

function QezetPage() {
  const [tag, setTag] = useState<string>("hamısı");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"yeni" | "populyar">("yeni");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, body, tag, cover_url, published_at, views")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const all = data ?? [];
  const tags = ["hamısı", ...Array.from(new Set(all.map((a) => a.tag)))];
  const filtered = all
    .filter(
      (a) =>
        (tag === "hamısı" || a.tag === tag) &&
        (q.trim() === "" || `${a.title} ${a.excerpt ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    )
    .sort((a, b) =>
      sort === "populyar"
        ? b.views - a.views
        : new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
    );

  const [lead, ...rest] = filtered;
  const visible = rest.slice(0, limit);
  const popular = [...all].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <Page>
      <PageHeader
        kicker="Səmavi Qəzet"
        title="Astroloji düşüncələr"
        subtitle="Planet hərəkətləri, ay fazaları və doğum xəritəsi üzərinə oxunaqlı yazılar."
      />

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTag(t);
              setLimit(PAGE_SIZE);
            }}
            className={`text-sm px-4 py-2 rounded-full border transition ${
              tag === t ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full border border-white/10 overflow-hidden text-sm">
            {(["yeni", "populyar"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`px-4 py-2 transition ${sort === s ? "bg-gold/15 text-goldsoft" : "text-mist hover:text-white"}`}
              >
                {s === "yeni" ? "Ən yeni" : "Ən çox oxunan"}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="Axtar…"
            className="w-44 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {isLoading && <p className="text-mist">Yüklənir…</p>}
      {!isLoading && filtered.length === 0 && <p className="text-mist">Axtarışa uyğun məqalə tapılmadı.</p>}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div>
          {lead && (
            <Link
              to="/qezet/$slug"
              params={{ slug: lead.slug }}
              className="block rounded-3xl border border-white/8 bg-celestial-card/60 p-8 hover:border-gold/40 transition"
            >
              <span className="text-xs tracking-widest uppercase text-gold">{lead.tag}</span>
              <h2 className="font-display text-3xl md:text-4xl mt-3 max-w-3xl leading-tight">{lead.title}</h2>
              {lead.excerpt && <p className="mt-4 text-mist max-w-2xl leading-relaxed">{lead.excerpt}</p>}
              <p className="mt-5 text-xs text-mist/80">
                {fmt(lead.published_at)} · {readingTime(lead.body)} dəq oxu · {lead.views} baxış
              </p>
              <span className="mt-4 inline-block text-sm text-goldsoft">Davamını oxu →</span>
            </Link>
          )}

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            {visible.map((a) => (
              <Link
                key={a.id}
                to="/qezet/$slug"
                params={{ slug: a.slug }}
                className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 hover:border-gold/30 transition flex flex-col"
              >
                <span className="text-xs tracking-widest uppercase text-gold">{a.tag}</span>
                <h3 className="font-display text-2xl mt-3 leading-tight">{a.title}</h3>
                {a.excerpt && <p className="mt-3 text-sm text-mist leading-relaxed">{a.excerpt}</p>}
                <p className="mt-4 text-xs text-mist/80">
                  {fmt(a.published_at)} · {readingTime(a.body)} dəq oxu · {a.views} baxış
                </p>
                <span className="mt-3 inline-block text-sm text-goldsoft">Davamını oxu →</span>
              </Link>
            ))}
          </div>

          {rest.length > limit && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                className="px-6 py-3 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition text-sm"
              >
                Daha çox məqalə
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-white/8 bg-celestial-card/40 p-6 lg:sticky lg:top-24">
          <h4 className="text-xs tracking-[0.3em] uppercase text-gold">Ən çox oxunanlar</h4>
          <ol className="mt-4 space-y-4">
            {popular.map((a, i) => (
              <li key={a.id} className="flex gap-3">
                <span className="font-display text-xl text-gold/60">{i + 1}</span>
                <Link
                  to="/qezet/$slug"
                  params={{ slug: a.slug }}
                  className="text-sm leading-snug hover:text-goldsoft transition"
                >
                  {a.title}
                  <span className="block text-xs text-mist/70 mt-1">{a.views} baxış</span>
                </Link>
              </li>
            ))}
            {popular.length === 0 && <li className="text-sm text-mist">Hələ məqalə yoxdur.</li>}
          </ol>
        </aside>
      </div>
    </Page>
  );
}
