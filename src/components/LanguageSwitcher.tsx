import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/translations";

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]!;

  if (variant === "full") {
    return (
      <div className="flex items-center gap-1.5">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`px-2.5 py-1 rounded-full text-xs border transition ${
              l.code === lang
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-white/10 text-mist hover:text-white"
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("common.dil")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-white/10 bg-ink2/60 px-2 py-1 text-[11px] text-mist hover:text-white transition"
      >
        <Globe className="size-3" />
        {current.short}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-white/10 bg-ink2/95 backdrop-blur p-1.5 shadow-xl z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${
                l.code === lang ? "text-gold bg-white/5" : "text-white/85 hover:bg-white/5"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
