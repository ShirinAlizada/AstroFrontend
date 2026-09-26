import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { NatalWheel } from "@/components/NatalWheel";
import { BODY_SYMBOLS, SIGN_SYMBOLS, computeAspects, formatDegree, type NatalChart } from "@/lib/astrology";

export const Route = createFileRoute("/_authenticated/xerite")({
  head: () => ({
    meta: [
      { title: "Natal xəritəm — Virgo Astrology" },
      { name: "description", content: "Günəş, Ay və planetlərin bürc və ev mövqeləri ilə şəxsi natal xəritən." },
      { property: "og:title", content: "Natal xəritəm — Virgo Astrology" },
      { property: "og:description", content: "Planet mövqeləri, evlər və aspektlər üzrə şəxsi natal xəritə." },
    ],
  }),
  component: ChartPage,
});

function ChartPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["natal-chart"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("natal_charts")
        .select("chart")
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.chart as unknown as NatalChart) ?? null;
    },
  });

  const aspects = data ? computeAspects(data) : [];

  return (
    <Page>
      <PageHeader
        kicker={t("page.xerite.kicker")}
        title={t("page.xerite.title")}
        subtitle={t("page.xerite.subtitle")}
      />

      {isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}

      {!isLoading && !data && (
        <div className="rounded-2xl border border-white/10 bg-celestial-card/60 p-8 text-center">
          <p className="text-mist">{t("xerite.no_chart")}</p>
          <Link to="/profil" className="inline-block mt-4 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            {t("xerite.go_profile")}
          </Link>
        </div>
      )}

      {data && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
            <div className="aspect-square max-w-sm mx-auto">
              <NatalWheel chart={data} />
            </div>
            <div className="text-center mt-4">
              <div className="font-display text-2xl">{data.sun}</div>
              <div className="text-gold text-xs tracking-widest uppercase mt-1">{t("common.gunes_burcu")}</div>
              <div className="text-mist text-xs mt-2">
                {t("common.yukselen")} · {data.ascendant.sign} {formatDegree(data.ascendant.degree, data.ascendant.minute ?? 0)}
                &nbsp;·&nbsp; MC · {data.midheaven.sign} {formatDegree(data.midheaven.degree, data.midheaven.minute ?? 0)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.planets_heading")}</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {data.planets.map((p) => (
                  <div key={p.name} className="flex items-center justify-between border-b border-white/5 py-1.5">
                    <span className="text-mist">
                      {BODY_SYMBOLS[p.name] ?? "•"} {p.name}
                    </span>
                    <span>
                      {SIGN_SYMBOLS[p.sign] ?? ""} {p.sign} {formatDegree(p.degree, p.minute ?? 0)}
                      {p.house ? <span className="text-mist"> · {t("common.ev_n").replace("{n}", String(p.house))}</span> : null}
                      {p.retrograde ? <span className="text-violet"> ℞</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.houses_heading")}</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {data.houses.map((h) => (
                  <div key={h.index} className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-mist text-xs">{t("common.ev_n").replace("{n}", String(h.index))}</div>
                    <div>
                      {SIGN_SYMBOLS[h.sign] ?? ""} {h.sign} {formatDegree(h.degree, h.minute ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.aspects_heading")}</h2>
              {aspects.length === 0 && <p className="text-mist text-sm">{t("xerite.no_aspects")}</p>}
              <div className="grid gap-1.5">
                {aspects.map((hit, i) => (
                  <div
                    key={`${hit.a}-${hit.b}-${i}`}
                    className="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-goldsoft">{BODY_SYMBOLS[hit.a] ?? hit.a}</span>
                      <span style={{ color: hit.aspect.color }}>{hit.aspect.symbol}</span>
                      <span className="text-violet">{BODY_SYMBOLS[hit.b] ?? hit.b}</span>
                      <span className="text-mist text-xs ml-1">
                        {hit.a} {hit.aspect.nameAz.toLowerCase()} {hit.b}
                      </span>
                    </span>
                    <span className="text-mist text-xs">{t("xerite.orb_n").replace("{n}", String(hit.orb))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
