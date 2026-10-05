import type { Lang } from "@/lib/i18n/translations";
import { computeAspects, computeCurrentSky, DAY_RULERS_AZ, ELEMENTS, type AspectHit } from "@/lib/astrology";

/**
 * "Günün Bələdçisi" səhifəsinin data qatı — tam Qərb (tropik) astrologiyasına
 * əsaslanır: bugünkü Ay bürcü/ünsürü, klassik xaldey gün hakimi planeti və
 * cari planetlərarası real aspektlər (bax: astrology.ts-dəki computeCurrentSky/
 * computeAspects). Əvvəllər bu səhifə Vedik Pançanq sistemi (Tithi/Nakşatra/
 * Yoga/Karana, bax: köhnə panchang.ts/electional.ts) üzərində qurulmuşdu —
 * həmin fayllar tamamilə bu faylla əvəz olunub. Gün rəngi (həftənin gününə
 * bağlı sadə xüsusiyyət, Pançanqdan asılı olmayan) saxlanılıb.
 *
 * Kateqoriya adı/izah mətni burada deyil, translations.ts-də saxlanılır —
 * bu fayl yalnız hansı açarın (və hansı parametrlərlə: {planet1}/{planet2}/
 * {aspect}/{dayRuler}/{moonSign}) istifadə olunacağını seçir. Parametrlər
 * daxili Azərbaycanca açar olaraq qalır — UI komponenti (gunun-beledcisi.tsx)
 * onları `localizedBodyName`/`localizedSignName`/`localizedAspectName` ilə
 * dilə uyğun göstərir (digər səhifələrdə artıq qurulmuş nümunə).
 */

export type Verdict = "əlverişli" | "neytral" | "ehtiyatlı ol";

export interface GuidanceItem {
  categoryKey: string;
  verdict: Verdict;
  reasonKey: string;
  reasonParams: Record<string, string>;
}

const DAY_COLORS_AZ: Record<number, string> = {
  0: "Qırmızı", // Bazar — Günəş
  1: "Ağ", // Bazar ertəsi — Ay
  2: "Al-qırmızı", // Çərşənbə axşamı — Mars
  3: "Yaşıl", // Çərşənbə — Merkuri
  4: "Sarı", // Cümə axşamı — Yupiter
  5: "Açıq mavi", // Cümə — Venera
  6: "Tünd göy", // Şənbə — Saturn
};

/** Gün rənglərinin dil tərcümələri — daxili açar Azərbaycanca qalır (`DAY_COLORS_AZ`). */
const DAY_COLOR_TRANSLATIONS: Record<string, Record<Lang, string>> = {
  "Qırmızı": { az: "Qırmızı", en: "Red", ru: "Красный" },
  "Ağ": { az: "Ağ", en: "White", ru: "Белый" },
  "Al-qırmızı": { az: "Al-qırmızı", en: "Crimson", ru: "Алый" },
  "Yaşıl": { az: "Yaşıl", en: "Green", ru: "Зелёный" },
  "Sarı": { az: "Sarı", en: "Yellow", ru: "Жёлтый" },
  "Açıq mavi": { az: "Açıq mavi", en: "Light blue", ru: "Светло-голубой" },
  "Tünd göy": { az: "Tünd göy", en: "Dark blue", ru: "Тёмно-синий" },
};

/** Verilmiş gün rənginin (daxili Azərbaycanca açar) seçilmiş dildəki adını qaytarır. */
export function localizedDayColor(colorAz: string, lang: Lang): string {
  return DAY_COLOR_TRANSLATIONS[colorAz]?.[lang] ?? colorAz;
}

interface CategoryDef {
  /** Kateqoriya adının tərcümə açarı — mövcud "Sevgi/Karyera/Maliyyə" açarları horoskop.tsx ilə paylaşılır. */
  categoryKey: string;
  reasonPrefix: string;
  /** Bu kateqoriyanı idarə edən iki klassik hakim planet (daxili Azərbaycanca ad). */
  planets: readonly [string, string];
}

