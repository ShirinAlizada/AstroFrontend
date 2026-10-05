import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { NatalWheel } from "@/components/NatalWheel";
import {
  BODY_SYMBOLS,
  SIGN_SYMBOLS,
  computeAspects,
  formatDegree,
  localizedAspectName,
  localizedBodyName,
  localizedSignName,
  type NatalChart,
} from "@/lib/astrology";

export const Route = createFileRoute("/_authenticated/xerite")({
  head: () => ({
    meta: [
      { title: "Natal xəritəm — Virgo Astrology" },
      { name: "description", content: "Günəş, Ay və planetlərin bürc və ev mövqeləri ilə şəxsi natal xəritən." },
      { property: "og:title", content: "Natal xəritəm — Virgo Astrology" },
      { property: "og:description", content: "Planet mövqeləri, evlər və aspektlər üzrə şəxsi natal xəritə." },
    ],
  }),
  component: ChartPage,
});

/** SVG natal xəritəsini kətan (canvas) üzərindən PNG şəklinə çevirib endirir — heç bir əlavə kitabxana tələb etmir. */
async function downloadSvgAsPng(svgEl: SVGSVGElement, fileName: string) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const size = 880; // 2x — Retina keyfiyyəti
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas context");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("toBlob"));
            return;
          }
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(link.href);
          resolve();
        }, "image/png");
      } catch (err) {
        reject(err instanceof Error ? err : new Error("render"));
      }
    };
    img.onerror = () => reject(new Error("image load"));
    img.src = url;
  });
}

