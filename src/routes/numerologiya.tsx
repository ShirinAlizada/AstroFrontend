import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Users, Palette, Hammer, Compass, HeartHandshake, Eye, Landmark, Globe2, Sparkles, Mountain, GraduationCap, Wand2 } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { ShareButtons } from "@/components/ShareButtons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  computeNumerology,
  localizedNumberMeaning,
  localizedPersonalYearTheme,
  maturityNumber,
  personalYearNumber,
  type NumerologyProfile,
} from "@/lib/numerology";

export const Route = createFileRoute("/numerologiya")({
  head: () => ({
    meta: [
      { title: "Numerologiya kalkulyatoru — Virgo Astrology" },
      { name: "description", content: "Ad və doğum tarixinə əsasən həyat yolu, tale, ürəyin istəyi və şəxsiyyət ədədlərini hesabla." },
      { property: "og:title", content: "Numerologiya kalkulyatoru — Virgo Astrology" },
      { property: "og:description", content: "Pifaqor numerologiya sistemi əsasında şəxsi ədədlərin hesablanması." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NumerologyPage,
});

const CARD_KEYS: { key: keyof NumerologyProfile; labelKey: string }[] = [
  { key: "destiny", labelKey: "numerologiya.card_destiny" },
  { key: "soulUrge", labelKey: "numerologiya.card_soulurge" },
  { key: "personality", labelKey: "numerologiya.card_personality" },
  { key: "birthday", labelKey: "numerologiya.card_birthday" },
];

/** Əsas ədəd → ikon. Master ədədlər (11/22/33) öz simvolik ikonlarını daşıyır. */
const NUMBER_ICONS: Record<number, typeof Crown> = {
  1: Crown,
  2: Users,
  3: Palette,
  4: Hammer,
  5: Compass,
  6: HeartHandshake,
  7: Eye,
  8: Landmark,
  9: Globe2,
  11: Sparkles,
  22: Mountain,
  33: GraduationCap,
};

/**
 * Nəticə rəqəmini 0-dan hesablanan dəyərə qədər "sayaraq" göstərir — rəqəmin
 * statik şəkildə birdən peyda olması əvəzinə ekranda canlı bir an yaradır.
 */
function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress); // ease-out
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

function NumberRing({ value, accent = "gold" }: { value: number; accent?: "gold" | "violet" }) {
  const counted = useCountUp(value);
  const ringColor = accent === "gold" ? "stroke-gold" : "stroke-violet";
  const textColor = accent === "gold" ? "text-gold" : "text-violet";
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle cx="40" cy="40" r="35" fill="none" strokeWidth="5" className="stroke-white/10" />
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={`${ringColor} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeDasharray={2 * Math.PI * 35}
          strokeDashoffset={0}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-display text-3xl ${textColor}`}>
        {counted}
      </div>
    </div>
  );
}

function MeaningCard({
  value,
  label,
  accent = "gold",
  size = "md",
}: {
  value: number;
  label: string;
  accent?: "gold" | "violet";
  size?: "md" | "lg";
}) {
  const { lang, t } = useLanguage();
  const meaning = localizedNumberMeaning(value, lang);
  const Icon = NUMBER_ICONS[value] ?? Wand2;
  const borderClass = accent === "gold" ? "border-gold/20" : "border-violet/25";
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-celestial-card/70 to-ink2 border ${borderClass} p-6 ${
        size === "lg" ? "sm:p-8" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <NumberRing value={value} accent={accent} />
        <div className="min-w-0">
          <div className="text-mist text-xs tracking-[0.25em] uppercase mb-1.5">{label}</div>
          <div className="flex items-center gap-2">
            <Icon className={`size-4 ${accent === "gold" ? "text-goldsoft" : "text-violet"}`} />
            {meaning && <span className={`text-sm font-medium ${accent === "gold" ? "text-goldsoft" : "text-violet"}`}>{meaning.title}</span>}
          </div>
        </div>
      </div>
      {meaning && (
        <>
          <p className="mt-4 text-sm text-white/80 leading-relaxed">{meaning.text}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {meaning.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-mist"
              >
                {kw}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-mist">
            <span>{t("numerologiya.compatible_label")}</span>
            {meaning.compatible.map((c) => (
              <span
                key={c}
                className="inline-flex items-center justify-center size-6 rounded-full bg-white/5 border border-white/10 text-goldsoft font-display"
              >
                {c}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NumerologyPage() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) {
      setError(t("numerologiya.error_fill"));
      return;
    }
    setError("");
    setProfile(computeNumerology(name, date));
  }

  const maturity = profile ? maturityNumber(profile.lifePath, profile.destiny) : null;
  const personalYear = profile ? personalYearNumber(date, currentYear) : null;

  return (
    <Page>
      <PageHeader
        kicker={t("page.numerologiya.kicker")}
        title={t("page.numerologiya.title")}
        subtitle={t("page.numerologiya.subtitle")}
      />

      <form onSubmit={calculate} className="relative overflow-hidden rounded-2xl bg-celestial-card/60 border border-white/5 p-6 grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-3xl" />
        <div>
          <label htmlFor="num-name" className="block text-xs text-mist mb-1.5">{t("numerologiya.full_name_label")}</label>
          <input
            id="num-name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("numerologiya.name_placeholder")}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label htmlFor="num-date" className="block text-xs text-mist mb-1.5">{t("common.dogum_tarixi")}</label>
          <input
            id="num-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft hover:scale-[1.03] transition whitespace-nowrap"
        >
          {t("common.hesabla")}
        </button>
      </form>
      {error && <p className="text-red-300 text-sm mt-3">{error}</p>}

      {profile && (
        <section className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <h2 className="font-display text-2xl mb-4">{t("numerologiya.results_heading")}</h2>

          <MeaningCard value={profile.lifePath} label={t("numerologiya.card_lifepath")} accent="gold" size="lg" />

          <div className="mt-5 grid sm:grid-cols-2 gap-5">
            {CARD_KEYS.map(({ key, labelKey }) => (
              <MeaningCard key={key} value={profile[key]} label={t(labelKey)} accent="gold" />
            ))}
          </div>

          {maturity !== null && personalYear !== null && (
            <div className="mt-8">
              <h3 className="font-display text-xl mb-4 text-violet">{t("numerologiya.bonus_heading")}</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-violet/10 to-celestial-card/60 border border-violet/25 p-6">
                  <div className="flex items-center gap-4">
                    <NumberRing value={maturity} accent="violet" />
                    <div>
                      <div className="text-mist text-xs tracking-[0.25em] uppercase mb-1">{t("numerologiya.card_maturity")}</div>
                      {(() => {
                        const m = localizedNumberMeaning(maturity, lang);
                        return m ? <span className="text-sm font-medium text-violet">{m.title}</span> : null;
                      })()}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/80 leading-relaxed">{t("numerologiya.maturity_desc")}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-violet/10 to-celestial-card/60 border border-violet/25 p-6">
                  <div className="flex items-center gap-4">
                    <NumberRing value={personalYear} accent="violet" />
                    <div>
                      <div className="text-mist text-xs tracking-[0.25em] uppercase mb-1">{t("numerologiya.card_personalyear")}</div>
                      <span className="text-sm font-medium text-violet">{currentYear}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-mist">{t("numerologiya.personalyear_desc").replace("{year}", String(currentYear))}</p>
                  <p className="mt-3 text-sm text-white/80 leading-relaxed">{localizedPersonalYearTheme(personalYear, lang)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-4">
            <Link to="/uygunluq" className="text-sm text-goldsoft hover:text-gold transition">
              {t("numerologiya.cta_uygunluq")}
            </Link>
            <ShareButtons title={t("numerologiya.share_title").replace("{n}", String(profile.lifePath))} />
          </div>
        </section>
      )}

      <p className="mt-8 text-xs text-mist max-w-2xl">{t("numerologiya.footnote")}</p>
    </Page>
  );
}