const CATEGORIES: CategoryDef[] = [
  { categoryKey: "home.demo_sevgi", reasonPrefix: "beledci.reason_sevgi", planets: ["Venera", "Ay"] },
  { categoryKey: "home.demo_karyera", reasonPrefix: "beledci.reason_karyera", planets: ["Günəş", "Saturn"] },
  { categoryKey: "home.demo_maliyye", reasonPrefix: "beledci.reason_maliyye", planets: ["Yupiter", "Venera"] },
  { categoryKey: "beledci.cat_saglamliq", reasonPrefix: "beledci.reason_saglamliq", planets: ["Mars", "Ay"] },
];

/** Harmonik aspektlər (konyunksiya, sekstil, trigon) — əlverişli sayılır; qalan iki əsas aspekt (kvadrat, oppozisiya) gərgindir. */
const FAVORABLE_ASPECT_KEYS = new Set(["conjunction", "sextile", "trine"]);

function findAspect(hits: AspectHit[], p1: string, p2: string): AspectHit | undefined {
  return hits.find((h) => (h.a === p1 && h.b === p2) || (h.a === p2 && h.b === p1));
}

export interface DailyGuideContext {
  weekday: number; // 0-6
  dayRuler: string;
  dayColor: string;
  moonSign: string;
  moonElement: string;
  moonDegree: number;
  moonMinute: number;
  /** Bugünkü bütün planetlər arasındaki əsas aspektlər (orb daxilində), orba görə sıralanmış. */
  aspects: AspectHit[];
}

/** Bugünkü (Bakı vaxtı üzrə) astroloji kontekst — kartlarda və tövsiyələrdə bir dəfə hesablanıb paylaşılır. */
export function computeDailyGuideContext(): DailyGuideContext {
  const sky = computeCurrentSky();
  const aspects = computeAspects(sky);
  const weekday = new Date().getDay();
  const moonPlanet = sky.planets.find((p) => p.name === "Ay");

  return {
    weekday,
    dayRuler: DAY_RULERS_AZ[weekday] ?? "Günəş",
    dayColor: DAY_COLORS_AZ[weekday] ?? "Ağ",
    moonSign: sky.moon,
    moonElement: ELEMENTS[sky.moon] ?? "Od",
    moonDegree: moonPlanet?.degree ?? 0,
    moonMinute: moonPlanet?.minute ?? 0,
    aspects,
  };
}

/**
 * Hər kateqoriya üçün: əgər onun iki hakim planeti arasında bugün real bir
 * aspekt varsa, əlverişlilik aspektin növünə görə (harmonik/gərgin) təyin
 * olunur. Əks halda, bugünkü gün hakimi planeti həmin kateqoriyanın
 * planetlərindən birisidirsə "əlverişli", deyilsə "neytral" sayılır.
 */
export function dailyGuidance(ctx: DailyGuideContext): GuidanceItem[] {
  return CATEGORIES.map(({ categoryKey, reasonPrefix, planets }) => {
    const [p1, p2] = planets;
    const hit = findAspect(ctx.aspects, p1, p2);
    const baseParams = { planet1: p1, planet2: p2, dayRuler: ctx.dayRuler, moonSign: ctx.moonSign };

    if (hit) {
      const favorable = FAVORABLE_ASPECT_KEYS.has(hit.aspect.key);
      const verdict: Verdict = favorable ? "əlverişli" : "ehtiyatlı ol";
      return {
        categoryKey,
        verdict,
        reasonKey: `${reasonPrefix}_${favorable ? "elverisli" : "ehtiyatli"}_aspekt`,
        reasonParams: { ...baseParams, aspect: hit.aspect.nameAz },
      };
    }

    if (ctx.dayRuler === p1 || ctx.dayRuler === p2) {
      return { categoryKey, verdict: "əlverişli" as const, reasonKey: `${reasonPrefix}_elverisli_gun`, reasonParams: baseParams };
    }

    return { categoryKey, verdict: "neytral" as const, reasonKey: `${reasonPrefix}_neytral`, reasonParams: baseParams };
  });
}
