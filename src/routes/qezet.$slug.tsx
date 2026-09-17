import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Page";

export const Route = createFileRoute("/qezet/$slug")({
  head: () => ({
    meta: [
      { title: "Məqalə — Səmavi Qəzet | Ruh Astrolojiya" },
      { name: "description", content: "Ruh Astrolojiya Səmavi Qəzet bölməsindən astroloji məqalə." },
      { property: "og:title", content: "Məqalə — Səmavi Qəzet" },
      { property: "og:description", content: "Ruh Astrolojiya Səmavi Qəzet bölməsindən astroloji məqalə." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, body, tag, published_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Page><p className="text-mist py-16">Yüklənir…</p></Page>;

  if (!data) {
    return (
      <Page>
        <div className="py-20">
          <h1 className="font-display text-4xl">Məqalə tapılmadı</h1>
          <Link to="/qezet" className="mt-4 inline-block text-goldsoft">← Qəzetə qayıt</Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <article className="py-6 max-w-3xl">
        <Link to="/qezet" className="text-sm text-mist hover:text-goldsoft">← Səmavi Qəzet</Link>
        <p className="mt-6 text-gold text-xs tracking-[0.35em] uppercase">{data.tag}</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight">{data.title}</h1>
        {data.published_at && (
          <p className="mt-3 text-xs text-mist">
            {new Date(data.published_at).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {data.excerpt && <p className="mt-6 text-lg text-mist leading-relaxed">{data.excerpt}</p>}
        <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-white/90">
          {data.body.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">{p}</p>
          ))}
        </div>
      </article>
    </Page>
  );
}
