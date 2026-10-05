import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { localizedAspectName, localizedBodyName, localizedSignName, localizedElementName, SIGN_SYMBOLS } from "@/lib/astrology";
import { computeDailyGuideContext, dailyGuidance, localizedDayColor, type Verdict } from "@/lib/daily-guide";

export const Route = createFileRoute("/gunun-beledcisi")({
  head: () => ({
    meta: [
      { title: "Günün Bələdçisi — Virgo Astrology" },
      { name: "description", content: "Cari Ay bürcü, gün hakimi planet və planetlərarası aspektlərə əsaslanan bugünkü astroloji bələdçi." },
      { property: "og:title", content: "Günün Bələdçisi — Virgo Astrology" },
      { property: "og:description", content: "Bugün nəyə diqqət etmək lazım olduğuna dair real astroloji hesablama." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: GuidePage,
});

const VERDICT_STYLE: Record<Verdict, string> = {
  "əlverişli": "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  "neytral": "text-mist border-white/10 bg-white/5",
  "ehtiyatlı ol": "text-amber-300 border-amber-400/30 bg-amber-400/10",
};

const VERDICT_KEY: Record<Verdict, string> = {
  "əlverişli": "beledci.verdict_elverisli",
  "neytral": "beledci.verdict_neytral",
  "ehtiyatlı ol": "beledci.verdict_ehtiyatli",
};

function GuidePage() {
  const { t, lang } = useLanguage();

  const ctx = useMemo(() => computeDailyGuideContext(), []);
  const guidance = useMemo(() => dailyGuidance(ctx), [ctx]);
  const weekdayName = t(`beledci.weekday_${ctx.weekday}`);

  return (
    <Page>
      <PageHeader kicker={t("page.beledci.kicker")} title={t("page.beledci.title")} subtitle={t("page.beledci.subtitle")} />

      <div className="grid sm:grid-cols-3 gap-4">
        <InfoCard
          label={t("beledci.label_ay_burcu")}
          value={`${SIGN_SYMBOLS[ctx.moonSign] ?? ""} ${localizedSignName(ctx.moonSign, lang)}`}
          sub={localizedElementName(ctx.moonElement, lang)}
        />
        <InfoCard label={t("beledci.label_gun_hakimi")} value={weekdayName} sub={localizedBodyName(ctx.dayRuler, lang)} />
        <InfoCard label={t("beledci.label_gun_rengi")} value={weekdayName} sub={localizedDayColor(ctx.dayColor, lang)} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg mb-3">{t("beledci.aspects_heading")}</h2>
        {ctx.aspects.length === 0 ? (
          <p className="text-mist text-sm">{t("beledci.aspects_empty")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ctx.aspects.slice(0, 6).map((hit) => (
              <span
                key={`${hit.a}-${hit.b}-${hit.aspect.key}`}
                className="inline-flex items-center gap-1.5 text-xs rounded-full border border-white/10 bg-celestial-card/50 px-3 py-1.5"
                style={{ color: hit.aspect.color }}
              >
                <span className="text-white/90">{localizedBodyName(hit.a, lang)}</span>
                <span aria-hidden="true">{hit.aspect.symbol}</span>
                <span className="text-white/90">{localizedBodyName(hit.b, lang)}</span>
                <span className="text-mist">({localizedAspectName(hit.aspect.nameAz, lang)})</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">{t("beledci.today_heading")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {guidance.map((g) => {
            let reason = t(g.reasonKey);
            for (const [key, val] of Object.entries(g.reasonParams)) {
              const localized =
                key === "planet1" || key === "planet2" || key === "dayRuler"
                  ? localizedBodyName(val, lang)
                  : key === "moonSign"
                    ? localizedSignName(val, lang)
                    : key === "aspect"
                      ? localizedAspectName(val, lang)
                      : val;
              reason = reason.replace(`{${key}}`, localized);
            }
            return (
              <div key={g.categoryKey} className={`rounded-2xl border p-5 ${VERDICT_STYLE[g.verdict]}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-white">{t(g.categoryKey)}</h3>
                  <span className="text-xs uppercase tracking-widest">{t(VERDICT_KEY[g.verdict])}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{reason}</p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-8 text-xs text-mist max-w-2xl">{t("beledci.footnote")}</p>
    </Page>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
      <div className="text-mist text-xs tracking-[0.25em] uppercase mb-2">{label}</div>
      <div className="font-display text-xl text-goldsoft">{value}</div>
      {sub && <div className="text-xs text-mist mt-1">{sub}</div>}
    </div>
  );
}
