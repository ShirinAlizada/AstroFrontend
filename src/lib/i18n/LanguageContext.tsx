import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TRANSLATIONS, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "virgo-astrology-lang";

function isLang(v: unknown): v is Lang {
  return v === "az" || v === "en" || v === "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR və ilkin client render həmişə "az" ilə başlayır ki, hidratasiya
  // uyğunsuzluğu olmasın; saxlanmış seçim mount-dan sonra tətbiq olunur.
  const [lang, setLangState] = useState<Lang>("az");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
    } catch {
      // localStorage əlçatan deyilsə, defolt dildə davam et
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // yaddaşa yazıla bilmirsə problem deyil — sessiya daxilində işləyəcək
    }
  }

  function t(key: string): string {
    const dict = TRANSLATIONS[lang];
    return dict[key] ?? TRANSLATIONS.az[key] ?? key;
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage LanguageProvider daxilində istifadə olunmalıdır");
  return ctx;
}
