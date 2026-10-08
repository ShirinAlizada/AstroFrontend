import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Page";
import { formatLongDate } from "@/lib/date-format";
import { ShareButtons } from "@/components/ShareButtons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { localizedArticleTitle, localizedArticleExcerpt, localizedArticleBody } from "@/lib/articles";

export const Route = createFileRoute("/qezet/$slug")({
  head: () => ({
    meta: [
      { title: "Məqalə — Virgo Astrology| Virgo Astrology" },
      { name: "description", content: "Virgo Astrology Məqalələr bölməsindən astroloji məqalə." },
      { property: "og:title", content: "Məqalə — Virgo Astrology" },
      { property: "og:description", content: "Virgo Astrology Məqalələr bölməsindən astroloji məqalə." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { t, lang } = useLanguage();
  const [progress, setProgress] = useState(0);
  const counted = useRef<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, title_en, title_ru, excerpt, excerpt_en, excerpt_ru, body, body_en, body_ru, tag, published_at, views, slug")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", data?.tag, data?.id],
    enabled: !!data,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("articles")
        .select("id, title, title_en, title_ru, slug, excerpt, excerpt_en, excerpt_ru, tag")
        .eq("published", true)
        .eq("tag", data!.tag)
        .neq("id", data!.id)
        .limit(3);
      if (error) throw error;
      return rows;
    },
  });

  useEffect(() => {
    if (!data || counted.current === slug) return;
    counted.current = slug;
    void supabase.rpc("increment_article_views", { _slug: slug });
  }, [data, slug]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) return <Page><p className="text-mist py-16">{t("common.yuklenir")}</p></Page>;

  if (!data) {
    return (
      <Page>
        <div className="py-20">
          <h1 className="font-display text-4xl">{t("qezet.not_found")}</h1>
          <Link to="/qezet" className="mt-4 inline-block text-goldsoft">{t("qezet.back")}</Link>
        </div>
      </Page>
    );
  }

  const title = localizedArticleTitle(data, lang);
  const excerpt = localizedArticleExcerpt(data, lang);
  const body = localizedArticleBody(data, lang);
  const paragraphs = body.split(/\n{2,}/);

  return (
    <Page>
      <div className="fixed left-0 top-0 h-[3px] bg-gold z-50 transition-[width]" style={{ width: `${progress}%` }} />
      <article className="py-6 max-w-3xl">
        <Link to="/qezet" className="text-sm text-mist hover:text-goldsoft">{t("qezet.back")}</Link>
        <p className="mt-6 text-gold text-xs tracking-[0.35em] uppercase">{data.tag}</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight">{title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-mist">
          {data.published_at && (
            <span>
              {formatLongDate(new Date(data.published_at), lang)}
            </span>
          )}
          <span>·</span>
          <span>{t("qezet.reading_time_n").replace("{n}", String(readingTime(body)))}</span>
          <span>·</span>
          <span>{t("qezet.views_n").replace("{n}", String(data.views))}</span>
          <ShareButtons className="ml-auto" title={title} />
        </div>

        {excerpt && <p className="mt-6 text-lg text-mist leading-relaxed">{excerpt}</p>}

        <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-white/90">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">{p}</p>
          ))}
        </div>

        {related && related.length > 0 && (
          <section className="mt-14 border-t border-white/8 pt-8">
            <h2 className="text-xs tracking-[0.3em] uppercase text-gold">{t("qezet.related_heading")}</h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/qezet/$slug"
                  params={{ slug: r.slug }}
                  className="rounded-2xl border border-white/5 bg-celestial-card/60 p-5 hover:border-gold/30 transition"
                >
                  <h3 className="font-display text-lg leading-tight">{localizedArticleTitle(r, lang)}</h3>
                  {localizedArticleExcerpt(r, lang) && (
                    <p className="mt-2 text-xs text-mist line-clamp-3">{localizedArticleExcerpt(r, lang)}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Page>
  );
}
