import type { Lang } from "@/lib/i18n/translations";

const MONTHS: Record<Lang, string[]> = {
  az: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};

/**
 * "26 sentyabr 2026" tərzində tarix formatlaşdırması.
 *
 * `toLocaleDateString(locale, { month: "long" })` bəzi mühitlərdə (məsələn,
 * tam ICU verilənləri olmayan Node/brauzer qurğuları) "az-AZ" kimi az
 * istifadə olunan locale-lər üçün ay adını düzgün göstərə bilmir və "2026
 * M09 26" kimi xarab fallback pattern-i sızdırır. Bu funksiya ay adlarını
 * özü təmin edir, ona görə hansı mühitdə işlədiyindən asılı olmayaraq
 * həmişə düzgün nəticə verir.
 */
export function formatLongDate(date: Date, lang: Lang): string {
  const day = date.getDate();
  const month = MONTHS[lang][date.getMonth()] ?? "";
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
