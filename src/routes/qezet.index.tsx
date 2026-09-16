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

function QezetPage() {
  const [tag, setTag] = useState<string>("hamısı");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, tag, cover_url, published_at, views")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const tags = ["hamısı", ...Array.from(new Set((data ?? []).map((a) => a.tag)))];
  const items = (data ?? []).filter(
    (a) =>
      (tag === "hamısı" || a.tag === tag) &&
      (q.trim() === "" || `${a.title} ${a.excerpt ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );
  const [lead, ...rest] = items;

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
            onClick={() => setTag(t)}
            className={`text-sm px-4 py-2 rounded-full border transition ${
              tag === t ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}
          >
            {t}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Axtar…"
          className="ml-auto w-48 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
        />
      </div>

      {isLoading && <p className="text-mist">Yüklənir…</p>}
      {!isLoading && items.length === 0 && <p className="text-mist">Hələ məqalə yoxdur.</p>}

      {lead && (
        <Link
          to="/qezet/$slug"
          params={{ slug: lead.slug }}
          className="block rounded-3xl border border-white/8 bg-celestial-card/60 p-8 hover:border-gold/40 transition"
        >
          <span className="text-xs tracking-widest uppercase text-gold">{lead.tag}</span>
          <h2 className="font-display text-3xl md:text-4xl mt-3 max-w-3xl leading-tight">{lead.title}</h2>
          {lead.excerpt && <p className="mt-4 text-mist max-w-2xl leading-relaxed">{lead.excerpt}</p>}
          <span className="mt-6 inline-block text-sm text-goldsoft">Davamını oxu →</span>
        </Link>
      )}

      <div className="mt-6 grid md:grid-cols-3 gap-5">
        {rest.map((a) => (
          <Link
            key={a.id}
            to="/qezet/$slug"
            params={{ slug: a.slug }}
            className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 hover:border-gold/30 transition"
          >
            <span className="text-xs tracking-widest uppercase text-gold">{a.tag}</span>
            <h3 className="font-display text-2xl mt-3 leading-tight">{a.title}</h3>
            {a.excerpt && <p className="mt-3 text-sm text-mist leading-relaxed">{a.excerpt}</p>}
            <span className="mt-5 inline-block text-sm text-goldsoft">Davamını oxu →</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
