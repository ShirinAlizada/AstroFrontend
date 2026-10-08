import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Lock,
  Flame,
  Mountain,
  Wind,
  Droplet,
  Heart,
  Users,
  MessageCircle,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Puzzle,
  Sun as SunIcon,
  Moon as MoonIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { ShareButtons } from "@/components/ShareButtons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CITIES,
  SIGN_SYMBOLS,
  computeNatalChart,
  computeSynastry,
  synastryDetails,
  elementBalance,
  dominantElement,
  synastryTier,
  localizedAspectName,
  localizedBodyName,
  localizedElementName,
  localizedPlanetMeaning,
  localizedSignName,
  localizedSynastryNote,
  type NatalChart,
  type SynastryResult,
  type SynastryNote,
  type SynastryTier,
  type PlanetPairDetail,
  type ElementBalance,
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
function useCountUp(target: number, durationMs = 1100): number {
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

const ELEMENT_SEGMENTS: { key: keyof ElementBalance; color: string; icon: typeof Flame }[] = [
  { key: "Od", color: "bg-rose-400", icon: Flame },
  { key: "Torpaq", color: "bg-emerald-400", icon: Mountain },
  { key: "Hava", color: "bg-sky-300", icon: Wind },
  { key: "Su", color: "bg-blue-400", icon: Droplet },
];

/** Şərh növünə uyğun kiçik ikon — "Şərh" siyahısını daha canlı/oxunaqlı edir. */
const NOTE_ICONS: Record<SynastryNote["kind"], typeof SunIcon> = {
  elements_same: SunIcon,
  elements_diff: SunIcon,
  moon_strong: MoonIcon,
  moon_tense: MoonIcon,
  venus_strong: Heart,
  venus_diff: Heart,
  mercury_strong: MessageCircle,
  mercury_tense: MessageCircle,
};

const TIER_ICONS: Record<SynastryTier, typeof Sparkles> = {
  cosmic: Sparkles,
  strong: HeartHandshake,
  growing: TrendingUp,
  challenging: Puzzle,
};

const TIER_STROKE: Record<SynastryTier, string> = {
  cosmic: "stroke-gold",
  strong: "stroke-violet",
  growing: "stroke-goldsoft",
  challenging: "stroke-mist",
};

const TIER_TEXT: Record<SynastryTier, string> = {
  cosmic: "text-gold",
  strong: "text-violet",
  growing: "text-goldsoft",
  challenging: "text-mist",
};

const TIER_GLOW: Record<SynastryTier, string> = {
  cosmic: "bg-gold/20",
  strong: "bg-violet/20",
  growing: "bg-goldsoft/15",
  challenging: "bg-mist/10",
};

/** Ümumi uyğunluq faizi — həqiqi dairəvi irəliləyiş halqası (0-dan faktiki faizə qədər animasiyalı dolur), rəngi arxetipə görə dəyişir. */
function ScoreRing({ value, tier }: { value: number; tier: SynastryTier }) {
  const counted = useCountUp(value);
  const [progress, setProgress] = useState(0);
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 120 120" className="size-36 -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={`${TIER_STROKE[tier]} transition-[stroke-dashoffset] duration-[1200ms] ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-display text-5xl ${TIER_TEXT[tier]}`}>
          {counted}
          <span className="text-xl text-mist">%</span>
        </span>
      </div>
    </div>
  );
}

