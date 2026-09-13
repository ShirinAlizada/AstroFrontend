import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruh Astrolojiya — natal xəritə və horoskop platforması" },
      { name: "description", content: "Doğum məlumatlarına əsasən natal xəritə, günlük horoskop, uyğunluq təhlili, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:title", content: "Ruh Astrolojiya — Səmavi xəritən" },
      { property: "og:description", content: "Natal xəritə, horoskop, uyğunluq, astroloq rezervasiyası və tranzit jurnalı." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased">
      <SiteNav />


      {/* HERO APP SCREEN */}
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-6">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
          Bugünkü səmavi xəritən
        </p>
        <h1 className="font-display leading-[0.95] text-5xl md:text-7xl max-w-3xl">
          Yıldızlar bu gün <span className="text-goldsoft italic">səni</span>{" "}
          bəyana çağırır
        </h1>

        {/* the app screen */}
        <div className="mt-8 rounded-[28px] border border-white/10 bg-gradient-to-b from-ink2 to-ink p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="rounded-3xl bg-ink/60 p-5 md:p-7 grid lg:grid-cols-12 gap-5">
            {/* chart */}
            <div className="lg:col-span-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex flex-col items-center justify-between min-h-[300px]">
              <div className="self-start text-mist text-xs tracking-widest uppercase">
                Səmavi dialoq
              </div>
              <div className="relative size-56 grid place-items-center">
                <div className="absolute inset-0 rounded-full border border-violet/30"></div>
                <div className="absolute inset-5 rounded-full border border-violet/20"></div>
                <div className="absolute inset-10 rounded-full border border-gold/25"></div>
                <div className="text-center">
                  <div className="font-display text-4xl">Aslan</div>
                  <div className="text-gold text-xs tracking-widest uppercase mt-1">
                    Günəş · 14°
                  </div>
                </div>
                <span className="absolute top-2 text-gold text-lg">☀</span>
                <span className="absolute bottom-3 left-4 text-violet text-base">☾</span>
                <span className="absolute top-8 right-2 text-goldsoft text-base">♃</span>
                <span className="absolute bottom-8 right-6 text-mist text-base">♄</span>
              </div>
              <div className="self-start text-xs text-mist">
                Dünyada qoyulmuş · 14:02
              </div>
            </div>

            {/* forecast */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">
                <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-1">
                  Ümumi
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="size-2 rounded-full bg-gold"></span>
                    <span className="size-2 rounded-full bg-gold"></span>
                    <span className="size-2 rounded-full bg-gold"></span>
                    <span className="size-2 rounded-full bg-gold"></span>
                    <span className="size-2 rounded-full bg-white/15"></span>
                  </div>
                  <span className="text-sm text-mist">Qüvvə günündəsən</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                  Günəşin Aslanda olması özünə etimadı artırır. Səhər
                  saatlarında qərar ver, axşamı isə bir qapını yumşaq aç —
                  sevgi xəttində ay səninlədir.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
                  <div className="text-mist text-xs mb-2">Sevgi</div>
                  <div className="font-display text-3xl text-goldsoft">
                    92<span className="text-base text-mist">%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
                  <div className="text-mist text-xs mb-2">Karyera</div>
                  <div className="font-display text-3xl text-goldsoft">
                    78<span className="text-base text-mist">%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-4">
                  <div className="text-mist text-xs mb-2">Maliyyə</div>
                  <div className="font-display text-3xl text-goldsoft">
                    64<span className="text-base text-mist">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPATIBILITY STRIP */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-ink2/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="md:flex-1">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">
              Uyğunluq
            </p>
            <h2 className="font-display text-3xl">
              Ən uyğun əlamətin: Balıqlar
            </h2>
            <p className="text-mist text-sm mt-2">
              Ruhani dərinlikləriniz bir-birinə qarışır, sözsüz anlaşma təbii
              cərəyan edir.
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
                Uyğunluq
              </div>
            </div>
          </div>
          <Link
            to="/uygunluq"
            className="md:ml-auto text-sm px-5 py-3 rounded-full bg-gold text-ink font-semibold hover:bg-goldsoft transition"
          >
            Tam təhlil
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-4">Platforma</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: "/profil", t: "Profil və doğum məlumatı", d: "Doğum tarixi, dəqiq saat və yer əsasında şəxsi hesab." },
            { to: "/xerite", t: "Natal xəritə", d: "Günəş, Ay və planetlərin bürc və ev mövqeləri." },
            { to: "/horoskop", t: "Horoskop lentləri", d: "Günlük, həftəlik və aylıq proqnozlar." },
            { to: "/uygunluq", t: "Uyğunluq (sinastriya)", d: "İki xəritənin müqayisəsi və uyğunluq balı." },
            { to: "/astroloq", t: "Astroloq rezervasiyası", d: "Canlı və ya yazılı konsultasiya üçün vaxt seç." },
            { to: "/jurnal", t: "Tranzit jurnalı", d: "Əhvalını yaz, planet təsirlərini izlə." },
            { to: "/forum", t: "İcma forumu", d: "Tranzitlər və xəritə oxunuşları üzrə müzakirə." },
            { to: "/qezet", t: "Səmavi qəzet", d: "Astroloji məqalələr və təhlillər." },
          ].map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 hover:border-gold/30 transition"
            >
              <h3 className="font-display text-xl">{f.t}</h3>
              <p className="text-sm text-mist mt-1.5 leading-relaxed">{f.d}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-celestial-card/70 to-ink2 p-8 md:p-10 text-center">
          <h3 className="font-display text-3xl md:text-4xl">
            Doğum vaxtını yaz, natal xəritəni gör
          </h3>
          <p className="text-mist text-sm mt-3">Qeydiyyat pulsuzdur — xəritən dərhal hesablanır.</p>
          <Link
            to="/auth"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition"
          >
            Başla
          </Link>
        </div>
      </div>

    </div>
  );
}