function ChartPage() {
  const { t, lang } = useLanguage();
  const chartWrapperRef = useRef<HTMLDivElement>(null);
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

  const aspects = data ? computeAspects(data) : [];

  function handleDownloadImage() {
    const svgEl = chartWrapperRef.current?.querySelector("svg");
    if (!svgEl) return;
    downloadSvgAsPng(svgEl, `natal-xerite-${data?.sun ?? "chart"}.png`).catch(() => {
      toast.error(t("xerite.download_error"));
    });
  }

  function handleDownloadPdf() {
    window.print();
  }

  return (
    <Page>
      <PageHeader
        kicker={t("page.xerite.kicker")}
        title={t("page.xerite.title")}
        subtitle={t("page.xerite.subtitle")}
      />

      {isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}

      {!isLoading && !data && (
        <div className="rounded-2xl border border-white/10 bg-celestial-card/60 p-8 text-center">
          <p className="text-mist">{t("xerite.no_chart")}</p>
          <Link to="/profil" className="inline-block mt-4 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            {t("xerite.go_profile")}
          </Link>
        </div>
      )}

      {data && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
            <div ref={chartWrapperRef} className="aspect-square max-w-sm mx-auto">
              <NatalWheel chart={data} />
            </div>
            <div className="text-center mt-4">
              <div className="font-display text-2xl">{localizedSignName(data.sun, lang)}</div>
              <div className="text-gold text-xs tracking-widest uppercase mt-1">{t("common.gunes_burcu")}</div>
              <div className="text-mist text-xs mt-2">
                {t("common.yukselen")} · {localizedSignName(data.ascendant.sign, lang)} {formatDegree(data.ascendant.degree, data.ascendant.minute ?? 0)}
                &nbsp;·&nbsp; MC · {localizedSignName(data.midheaven.sign, lang)} {formatDegree(data.midheaven.degree, data.midheaven.minute ?? 0)}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
              >
                <Download className="size-3.5" />
                {t("xerite.download_image_button")}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full border border-white/10 text-mist hover:text-white transition"
              >
                <Printer className="size-3.5" />
                {t("xerite.download_pdf_button")}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.planets_heading")}</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {data.planets.map((p) => (
                  <div key={p.name} className="flex items-center justify-between border-b border-white/5 py-1.5">
                    <span className="text-mist">
                      {BODY_SYMBOLS[p.name] ?? "•"} {localizedBodyName(p.name, lang)}
                    </span>
                    <span>
                      {SIGN_SYMBOLS[p.sign] ?? ""} {localizedSignName(p.sign, lang)} {formatDegree(p.degree, p.minute ?? 0)}
                      {p.house ? <span className="text-mist"> · {t("common.ev_n").replace("{n}", String(p.house))}</span> : null}
                      {p.retrograde ? <span className="text-violet"> ℞</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.houses_heading")}</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {data.houses.map((h) => (
                  <div key={h.index} className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-mist text-xs">{t("common.ev_n").replace("{n}", String(h.index))}</div>
                    <div>
                      {SIGN_SYMBOLS[h.sign] ?? ""} {localizedSignName(h.sign, lang)} {formatDegree(h.degree, h.minute ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
              <h2 className="font-display text-2xl mb-4">{t("xerite.aspects_heading")}</h2>
              {aspects.length === 0 && <p className="text-mist text-sm">{t("xerite.no_aspects")}</p>}
              <div className="grid gap-1.5">
                {aspects.map((hit, i) => (
                  <div
                    key={`${hit.a}-${hit.b}-${i}`}
                    className="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-goldsoft">{BODY_SYMBOLS[hit.a] ?? hit.a}</span>
                      <span style={{ color: hit.aspect.color }}>{hit.aspect.symbol}</span>
                      <span className="text-violet">{BODY_SYMBOLS[hit.b] ?? hit.b}</span>
                      <span className="text-mist text-xs ml-1">
                        {localizedBodyName(hit.a, lang)} {localizedAspectName(hit.aspect.nameAz, lang).toLowerCase()} {localizedBodyName(hit.b, lang)}
                      </span>
                    </span>
                    <span className="text-mist text-xs">{t("xerite.orb_n").replace("{n}", String(hit.orb))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div id="chart-print-area" className="hidden print:block p-8 text-black bg-white">
          <h1 className="text-2xl font-bold mb-1">{t("page.xerite.title")}</h1>
          <p className="text-sm text-gray-600 mb-6">Virgo Astrology</p>

          <div className="flex gap-6 items-start mb-6">
            <div className="w-64 shrink-0">
              <NatalWheel chart={data} />
            </div>
            <div className="text-sm">
              <div className="text-lg font-semibold">{localizedSignName(data.sun, lang)}</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">{t("common.gunes_burcu")}</div>
              <div className="text-xs text-gray-600 mt-2">
                {t("common.yukselen")} · {localizedSignName(data.ascendant.sign, lang)} {formatDegree(data.ascendant.degree, data.ascendant.minute ?? 0)}
                &nbsp;·&nbsp; MC · {localizedSignName(data.midheaven.sign, lang)} {formatDegree(data.midheaven.degree, data.midheaven.minute ?? 0)}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-4 mb-2">{t("xerite.planets_heading")}</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-4">
            {data.planets.map((p) => (
              <div key={p.name} className="flex items-center justify-between border-b border-gray-200 py-1">
                <span>
                  {BODY_SYMBOLS[p.name] ?? "•"} {localizedBodyName(p.name, lang)}
                </span>
                <span>
                  {SIGN_SYMBOLS[p.sign] ?? ""} {localizedSignName(p.sign, lang)} {formatDegree(p.degree, p.minute ?? 0)}
                  {p.house ? ` · ${t("common.ev_n").replace("{n}", String(p.house))}` : ""}
                  {p.retrograde ? " ℞" : ""}
                </span>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mt-4 mb-2">{t("xerite.houses_heading")}</h2>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            {data.houses.map((h) => (
              <div key={h.index}>
                <span className="text-gray-500">{t("common.ev_n").replace("{n}", String(h.index))}:</span>{" "}
                {SIGN_SYMBOLS[h.sign] ?? ""} {localizedSignName(h.sign, lang)} {formatDegree(h.degree, h.minute ?? 0)}
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mt-4 mb-2">{t("xerite.aspects_heading")}</h2>
          <div className="text-sm space-y-1">
            {aspects.map((hit, i) => (
              <div key={`p-${hit.a}-${hit.b}-${i}`}>
                {localizedBodyName(hit.a, lang)} {hit.aspect.symbol} {localizedBodyName(hit.b, lang)} — {localizedAspectName(hit.aspect.nameAz, lang).toLowerCase()} ({t("xerite.orb_n").replace("{n}", String(hit.orb))})
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
