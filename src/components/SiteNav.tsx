import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, ShoppingCart, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Lang } from "@/lib/i18n/translations";
import { localizedArticleTitle } from "@/lib/articles";
import { localizedName } from "@/lib/shop";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useMenu } from "@/hooks/useMenu";

// Qlobal axtarış saytın bütün açıq (public) məzmun növlərini əhatə edir:
// məqalələr (başlıq+qısa təsvir+tam mətn, hər 3 dildə), astroloqlar
// (ad+bio), mağaza məhsulları (ad+təsvir, hər 3 dildə) və forum mövzuları
// (başlıq+mətn). Əvvəlki versiya yalnız məqalə BAŞLIĞINI (yalnız AZ sütunu)
// və astroloqları axtarırdı — "full_name" sütunu isə ümumiyyətlə mövcud
// deyildi (əsl sütun "display_name"dir), ona görə astroloq axtarışı həmişə
// səssizcə uğursuz olurdu (PostgREST 400, udma nəticəsində boş nəticə).
type SearchHit =
  | { kind: "article"; slug: string; title: string; title_en: string | null; title_ru: string | null }
  | { kind: "astrologer"; name: string }
  | { kind: "product"; slug: string; name: string; nameEn: string | null; nameRu: string | null }
  | { kind: "forum"; topicId: string; title: string };

function orIlike(columns: string[], q: string): string {
  return columns.map((c) => `${c}.ilike.%${q}%`).join(",");
}

function useSiteSearch(term: string) {
  return useQuery({
    queryKey: ["site-search", term],
    enabled: term.trim().length >= 2,
    queryFn: async (): Promise<SearchHit[]> => {
      const q = term.trim();
      const [articlesRes, astrologersRes, productsRes, topicsRes] = await Promise.all([
        supabase
          .from("articles")
          .select("slug, title, title_en, title_ru")
          .eq("published", true)
          .or(orIlike(["title", "title_en", "title_ru", "excerpt", "excerpt_en", "excerpt_ru", "body", "body_en", "body_ru"], q))
          .limit(6),
        supabase
          .from("astrologers")
          .select("id, display_name, bio")
          .or(orIlike(["display_name", "bio"], q))
          .limit(4),
        supabase
          .from("shop_products")
          .select("slug, name, name_en, name_ru, description, description_en, description_ru")
          .eq("is_active", true)
          .or(orIlike(["name", "name_en", "name_ru", "description", "description_en", "description_ru"], q))
          .limit(4),
        supabase
          .from("forum_topics")
          .select("id, title, body")
          .eq("is_hidden", false)
          .or(orIlike(["title", "body"], q))
          .limit(4),
      ]);

      const hits: SearchHit[] = [];
      for (const a of articlesRes.data ?? []) {
        hits.push({ kind: "article", slug: a.slug, title: a.title, title_en: a.title_en, title_ru: a.title_ru });
      }
      for (const a of astrologersRes.data ?? []) {
        hits.push({ kind: "astrologer", name: a.display_name });
      }
      for (const p of productsRes.data ?? []) {
        hits.push({ kind: "product", slug: p.slug, name: p.name, nameEn: p.name_en, nameRu: p.name_ru });
      }
      for (const ft of topicsRes.data ?? []) {
        hits.push({ kind: "forum", topicId: ft.id, title: ft.title });
      }
      return hits.slice(0, 12);
    },
  });
}

function hitLabel(h: SearchHit, lang: Lang): string {
  switch (h.kind) {
    case "article":
      return localizedArticleTitle(h, lang);
    case "astrologer":
      return h.name;
    case "product":
      return localizedName({ name: h.name, nameEn: h.nameEn, nameRu: h.nameRu }, lang);
    case "forum":
      return h.title;
  }
}

function hitDestination(h: SearchHit): { to: "/qezet/$slug" | "/astroloq" | "/tarot" | "/forum/$topicId"; params?: Record<string, string> } {
  switch (h.kind) {
    case "article":
      return { to: "/qezet/$slug", params: { slug: h.slug } };
    case "astrologer":
      return { to: "/astroloq" };
    case "product":
      return { to: "/tarot" };
    case "forum":
      return { to: "/forum/$topicId", params: { topicId: h.topicId } };
  }
}

function hitSubtitle(h: SearchHit, t: (key: string) => string): string {
  switch (h.kind) {
    case "article":
      return t("nav.meqale");
    case "astrologer":
      return t("nav.astroloqlar");
    case "product":
      return t("nav.magaza");
    case "forum":
      return t("nav.forum");
  }
}

