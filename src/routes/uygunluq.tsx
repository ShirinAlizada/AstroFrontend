import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CITIES,
  SIGN_SYMBOLS,
  computeNatalChart,
  computeSynastry,
  synastryDetails,
  localizedAspectName,
  localizedBodyName,
  localizedElementName,
  localizedPlanetMeaning,
  localizedSignName,
  type NatalChart,
  type SynastryResult,
  type PlanetPairDetail,
} from "@/lib/astrology";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan } from "@/hooks/useSubscription";
import { TimeField24 } from "@/components/TimeField24";

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

/**
 * Nəticə faizini 0-dan faktiki dəyərə qədər "sayaraq" göstərir — hesablama
 * bitəndə ekranda canlı bir an yaradır, statik rəqəmin birdən peyda olması
 * əvəzinə. `target` dəyişəndə (yeni hesablama) sayma təzədən başlayır.
 */
function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress); // ease-out
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

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
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { plan } = useEffectivePlan();
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
                  .replace("{sun}", localizedSignName(myChart.sun, lang))
                  .replace("{moon}", localizedSignName(myChart.moon, lang))
                  .replace("{asc}", localizedSignName(myChart.ascendant.sign, lang))
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
        <section className="mt-10 grid lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <div className="lg:col-span-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 text-center">
            <OverallScore value={result.overall} />
            <div className="text-mist text-xs tracking-[0.3em] uppercase mt-2">{t("uygunluq.overall_label")}</div>
            <div className="flex items-center justify-center gap-4 mt-6 text-3xl">
              <span className="text-goldsoft">{SIGN_SYMBOLS[result.ca.sun]}</span>
              <span className="text-mist text-base">+</span>
              <span className="text-violet">{SIGN_SYMBOLS[result.cb.sun]}</span>
            </div>
            <p className="text-mist text-sm mt-2">
              {localizedSignName(result.ca.sun, lang)} {t("common.ve")} {localizedSignName(result.cb.sun, lang)}
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
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h2 className="font-display text-2xl mb-4">{t("uygunluq.analysis_heading")}</h2>
          {plan.synastryFullDetail ? (
            <div className="grid gap-4">
              {result.details.map((d) => (
                <div
                  key={d.planet}
                  className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3 sm:w-48 shrink-0">
                    <span className="text-2xl text-gold">{d.symbol}</span>
                    <div>
                      <div className="text-sm font-medium">{localizedBodyName(d.planet, lang)}</div>
                      <div className="text-xs text-mist">{localizedPlanetMeaning(d.planet, lang)}</div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3 text-sm">
                    <span className="text-goldsoft">{localizedSignName(d.signA, lang)}</span>
                    <span className="text-mist text-xs">({localizedElementName(d.elementA, lang)})</span>
                    <span className="text-white/30">↔</span>
                    <span className="text-violet">{localizedSignName(d.signB, lang)}</span>
                    <span className="text-mist text-xs">({localizedElementName(d.elementB, lang)})</span>
                  </div>
                  <div className="flex items-center gap-3 sm:w-40 justify-end">
                    <span className="text-xs text-mist px-2.5 py-1 rounded-full border border-white/10">{localizedAspectName(d.aspect, lang)}</span>
                    <span className="font-display text-xl text-gold">{d.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-8 text-center">
              <Lock className="size-6 text-gold mx-auto" />
              <h3 className="font-display text-xl mt-3">{t("uygunluq.detay_kilidli_title")}</h3>
              <p className="text-sm text-mist mt-2 max-w-md mx-auto">{t("uygunluq.detay_kilidli_desc")}</p>
              <Link
                to="/paketler"
                className="inline-block mt-5 px-6 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition"
              >
                {t("uygunluq.detay_kilidli_button")}
              </Link>
            </div>
          )}
        </section>
      )}
    </Page>
  );
}

/** Böyük ümumi uyğunluq faizi — 0-dan hesablanan dəyərə qədər sayır. */
function OverallScore({ value }: { value: number }) {
  const counted = useCountUp(value);
  return (
    <div className="font-display text-6xl text-gold">
      {counted}
      <span className="text-2xl text-mist">%</span>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  // Çəki zolağı 0-dan faktiki dəyərə dolur — böyük ümumi faizin yanında
  // kiçik göstəricilər də eyni "canlanma" hissini verir.
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">
      <div className="text-mist text-xs mb-2">{label}</div>
      <div className="font-display text-3xl text-goldsoft">
        {value}
        <span className="text-base text-mist">%</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gold transition-[width] duration-700 ease-out" style={{ width: `${width}%` }} />
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
              <label htmlFor={`${id}-time-hour`} className="block text-xs text-mist mb-1.5">{t("common.saat")}</label>
              <TimeField24
                idPrefix={`${id}-time`}
                value={person.time}
                onChange={(v) => setPerson({ ...person, time: v })}
              />
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
