// Saytın tam domeni — SEO (Open Graph "og:url"/"og:image" tam linkləri və
// sitemap.xml) üçün TƏK yerdə saxlanılır. Layihə hələ öz domenində
// yayımlanmayıb, ona görə aşağıdakı dəyər PLACEHOLDER-dir — real domen
// (Lovable-in verdiyi "*.lovable.app" ünvanı və ya öz domeniniz) məlum
// olan kimi BURADA dəyişin; "public/sitemap.xml" də bu dəyərlə uyğunlaşdırılıb
// (sitemap statik fayldır, avtomatik yenilənmir — domen dəyişəndə əllə
// yeniləyin və ya build zamanı generasiya edən skript yazın).
export const SITE_URL = "https://virgoastrology.example.com";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
