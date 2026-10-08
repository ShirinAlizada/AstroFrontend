// Horoskop proqnoz mətni (content) Supabase-də AZ-da saxlanılır. EN/RU
// tərcüməsi (content_en/content_ru sütunları) yoxdursa UI avtomatik AZ
// mətninə qayıdır — naxış src/lib/shop.ts-dəki localizedName/
// localizedDescription ilə eynidir.
import type { Lang } from "@/lib/i18n/translations";

export function localizedHoroscopeContent(
  row: { content: string; content_en?: string | null; content_ru?: string | null },
  lang: Lang,
): string {
  if (lang === "en") return row.content_en || row.content;
  if (lang === "ru") return row.content_ru || row.content;
  return row.content;
}
