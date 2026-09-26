import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const NAV_LINKS = [
  { to: "/horoskop", key: "nav.horoskop" },
  { to: "/uygunluq", key: "nav.uygunluq" },
  { to: "/numerologiya", key: "nav.numerologiya" },
  { to: "/gunun-beledcisi", key: "nav.gunun_beledcisi" },
  { to: "/astroloq", key: "nav.astroloqlar" },
  { to: "/forum", key: "nav.forum" },
  { to: "/qezet", key: "nav.meqale" },
] as const;

const linkClass = "rounded-xl px-3.5 py-2.5 text-sm text-mist hover:text-white hover:bg-white/5 transition";
const activeClass = { className: "text-white bg-white/5" };

/**
 * Saytın bütün bölmələrinə keçid siyahısı. Masaüstündə (lg+) Page.tsx daxilində
 * sabit sol panel kimi, mobil/tablet ekranlarda isə SiteNav-ın açdığı çəkmə
 * (drawer) menyusunun içində eyni komponent istifadə olunur.
 */
export function Sidebar({
  isAdmin,
  hasUser,
  onNavigate,
  className = "",
}: {
  isAdmin: boolean;
  hasUser: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {NAV_LINKS.map((l) => (
        <Link key={l.to} to={l.to} onClick={onNavigate} className={linkClass} activeProps={activeClass}>
          {t(l.key)}
        </Link>
      ))}
      {hasUser && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <Link to="/sohbet" onClick={onNavigate} className={linkClass} activeProps={activeClass}>
            {t("nav.ai_sohbet")}
          </Link>
          <Link to="/jurnal" onClick={onNavigate} className={linkClass} activeProps={activeClass}>
            {t("nav.jurnal")}
          </Link>
          <Link to="/profil" onClick={onNavigate} className={linkClass} activeProps={activeClass}>
            {t("nav.profil")}
          </Link>
        </>
      )}
      {isAdmin && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <Link
            to="/admin"
            onClick={onNavigate}
            className="rounded-xl px-3.5 py-2.5 text-sm text-goldsoft hover:text-gold hover:bg-white/5 transition"
          >
            {t("nav.admin")}
          </Link>
        </>
      )}
    </nav>
  );
}
