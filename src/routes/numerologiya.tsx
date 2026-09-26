import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { computeNumerology, NUMBER_MEANINGS_AZ, type NumerologyProfile } from "@/lib/numerology";

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
  { key: "lifePath", labelKey: "numerologiya.card_lifepath" },
  { key: "destiny", labelKey: "numerologiya.card_destiny" },
  { key: "soulUrge", labelKey: "numerologiya.card_soulurge" },
  { key: "personality", labelKey: "numerologiya.card_personality" },
  { key: "birthday", labelKey: "numerologiya.card_birthday" },
];

function NumerologyPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [error, setError] = useState("");

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) {
      setError(t("numerologiya.error_fill"));
      return;
    }
    setError("");
    setProfile(computeNumerology(name, date));
  }

  return (
    <Page>
      <PageHeader
        kicker={t("page.numerologiya.kicker")}
        title={t("page.numerologiya.title")}
        subtitle={t("page.numerologiya.subtitle")}
      />

      <form onSubmit={calculate} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
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
          className="px-6 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition whitespace-nowrap"
        >
          {t("common.hesabla")}
        </button>
      </form>
      {error && <p className="text-red-300 text-sm mt-3">{error}</p>}

      {profile && (
        <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARD_KEYS.map(({ key, labelKey }) => {
            const value = profile[key];
            const meaning = NUMBER_MEANINGS_AZ[value];
            return (
              <div key={key} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
                <div className="text-mist text-xs tracking-[0.25em] uppercase mb-3">{t(labelKey)}</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl text-gold">{value}</span>
                  {meaning && <span className="text-sm text-goldsoft">{meaning.title}</span>}
                </div>
                {meaning && <p className="mt-3 text-sm text-white/80 leading-relaxed">{meaning.text}</p>}
              </div>
            );
          })}
        </section>
      )}

      <p className="mt-8 text-xs text-mist max-w-2xl">{t("numerologiya.footnote")}</p>
    </Page>
  );
}
