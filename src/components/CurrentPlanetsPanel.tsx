import { useEffect, useState } from "react";
import { computeCurrentSky, BODY_SYMBOLS, SIGN_SYMBOLS, formatDegree, type NatalChart } from "@/lib/astrology";
import { NatalWheel } from "@/components/NatalWheel";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLongDate } from "@/lib/date-format";

/** "23:58" tərzində, həmişə 24 saatlıq — Intl-dən asılı olmadan (bəzi
 * mühitlərdə locale-ə görə AM/PM sıza bilər). */
function formatTime24(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Bugünkü (hazırkı) planet mövqelərini göstərən panel: xəritə təkəri + hər
 * planetin bürc/dərəcəsi. Sinxron hesablama SSR-də fərqli nəticə verə bilər,
 * ona görə client-only render (useEffect) istifadə olunur — StarField və
 * DailyZodiacStrip-də tətbiq olunan eyni hidration-safe naxış.
 */
export function CurrentPlanetsPanel() {
  const { t, lang } = useLanguage();
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setChart(computeCurrentSky());
    setNow(new Date());
  }, []);

  if (!chart || !now) {
    return (
      <div
        className="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink2 to-ink h-[520px] animate-pulse"
        aria-hidden="true"
      />
    );
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink2 to-ink p-5 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase">{t("current.kicker")}</p>
          <h2 className="font-display text-2xl md:text-3xl mt-1">{t("current.title")}</h2>
        </div>
        <span className="text-xs text-mist text-right shrink-0 mt-1">
          {formatLongDate(now, lang)}
          <br />
          {formatTime24(now)}
        </span>
      </div>

      <div className="aspect-square max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto">
        <NatalWheel chart={chart} />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        {chart.planets.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-2 border-b border-white/5 py-1.5">
            <span className="text-mist whitespace-nowrap">
              {BODY_SYMBOLS[p.name] ?? "•"} {p.name}
            </span>
            <span className="text-right whitespace-nowrap">
              {SIGN_SYMBOLS[p.sign] ?? ""} {p.sign} {formatDegree(p.degree, p.minute)}
              {p.retrograde ? <span className="text-violet"> ℞</span> : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
