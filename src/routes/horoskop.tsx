import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { SIGNS_AZ, SIGN_SYMBOLS } from "@/lib/astrology";

export const Route = createFileRoute("/horoskop")({
  head: () => ({
    meta: [
      { title: "Horoskop — günlük, həftəlik, aylıq | Ruh Astrolojiya" },
      { name: "description", content: "12 bürc üçün günlük, həftəlik və aylıq horoskop: sevgi, karyera və maliyyə proqnozları." },
      { property: "og:title", content: "Horoskop — günlük, həftəlik, aylıq" },
      { property: "og:description", content: "12 bürc üçün günlük, həftəlik və aylıq astroloji proqnozlar." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HoroscopePage,
});

const PERIODS = [
  { key: "daily", label: "Günlük" },
  { key: "weekly", label: "Həftəlik" },
  { key: "monthly", label: "Aylıq" },
] as const;

function HoroscopePage() {
  const [sign, setSign] = useState<string>("Aslan");
  const [period, setPeriod] = useState<string>("daily");

  const { data, isLoading } = useQuery({
    queryKey: ["horoscope", sign, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horoscopes")
        .select("*")
        .eq("sign", sign)
        .eq("period", period)
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <Page>
      <PageHeader
        kicker="Horoskop"
        title="Bürcünü seç, səmanı oxu"
        subtitle="Günlük, həftəlik və aylıq proqnozlar sevgi, karyera və maliyyə göstəriciləri ilə birlikdə."
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {SIGNS_AZ.map((s) => (
          <button key={s} type="button" onClick={() => setSign(s)}
            className={`rounded-2xl border p-4 text-center transition ${
              sign === s ? "border-gold bg-gold/10" : "border-white/10 bg-celestial-card/40 hover:border-gold/40"
            }`}>
            <div className="text-2xl text-goldsoft">{SIGN_SYMBOLS[s]}</div>
            <div className="text-xs mt-1.5 text-mist">{s}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {PERIODS.map((p) => (
          <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
            className={`text-sm px-5 py-2 rounded-full border transition ${
              period === p.key ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-ink2 to-ink p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl text-gold">{SIGN_SYMBOLS[sign]}</span>
          <div>
            <h2 className="font-display text-3xl">{sign}</h2>
            <p className="text-mist text-xs tracking-widest uppercase">
              {PERIODS.find((p) => p.key === period)?.label} proqnoz
            </p>
          </div>
        </div>

        {isLoading && <p className="text-mist mt-6">Yüklənir…</p>}
        {!isLoading && !data && <p className="text-mist mt-6">Bu dövr üçün proqnoz hələ hazır deyil.</p>}

        {data && (
          <>
            <p className="mt-5 text-[15px] leading-relaxed text-white/85 max-w-3xl">{data.content}</p>
            <div className="grid grid-cols-3 gap-3 mt-6 max-w-xl">
              <Meter label="Sevgi" value={data.love} />
              <Meter label="Karyera" value={data.career} />
              <Meter label="Maliyyə" value={data.finance} />
            </div>
          </>
        )}
      </section>
    </Page>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
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
