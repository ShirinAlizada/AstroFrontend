import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sidebar } from "@/components/Sidebar";

type SearchHit = {
  to: "/qezet/$slug" | "/astroloq";
  params?: { slug: string };
  title: string;
  subtitle?: string;
};

function useSiteSearch(term: string) {
  return useQuery({
    queryKey: ["site-search", term],
    enabled: term.trim().length >= 2,
    queryFn: async (): Promise<SearchHit[]> => {
      const q = term.trim();
      const [articlesRes, astrologersRes] = await Promise.all([
        supabase
          .from("articles")
          .select("slug, title")
          .ilike("title", `%${q}%`)
          .limit(6),
        supabase
          .from("astrologers")
          .select("id, full_name")
          .ilike("full_name", `%${q}%`)
          .limit(4),
      ]);

      const hits: SearchHit[] = [];
      for (const a of articlesRes.data ?? []) {
        hits.push({ to: "/qezet/$slug", params: { slug: a.slug }, title: a.title, subtitle: "Məqalə" });
      }
      for (const a of astrologersRes.data ?? []) {
        hits.push({ to: "/astroloq", title: a.full_name, subtitle: "Astroloq" });
      }
      return hits.slice(0, 10);
    },
  });
}

function SearchBox() {
  const { t } = useLanguage();
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
            hits?.map((h, i) => (
              <Link
                key={i}
                to={h.to}
                params={h.params as never}
                onClick={() => {
                  setFocused(false);
                  setTerm("");
                }}
                className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5"
              >
                <span className="text-white">{h.title}</span>
                {h.subtitle && <span className="ml-2 text-xs text-mist">{h.subtitle}</span>}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Yığcam yuxarı zolaq: loqo, axtarış, dil düyməsi və giriş/çıxış.
 * Bütün bölmə keçidləri Sidebar-a köçürülüb — masaüstündə Page.tsx-in sol
 * panelində sabit görünür, burada isə (bütün ekranlarda) menyu düyməsi eyni
 * Sidebar-ı çəkmə (drawer) şəklində açır.
 */
export function SiteNav() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

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
            onClick={() => setOpen(true)}
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
          <div className="w-72 h-full bg-ink2 border-r border-white/10 p-5 flex flex-col gap-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-1.5">
                <span className="size-6 grid place-items-center rounded-full border border-gold/40 text-gold text-[11px]">
                  ☾
                </span>
                <span className="font-display text-lg">Virgo Astrology</span>
              </Link>
              <button type="button" aria-label={t("nav.baglat")} onClick={() => setOpen(false)} className="text-mist p-1">
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-3">
              <LanguageSwitcher variant="full" />
            </div>
            <Sidebar isAdmin={isAdmin} hasUser={Boolean(user)} onNavigate={() => setOpen(false)} />
          </div>
          <button
            type="button"
            aria-label={t("nav.baglat")}
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}
