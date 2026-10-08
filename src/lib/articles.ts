// Məqalə (qəzet) mətnləri: title/excerpt/body Supabase-də AZ-da saxlanılır.
// EN/RU tərcüməsi (title_en/ru, excerpt_en/ru, body_en/ru sütunları) yoxdursa
// UI avtomatik AZ mətninə qayıdır — naxış src/lib/shop.ts-dəki
// localizedName/localizedDescription ilə eynidir.
import type { Lang } from "@/lib/i18n/translations";

export interface LocalizableArticle {
  title: string;
  title_en?: string | null;
  title_ru?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  excerpt_ru?: string | null;
  body: string;
  body_en?: string | null;
  body_ru?: string | null;
}

export function localizedArticleTitle(a: Pick<LocalizableArticle, "title" | "title_en" | "title_ru">, lang: Lang): string {
  if (lang === "en") return a.title_en || a.title;
  if (lang === "ru") return a.title_ru || a.title;
  return a.title;
}

export function localizedArticleExcerpt(
  a: Pick<LocalizableArticle, "excerpt" | "excerpt_en" | "excerpt_ru">,
  lang: Lang,
): string | null {
  if (lang === "en") return a.excerpt_en || a.excerpt || null;
  if (lang === "ru") return a.excerpt_ru || a.excerpt || null;
  return a.excerpt ?? null;
}

export function localizedArticleBody(a: Pick<LocalizableArticle, "body" | "body_en" | "body_ru">, lang: Lang): string {
  if (lang === "en") return a.body_en || a.body;
  if (lang === "ru") return a.body_ru || a.body;
  return a.body;
}
