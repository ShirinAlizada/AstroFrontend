import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CITIES,
  SIGN_SYMBOLS,
  computeNatalChart,
  computeSynastry,
  synastryDetails,
  planetMeaningAz,
  type NatalChart,
  type SynastryResult,
  type PlanetPairDetail,
} from "@/lib/astrology";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/uygunluq")({
  head: () => ({
    meta: [
      { title: "Cütlük Xəritəsi — Virgo Astrology" },
      { name: "description", content: "İki doğum xəritəsini müqayisə edərək sevgi, dostluq və ünsiyyət uyğunluq balını hesabla." },
      { property: "og:title", content: "Cütlük Xəritəsi — Virgo Astrology" },
      { property: "og:description", content: "İki natal xəritə arasında uyğunluq balı və şərhlər." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SynastryPage,
});

interface PersonForm {
  name: string;
  date: string;
  time: string;
  place: string;
}

const empty: PersonForm = { name: "", date: "", time: "12:00", place: "Bakı" };

function chartFrom(p: PersonForm): NatalChart | null {
  const city = CITIES.find((c) => c.name === p.place);
  if (!city || !p.date || !p.time) return null;
  return computeNatalChart({ date: p.date, time: p.time, latitude: city.lat, longitude: city.lon });
}

function SynastryPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [a, setA] = useState<PersonForm>({ ...empty, name: "Mən" });
  const [b, setB] = useState<PersonForm>({ ...empty, name: "Partnyor" });
  const [result, setResult] = useState<(SynastryResult & { ca: NatalChart; cb: NatalChart; details: PlanetPairDetail[] }) | null>(null);
  const [error, setError] = useState("");

  const { data: myChart } = useQuery({
    queryKey: ["my-chart-public", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("natal_charts").select("chart").eq("user_id", user!.id).maybeSingle();
      return (data?.chart as unknown as NatalChart) ?? null;
    },
  });

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const cb = chartFrom(b);
    const ca = myChart ?? chartFrom(a);
    if (!ca || !cb) {
      setError(t("uygunluq.error_fill"));
      return;
    }
    setError("");
    setResult({ ...computeSynastry(ca, cb), ca, cb, details: synastryDetails(ca, cb) });
  }

  return (
    <Page>
      <PageHeader
        kicker={t("page.uygunluq.kicker")}
        title={t("page.uygunluq.title")}
        subtitle={t("page.uygunluq.subtitle")}
      />

      <form onSubmit={calculate} className="grid md:grid-cols-2 gap-6">
        <PersonCard
          title={myChart ? t("uygunluq.you_chart") : t("uygunluq.first_person")}
          person={a}
          setPerson={setA}
          locked={Boolean(myChart)}
          lockedText={
            myChart
              ? t("uygunluq.lock_summary")
                  .replace("{sun}", myChart.sun)
                  .replace("{moon}", myChart.moon)
                  .replace("{asc}", myChart.ascendant.sign)
              : undefined
          }
        />
        <PersonCard title={t("uygunluq.second_person")} person={b} setPerson={setB} />
        <div className="md:col-span-2">
          {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
          <button type="submit" className="px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            {t("uygunluq.calculate_button")}
          </button>
          {!user && (
            <Link to="/auth" className="ml-4 text-sm text-mist hover:text-goldsoft">
              {t("uygunluq.save_prompt")}
            </Link>
          )}
        </div>
      </form>

      {result && (
        <section className="mt-10 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 text-center">
            <div className="font-display text-6xl text-gold">
              {result.overall}
              <span className="text-2xl text-mist">%</span>
            </div>
            <div className="text-mist text-xs tracking-[0.3em] uppercase mt-2">{t("uygunluq.overall_label")}</div>
            <div className="flex items-center justify-center gap-4 mt-6 text-3xl">
              <span className="text-goldsoft">{SIGN_SYMBOLS[result.ca.sun]}</span>
              <span className="text-mist text-base">+</span>
              <span className="text-violet">{SIGN_SYMBOLS[result.cb.sun]}</span>
            </div>
            <p className="text-mist text-sm mt-2">
              {result.ca.sun} və {result.cb.sun}
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Score label={t("home.demo_sevgi")} value={result.love} />
              <Score label={t("uygunluq.dostluq")} value={result.friendship} />
              <Score label={t("uygunluq.unsiyyet")} value={result.communication} />
            </div>
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-3">{t("uygunluq.comment_heading")}</h2>
              <ul className="space-y-2 text-sm text-white/85">
                {result.notes.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="text-gold">☉</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {result && (
        <section className="mt-8">
          <h2 className="font-display text-2xl mb-4">{t("uygunluq.analysis_heading")}</h2>
          <div className="grid gap-4">
            {result.details.map((d) => (
              <div
                key={d.planet}
                className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <span className="text-2xl text-gold">{d.symbol}</span>
                  <div>
                    <div className="text-sm font-medium">{d.planet}</div>
                    <div className="text-xs text-mist">{planetMeaningAz(d.planet)}</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 text-sm">
                  <span className="text-goldsoft">{d.signA}</span>
                  <span className="text-mist text-xs">({d.elementA})</span>
                  <span className="text-white/30">↔</span>
                  <span className="text-violet">{d.signB}</span>
                  <span className="text-mist text-xs">({d.elementB})</span>
                </div>
                <div className="flex items-center gap-3 sm:w-40 justify-end">
                  <span className="text-xs text-mist px-2.5 py-1 rounded-full border border-white/10">{d.aspect}</span>
                  <span className="font-display text-xl text-gold">{d.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">
      <div className="text-mist text-xs mb-2">{label}</div>
      <div className="font-display text-3xl text-goldsoft">
        {value}
        <span className="text-base text-mist">%</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gold" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function PersonCard({
  title,
  person,
  setPerson,
  locked,
  lockedText,
}: {
  title: string;
  person: PersonForm;
  setPerson: (p: PersonForm) => void;
  locked?: boolean | undefined;
  lockedText?: string | undefined;
}) {
  const { t } = useLanguage();
  const id = title.replace(/\s/g, "-");
  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-4">
      <h2 className="font-display text-xl">{title}</h2>
      {locked ? (
        <p className="text-sm text-mist">{lockedText}</p>
      ) : (
        <>
          <div>
            <label htmlFor={`${id}-name`} className="block text-xs text-mist mb-1.5">{t("uygunluq.ad_label")}</label>
            <input id={`${id}-name`} value={person.name} maxLength={60}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-date`} className="block text-xs text-mist mb-1.5">{t("common.dogum_tarixi")}</label>
              <input id={`${id}-date`} type="date" value={person.date}
                onChange={(e) => setPerson({ ...person, date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label htmlFor={`${id}-time`} className="block text-xs text-mist mb-1.5">{t("common.saat")}</label>
              <input id={`${id}-time`} type="time" lang="az-AZ" value={person.time}
                onChange={(e) => setPerson({ ...person, time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-place`} className="block text-xs text-mist mb-1.5">{t("common.dogum_yeri")}</label>
            <select id={`${id}-place`} value={person.place}
              onChange={(e) => setPerson({ ...person, place: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50">
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-ink">{c.name}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
