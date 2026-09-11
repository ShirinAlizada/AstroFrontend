import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { BODY_SYMBOLS, SIGN_SYMBOLS, type NatalChart } from "@/lib/astrology";

export const Route = createFileRoute("/_authenticated/xerite")({
  head: () => ({
    meta: [
      { title: "Natal xəritəm — Ruh Astrolojiya" },
      { name: "description", content: "Günəş, Ay və planetlərin bürc və ev mövqeləri ilə şəxsi natal xəritən." },
      { property: "og:title", content: "Natal xəritəm — Ruh Astrolojiya" },
      { property: "og:description", content: "Planet mövqeləri və evlər üzrə şəxsi natal xəritə." },
    ],
  }),
  component: ChartPage,
});

function ChartPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["natal-chart"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("natal_charts")
        .select("chart")
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.chart as unknown as NatalChart) ?? null;
    },
  });

  return (
    <Page>
      <PageHeader
        kicker="Natal xəritə"
        title="Doğum anındakı səma"
        subtitle="Planetlərin bürclər və evlər üzrə mövqeyi real astronomik hesablama ilə çıxarılıb."
      />

      {isLoading && <p className="text-mist">Yüklənir…</p>}

      {!isLoading && !data && (
        <div className="rounded-2xl border border-white/10 bg-celestial-card/60 p-8 text-center">
          <p className="text-mist">Xəritəni görmək üçün doğum məlumatlarını daxil et.</p>
          <Link to="/profil" className="inline-block mt-4 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            Profilə keç
          </Link>
        </div>
      )}

      {data && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
            <div className="relative aspect-square max-w-sm mx-auto grid place-items-center">
              <div className="absolute inset-0 rounded-full border border-violet/30" />
              <div className="absolute inset-6 rounded-full border border-violet/20" />
              <div className="absolute inset-12 rounded-full border border-gold/25" />
              {data.planets.slice(0, 10).map((p, i) => {
                const angle = (i / Math.min(data.planets.length, 10)) * 2 * Math.PI;
                const r = 44;
                const x = 50 + r * Math.cos(angle - Math.PI / 2);
                const y = 50 + r * Math.sin(angle - Math.PI / 2);
                return (
                  <span
                    key={p.name}
                    title={`${p.name} · ${p.sign}`}
                    className="absolute text-goldsoft text-lg -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {BODY_SYMBOLS[p.name] ?? "•"}
                  </span>
                );
              })}
              <div className="text-center">
                <div className="font-display text-4xl">{data.sun}</div>
                <div className="text-gold text-xs tracking-widest uppercase mt-1">Günəş bürcü</div>
                <div className="text-mist text-xs mt-3">Yüksələn · {data.ascendant.sign}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">Planet mövqeləri</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {data.planets.map((p) => (
                  <div key={p.name} className="flex items-center justify-between border-b border-white/5 py-1.5">
                    <span className="text-mist">
                      {BODY_SYMBOLS[p.name] ?? "•"} {p.name}
                    </span>
                    <span>
                      {SIGN_SYMBOLS[p.sign] ?? ""} {p.sign} {p.degree}°
                      {p.house ? <span className="text-mist"> · {p.house}. ev</span> : null}
                      {p.retrograde ? <span className="text-violet"> ℞</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">Evlər</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {data.houses.map((h) => (
                  <div key={h.index} className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-mist text-xs">{h.index}. ev</div>
                    <div>
                      {SIGN_SYMBOLS[h.sign] ?? ""} {h.sign} {h.degree}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