function SearchBox() {
  const { t, lang } = useLanguage();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const { data: hits, isFetching } = useSiteSearch(debounced);
  const showDropdown = focused && debounced.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative hidden sm:block">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink2/60 px-2.5 py-1.5">
        <Search className="size-3.5 text-mist shrink-0" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t("common.axtar")}
          className="w-28 lg:w-44 bg-transparent text-sm text-white placeholder:text-mist outline-none"
        />
      </div>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-ink2/95 backdrop-blur p-2 shadow-xl z-50">
          {isFetching && <p className="px-3 py-2 text-xs text-mist">{t("common.axtarilir")}</p>}
          {!isFetching && (hits?.length ?? 0) === 0 && (
            <p className="px-3 py-2 text-xs text-mist">{t("common.netice_tapilmadi")}</p>
          )}
          {!isFetching &&
            hits?.map((h, i) => {
              const dest = hitDestination(h);
              return (
                <Link
                  key={i}
                  to={dest.to}
                  params={dest.params as never}
                  onClick={() => {
                    setFocused(false);
                    setTerm("");
                  }}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5"
                >
                  <span className="text-white">{hitLabel(h, lang)}</span>
                  <span className="ml-2 text-xs text-mist">{hitSubtitle(h, t)}</span>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}

/**
 * Yığcam yuxarı zolaq: loqo, axtarış, dil düyməsi və giriş/çıxış.
 * Bütün bölmə keçidləri Sidebar-a köçürülüb — sabit sol panel yoxdur, bütün
 * ekranlarda (masaüstü daxil) yeganə giriş nöqtəsi bu komponentdəki menyu
 * düyməsidir, o da Sidebar-ı çəkmə (drawer) şəklində açır.
 */
export function SiteNav() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const { totalCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  // Menyunun açıq/bağlı vəziyyəti indi qlobal bir mağazadadır (bax: menu-store.ts) —
  // beləcə Page.tsx / index.tsx / metnu.tsx kimi hər tərtibat öz əsas məzmununu
  // (heç bir prop ötürmədən) eyni vəziyyətə görə sola sürüşdürüb gizlədə bilir.
  const { open, visible: menuVisible, openMenu, closeMenu } = useMenu();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <nav className="mx-auto max-w-7xl px-6 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("common.menyu")}
            onClick={openMenu}
            className="p-2 -ml-2 text-mist hover:text-white transition"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <span className="size-6 grid place-items-center rounded-full border border-gold/40 text-gold text-[11px]">
              ☾
            </span>
            <span className="font-display text-lg tracking-wide">Virgo</span>
            <span className="hidden xl:inline text-mist text-[10px] tracking-[0.3em] uppercase ml-1">
              Astrology
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <SearchBox />
          <Link
            to="/sevimlilerim"
            aria-label={t("nav.sevimlilerim_aria")}
            className="relative p-2 text-mist hover:text-white transition"
          >
            <Heart className="size-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-semibold leading-none">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/sebet"
            aria-label={t("sebet.nav_aria")}
            className="relative p-2 text-mist hover:text-white transition"
          >
            <ShoppingCart className="size-4.5" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-semibold leading-none">
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            )}
          </Link>
          {user && <NotificationBell />}
          <LanguageSwitcher />
          <span className="hidden sm:block h-4 w-px bg-white/10 mx-0.5" />
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="whitespace-nowrap text-xs px-3.5 py-1.5 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition"
            >
              {t("common.cixis")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="whitespace-nowrap text-xs px-3.5 py-1.5 rounded-full bg-gold text-ink font-semibold hover:bg-goldsoft transition"
            >
              {t("common.daxil_ol")}
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className={`w-72 h-full bg-ink2 border-r border-white/10 p-5 flex flex-col gap-1 overflow-y-auto transition-all duration-200 ease-out ${
              menuVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-1.5">
                <span className="size-6 grid place-items-center rounded-full border border-gold/40 text-gold text-[11px]">
                  ☾
                </span>
                <span className="font-display text-lg">Virgo Astrology</span>
              </Link>
              <button type="button" aria-label={t("nav.baglat")} onClick={closeMenu} className="text-mist p-1">
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-3">
              <LanguageSwitcher variant="full" />
            </div>
            <Sidebar isAdmin={isAdmin} hasUser={Boolean(user)} onNavigate={closeMenu} />
          </div>
          <button
            type="button"
            aria-label={t("nav.baglat")}
            className={`flex-1 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${
              menuVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMenu}
          />
        </div>
      )}
    </nav>
  );
}
