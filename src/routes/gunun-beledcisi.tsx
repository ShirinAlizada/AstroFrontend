import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { CITIES, type NatalChart } from "@/lib/astrology";
import { computePanchang, NAKSHATRAS_AZ, type PanchangToday } from "@/lib/panchang";
import { dailyGuidance, type Verdict } from "@/lib/electional";

export const Route = createFileRoute("/gunun-beledcisi")({
  head: () => ({
    meta: [
      { title: "Günün Bələdçisi — Virgo Astrology" },
      { name: "description", content: "Vedik Pançanq (tithi, nakşatra, yoga, karana) əsasında bugünkü elektiv-astrologiya bələdçisi." },
      { property: "og:title", content: "Günün Bələdçisi — Virgo Astrology" },
      { property: "og:description", content: "Bugün nə etmək, nəyə ehtiyatlı yanaşmaq lazım olduğuna dair real Pançanq hesablaması." },
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

// klassik Tara-bala dövrü: doğum nakşatrasından bugünkü nakşatraya qədər sayılan mövqe
const TARA_NAMES = [
  { name: "Canma", noteKey: "beledci.tara_canma_note" },
  { name: "Sampat", noteKey: "beledci.tara_sampat_note" },
  { name: "Vipat", noteKey: "beledci.tara_vipat_note" },
  { name: "Kşema", noteKey: "beledci.tara_ksema_note" },
  { name: "Pratyak", noteKey: "beledci.tara_pratyak_note" },
  { name: "Sadhaka", noteKey: "beledci.tara_sadhaka_note" },
  { name: "Vadha", noteKey: "beledci.tara_vadha_note" },
  { name: "Mitra", noteKey: "beledci.tara_mitra_note" },
  { name: "Parama Mitra", noteKey: "beledci.tara_parama_note" },
];

function taraFor(birthNakIndex: number, todayNakIndex: number) {
  const diff = ((todayNakIndex - birthNakIndex + 27) % 27) + 1; // 1..27
  const taraIdx = (diff - 1) % 9; // 0..8
  return TARA_NAMES[taraIdx]!;
}

const VERDICT_KEY: Record<Verdict, string> = {
  "əlverişli": "beledci.verdict_elverisli",
  "neytral": "beledci.verdict_neytral",
  "ehtiyatlı ol": "beledci.verdict_ehtiyatli",
};

function GuidePage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: chart } = useQuery({
    queryKey: ["my-chart-guide", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("natal_charts").select("chart").eq("user_id", user!.id).maybeSingle();
      return (data?.chart as unknown as NatalChart) ?? null;
    },
  });

  const baku = CITIES[0]!;
  const panchang: PanchangToday = useMemo(() => computePanchang(new Date(), baku.lat, baku.lon), [baku.lat, baku.lon]);
  const guidance = useMemo(() => dailyGuidance(panchang), [panchang]);
  const weekdayName = t(`beledci.weekday_${panchang.weekday}`);

  return (
    <Page>
      <PageHeader
        kicker={t("page.beledci.kicker")}
        title={t("page.beledci.title")}
        subtitle={t("page.beledci.subtitle")}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <PanchangCard label="Tithi" value={panchang.tithiName} sub={`${panchang.paksha} paksha · ${panchang.tithiType}`} />
        <PanchangCard label="Vara" value={weekdayName} sub={`${t("beledci.color_prefix")}: ${panchang.dayColor}`} />
        <PanchangCard label="Nakşatra" value={panchang.nakshatraName} sub={panchang.nakshatraQuality} />
        <PanchangCard label="Yoga" value={panchang.yogaName} sub="" />
        <PanchangCard label="Karana" value={panchang.karanaName} sub="" />
      </div>

      {user && chart && (
        <TaraSection birthChart={chart} todayNakIndex={panchang.nakshatraIndex} />
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">{t("beledci.today_heading")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {guidance.map((g) => (
            <div key={g.category} className={`rounded-2xl border p-5 ${VERDICT_STYLE[g.verdict]}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg text-white">{g.category}</h3>
                <span className="text-xs uppercase tracking-widest">{t(VERDICT_KEY[g.verdict])}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{g.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-mist max-w-2xl">{t("beledci.footnote")}</p>
    </Page>
  );
}

function PanchangCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
      <div className="text-mist text-xs tracking-[0.25em] uppercase mb-2">{label}</div>
      <div className="font-display text-xl text-goldsoft">{value}</div>
      {sub && <div className="text-xs text-mist mt-1">{sub}</div>}
    </div>
  );
}

function TaraSection({ birthChart, todayNakIndex }: { birthChart: NatalChart; todayNakIndex: number }) {
  const { t } = useLanguage();
  // Doğum anındakı Ayın sidereal nakşatrasını tapmaq üçün natal Ay bürc+dərəcəsindən
  // təxmini sidereal mövqe çıxarılır (tropikdən Lahiri ayanamsası qədər geri sürüşdürülür).
  const moonPlanet = birthChart.planets.find((p) => p.name === "Ay");
  if (!moonPlanet) return null;

  const signIdx = ["Qoç", "Buğa", "Əkizlər", "Xərçəng", "Aslan", "Qız", "Tərəzi", "Əqrəb", "Oxatan", "Oğlaq", "Dolça", "Balıqlar"].indexOf(moonPlanet.sign);
  const tropicalLon = signIdx * 30 + moonPlanet.degree;
  const siderealLon = ((tropicalLon - 24) % 360 + 360) % 360; // təxmini ayanamsa
  const birthNakIndex = Math.floor(siderealLon / (360 / 27)) % 27;

  const tara = taraFor(birthNakIndex, todayNakIndex);
  const birthNak = NAKSHATRAS_AZ[birthNakIndex]!;

  return (
    <section className="mt-8 rounded-2xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-6">
      <h2 className="font-display text-xl mb-1">{t("beledci.tara_heading")}</h2>
      <p className="text-mist text-sm mb-4">{t("beledci.tara_desc").replace("{nak}", birthNak.name)}</p>
      <div className="flex items-center gap-4">
        <span className="font-display text-3xl text-gold">{tara.name}</span>
        <span className="text-sm text-white/80">{t(tara.noteKey)}</span>
      </div>
    </section>
  );
}
