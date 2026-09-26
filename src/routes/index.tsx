import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Sidebar } from "@/components/Sidebar";
import { CurrentPlanetsPanel } from "@/components/CurrentPlanetsPanel";
import { SIGN_SYMBOLS, DAY_RULERS_AZ, sunSignFromDate } from "@/lib/astrology";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virgo Astrology — natal xəritə və horoskop platforması" },
      { name: "description", content: "Doğum məlumatlarına əsasən natal xəritə, günlük horoskop, uyğunluq təhlili, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:title", content: "Virgo Astrology — Səmavi xəritən" },
      { property: "og:description", content: "Natal xəritə, horoskop, uyğunluq, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);

  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <SiteNav />

      <div className="mx-auto max-w-7xl px-6 flex gap-8 items-start">
        <Sidebar
          isAdmin={isAdmin}
          hasUser={Boolean(user)}
          className="hidden lg:flex sticky top-20 shrink-0 w-52 py-1"
        />

        <div className="min-w-0 flex-1">
          {/* HERO */}
          <div className="pt-4 pb-6">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
              {t("home.hero_kicker")}
            </p>
            <h1 className="font-display leading-[0.95] text-5xl md:text-7xl max-w-3xl">
              {t("home.hero_title_1")} <span className="text-goldsoft italic">{t("home.hero_title_em")}</span>{" "}
              {t("home.hero_title_2")}
            </h1>

            <DailyZodiacStrip />

            <div className="mt-8">
              <CurrentPlanetsPanel />
            </div>
          </div>

          {/* COMPATIBILITY STRIP */}
          <div className="py-10">
            <div className="rounded-3xl border border-white/10 bg-ink2/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:flex-1">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">
                  {t("home.compat_kicker")}
                </p>
                <h2 className="font-display text-3xl">
                  {t("home.compat_title")}
                </h2>
                <p className="text-mist text-sm mt-2">
                  {t("home.compat_desc")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full grid place-items-center border border-violet/40 text-violet text-2xl">
                  ♓
                </div>
                <div className="size-16 rounded-full grid place-items-center border border-gold/40 text-goldsoft text-2xl">
                  ♌
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl text-gold">
                    88<span className="text-lg text-mist">%</span>
                  </div>
                  <div className="text-mist text-xs tracking-widest uppercase">
                    {t("home.compat_label")}
                  </div>
                </div>
              </div>
              <Link
                to="/uygunluq"
                className="md:ml-auto text-sm px-5 py-3 rounded-full bg-gold text-ink font-semibold hover:bg-goldsoft transition"
              >
                {t("home.compat_button")}
              </Link>
            </div>
          </div>

          {/* FEATURES */}
          <div className="py-6">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-4">{t("home.platform_kicker")}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { to: "/profil", tKey: "home.f_profil_t", dKey: "home.f_profil_d" },
                { to: "/xerite", tKey: "home.f_xerite_t", dKey: "home.f_xerite_d" },
                { to: "/horoskop", tKey: "home.f_horoskop_t", dKey: "home.f_horoskop_d" },
                { to: "/uygunluq", tKey: "home.f_uygunluq_t", dKey: "home.f_uygunluq_d" },
                { to: "/numerologiya", tKey: "home.f_numerologiya_t", dKey: "home.f_numerologiya_d" },
                { to: "/gunun-beledcisi", tKey: "home.f_beledci_t", dKey: "home.f_beledci_d" },
                { to: "/astroloq", tKey: "home.f_astroloq_t", dKey: "home.f_astroloq_d" },
                { to: "/jurnal", tKey: "home.f_jurnal_t", dKey: "home.f_jurnal_d" },
                { to: "/forum", tKey: "home.f_forum_t", dKey: "home.f_forum_d" },
                { to: "/qezet", tKey: "home.f_meqale_t", dKey: "home.f_meqale_d" },
              ].map((f) => (
                <Link
                  key={f.to}
                  to={f.to}
                  className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 hover:border-gold/30 transition"
                >
                  <h3 className="font-display text-xl">{t(f.tKey)}</h3>
                  <p className="text-sm text-mist mt-1.5 leading-relaxed">{t(f.dKey)}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="py-16">
            <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 md:p-10 text-center">
              <h3 className="font-display text-3xl md:text-4xl">
                {t("home.cta_title")}
              </h3>
              <p className="text-mist text-sm mt-3">{t("home.cta_desc")}</p>
              <Link
                to="/auth"
                className="inline-block mt-6 px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition"
              >
                {t("home.cta_button")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const WEEKDAYS_SHORT_AZ = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];

interface DayCell {
  date: Date;
  label: string;
  weekday: string;
  sign: string;
  dayRuler: string;
  isToday: boolean;
}

function buildWeekStrip(): DayCell[] {
  const today = new Date();
  const cells: DayCell[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      date: d,
      label: String(d.getDate()),
      weekday: WEEKDAYS_SHORT_AZ[d.getDay()]!,
      sign: sunSignFromDate(iso),
      dayRuler: DAY_RULERS_AZ[d.getDay()] ?? "Günəş",
      isToday: offset === 0,
    });
  }
  return cells;
}

/**
 * Gündəlik bürc təqvimi — cari həftənin hər günü üçün Günəş bürcünü və
 * xaldey gün hakimini göstərən üfüqi zolaq. Client-only render (useEffect)
 * ilə server/client arasında tarix uyğunsuzluğu (hydration mismatch) qarşısı alınır.
 */
function DailyZodiacStrip() {
  const [days, setDays] = useState<DayCell[] | null>(null);

  useEffect(() => {
    setDays(buildWeekStrip());
  }, []);

  if (!days) {
    return <div className="mt-6 h-24" aria-hidden="true" />;
  }

  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {days.map((d) => (
        <div
          key={d.label + d.weekday}
          className={`shrink-0 w-20 rounded-2xl border p-3 text-center transition ${
            d.isToday
              ? "border-gold/60 bg-gold/10"
              : "border-white/10 bg-celestial-card/50"
          }`}
        >
          <div className="text-[10px] text-mist uppercase tracking-widest">{d.weekday}</div>
          <div className={`font-display text-xl mt-0.5 ${d.isToday ? "text-gold" : "text-white"}`}>{d.label}</div>
          <div className="text-lg mt-1" title={d.sign}>
            {SIGN_SYMBOLS[d.sign] ?? ""}
          </div>
          <div className="text-[10px] text-mist mt-0.5 truncate">{d.dayRuler}</div>
        </div>
      ))}
    </div>
  );
}