function ElementBar({ balance, label, delay = 0 }: { balance: ElementBalance; label: string; delay?: number }) {
  const { lang } = useLanguage();
  const [widths, setWidths] = useState<ElementBalance>({ Od: 0, Torpaq: 0, Hava: 0, Su: 0 });

  useEffect(() => {
    const timeout = setTimeout(() => setWidths(balance), delay);
    return () => clearTimeout(timeout);
  }, [balance, delay]);

  return (
    <div>
      <div className="text-xs text-mist mb-1.5">{label}</div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
        {ELEMENT_SEGMENTS.map((s) => (
          <div
            key={s.key}
            className={`${s.color} transition-[width] duration-700 ease-out`}
            style={{ width: `${widths[s.key]}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-mist">
        {ELEMENT_SEGMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <s.icon className="size-3" />
            {localizedElementName(s.key, lang)} {balance[s.key]}%
          </span>
        ))}
      </div>
    </div>
  );
}

function NatalSnapshot({ chart, label, accent = "gold" }: { chart: NatalChart; label: string; accent?: "gold" | "violet" }) {
  const { t, lang } = useLanguage();
  const borderClass = accent === "gold" ? "border-gold/10 hover:border-gold/30" : "border-violet/10 hover:border-violet/30";
  return (
    <div className={`rounded-xl bg-white/5 border ${borderClass} p-4 transition`}>
      <div className="text-xs text-mist mb-2">{label}</div>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className={accent === "gold" ? "text-goldsoft" : "text-violet"}>{SIGN_SYMBOLS[chart.sun] ?? ""}</span>
          {t("common.gunes")} · {localizedSignName(chart.sun, lang)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={accent === "gold" ? "text-goldsoft" : "text-violet"}>{SIGN_SYMBOLS[chart.moon] ?? ""}</span>
          {t("common.ay")} · {localizedSignName(chart.moon, lang)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={accent === "gold" ? "text-goldsoft" : "text-violet"}>{SIGN_SYMBOLS[chart.ascendant.sign] ?? ""}</span>
          {t("common.yukselen")} · {localizedSignName(chart.ascendant.sign, lang)}
        </span>
      </div>
    </div>
  );
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

  const tier: SynastryTier = result ? synastryTier(result.overall) : "growing";
  const TierIcon = TIER_ICONS[tier];
  const balanceA = result ? elementBalance(result.ca) : null;
  const balanceB = result ? elementBalance(result.cb) : null;
  const domA = balanceA ? dominantElement(balanceA) : null;
  const domB = balanceB ? dominantElement(balanceB) : null;

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
          accent="gold"
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
        <PersonCard title={t("uygunluq.second_person")} person={b} setPerson={setB} accent="violet" />
        <div className="md:col-span-2">
          {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft hover:scale-[1.03] active:scale-[0.98] transition"
          >
            <Sparkles className="size-4" />
            {t("uygunluq.calculate_button")}
          </button>
          {!user && (
            <Link to="/auth" className="ml-4 text-sm text-mist hover:text-goldsoft transition">
              {t("uygunluq.save_prompt")}
            </Link>
          )}
        </div>
      </form>

      {result && (
        <section className="mt-10 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 text-center animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both hover:border-gold/35 transition-colors">
            <span className={`pointer-events-none absolute -top-16 -right-16 size-56 rounded-full blur-3xl ${TIER_GLOW[tier]}`} />
            <span className={`pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full blur-3xl ${TIER_GLOW[tier]}`} />

            <ScoreRing value={result.overall} tier={tier} />
            <div className="text-mist text-xs tracking-[0.3em] uppercase mt-3">{t("uygunluq.overall_label")}</div>

            <div className="flex items-center justify-center gap-3 mt-6 text-3xl">
              <span className="text-goldsoft animate-pulse [animation-duration:2.5s]">{SIGN_SYMBOLS[result.ca.sun]}</span>
              <Heart className="size-4 text-gold/70 animate-pulse [animation-duration:2.5s]" />
              <span className="text-violet animate-pulse [animation-duration:2.5s] [animation-delay:300ms]">{SIGN_SYMBOLS[result.cb.sun]}</span>
            </div>
            <p className="text-mist text-sm mt-2">
              {localizedSignName(result.ca.sun, lang)} {t("common.ve")} {localizedSignName(result.cb.sun, lang)}
            </p>

            <div className="relative mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2">
                <TierIcon className={`size-4 ${TIER_TEXT[tier]}`} />
                <div className={`font-display text-xl ${TIER_TEXT[tier]}`}>{t(`uygunluq.tier_${tier}_title`)}</div>
              </div>
              <p className="text-xs text-mist mt-2 leading-relaxed">{t(`uygunluq.tier_${tier}_desc`)}</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-100 fill-mode-both">
            <div className="grid sm:grid-cols-3 gap-4">
              <Score icon={Heart} label={t("home.demo_sevgi")} value={result.love} delay={100} />
              <Score icon={Users} label={t("uygunluq.dostluq")} value={result.friendship} delay={250} />
              <Score icon={MessageCircle} label={t("uygunluq.unsiyyet")} value={result.communication} delay={400} />
            </div>
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-3">{t("uygunluq.comment_heading")}</h2>
              <ul className="space-y-2 text-sm text-white/85">
                {result.notes.map((n, i) => {
                  const NoteIcon = NOTE_ICONS[n.kind];
                  return (
                    <li
                      key={n.kind}
                      className="flex gap-2.5 animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both"
                      style={{ animationDelay: `${i * 120}ms` }}
                    >
                      <NoteIcon className="size-4 text-gold shrink-0 mt-0.5" />
                      <span>{localizedSynastryNote(n, lang)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-12 grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-both">
            <NatalSnapshot
              chart={result.ca}
              label={`${t("uygunluq.snapshot_heading")} · ${a.name || t("uygunluq.first_person")}`}
              accent="gold"
            />
            <NatalSnapshot
              chart={result.cb}
              label={`${t("uygunluq.snapshot_heading")} · ${b.name || t("uygunluq.second_person")}`}
              accent="violet"
            />
          </div>

          {balanceA && balanceB && (
            <div className="lg:col-span-12 rounded-2xl bg-celestial-card/60 border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
              <h2 className="font-display text-2xl mb-4">{t("uygunluq.elements_heading")}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <ElementBar balance={balanceA} label={a.name || t("uygunluq.first_person")} delay={0} />
                <ElementBar balance={balanceB} label={b.name || t("uygunluq.second_person")} delay={150} />
              </div>
              {domA && domB && (
                <p className="mt-4 text-sm text-white/80 leading-relaxed">
                  {domA === domB
                    ? t("uygunluq.elements_match").replace("{el}", localizedElementName(domA, lang))
                    : t("uygunluq.elements_mismatch")
                        .replace("{a}", localizedElementName(domA, lang))
                        .replace("{b}", localizedElementName(domB, lang))}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {result && (
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h2 className="font-display text-2xl mb-4">{t("uygunluq.analysis_heading")}</h2>
          {plan.synastryFullDetail ? (
            <>
              <p className="text-xs text-mist mb-4 max-w-2xl">{t("uygunluq.extended_note")}</p>
              <div className="grid gap-4">
                {result.details.map((d, i) => (
                  <div
                    key={d.planet}
                    className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both hover:border-gold/20 hover:bg-celestial-card/80 transition-colors"
                    style={{ animationDelay: `${i * 70}ms` }}
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
              <div className="mt-6 flex justify-end">
                <ShareButtons title={t("uygunluq.share_title").replace("{n}", String(result.overall))} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-8 text-center">
              <Lock className="size-6 text-gold mx-auto animate-pulse [animation-duration:2.5s]" />
              <h3 className="font-display text-xl mt-3">{t("uygunluq.detay_kilidli_title")}</h3>
              <p className="text-sm text-mist mt-2 max-w-md mx-auto">{t("uygunluq.detay_kilidli_desc")}</p>
              <Link
                to="/paketler"
                className="inline-block mt-5 px-6 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft hover:scale-[1.03] transition"
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

function Score({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: typeof Heart;
  label: string;
  value: number;
  delay?: number;
}) {
  // Çəki zolağı qısa gecikmədən sonra 0-dan faktiki dəyərə dolur — kartlar
  // bir-bir "canlanaraq" görünür, hamısı eyni anda deyil.
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div
      className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both hover:border-gold/15 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5 text-mist text-xs mb-2">
        <Icon className="size-3.5" />
        {label}
      </div>
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
  accent = "gold",
}: {
  title: string;
  person: PersonForm;
  setPerson: (p: PersonForm) => void;
  locked?: boolean | undefined;
  lockedText?: string | undefined;
  accent?: "gold" | "violet";
}) {
  const { t } = useLanguage();
  const id = title.replace(/\s/g, "-");
  const borderClass = accent === "gold" ? "border-gold/10 hover:border-gold/25" : "border-violet/10 hover:border-violet/25";
  const glowClass = accent === "gold" ? "bg-gold/10" : "bg-violet/10";
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-celestial-card/60 border ${borderClass} p-6 space-y-4 transition-colors`}>
      <span className={`pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-3xl ${glowClass}`} />
      <h2 className="font-display text-xl relative">{title}</h2>
      {locked ? (
        <p className="text-sm text-mist relative">{lockedText}</p>
      ) : (
        <>
          <div className="relative">
            <label htmlFor={`${id}-name`} className="block text-xs text-mist mb-1.5">{t("uygunluq.ad_label")}</label>
            <input id={`${id}-name`} value={person.name} maxLength={60}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          </div>
          <div className="grid grid-cols-2 gap-3 relative">
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
          <div className="relative">
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
