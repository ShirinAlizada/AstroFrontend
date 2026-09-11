import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

const links = [
  { to: "/horoskop", label: "Horoskop" },
  { to: "/uygunluq", label: "Uyğunluq" },
  { to: "/astroloq", label: "Astroloqlar" },
  { to: "/forum", label: "Forum" },
  { to: "/qezet", label: "Qəzet" },
] as const;

export function SiteNav() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <nav className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="size-8 grid place-items-center rounded-full border border-gold/40 text-gold text-sm">
            ☾
          </span>
          <span className="font-display text-2xl tracking-wide">Ruh</span>
          <span className="hidden sm:inline text-mist text-xs tracking-[0.3em] uppercase ml-1">
            Astrolojiya
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm text-mist">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-goldsoft transition"
              activeProps={{ className: "text-white" }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/jurnal" className="hover:text-goldsoft transition" activeProps={{ className: "text-white" }}>
                Jurnal
              </Link>
              <Link to="/profil" className="hover:text-goldsoft transition" activeProps={{ className: "text-white" }}>
                Profil
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-goldsoft hover:text-gold transition">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition"
            >
              Çıxış
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-sm px-4 py-2 rounded-full border border-gold/50 text-goldsoft hover:bg-gold/10 transition"
            >
              Daxil ol
            </Link>
          )}
          <button
            type="button"
            aria-label="Menyu"
            className="lg:hidden p-2 text-mist"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mt-4 grid gap-3 text-sm text-mist rounded-2xl border border-white/10 bg-ink2/70 p-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="hover:text-goldsoft">
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/jurnal" onClick={() => setOpen(false)} className="hover:text-goldsoft">
                Jurnal
              </Link>
              <Link to="/profil" onClick={() => setOpen(false)} className="hover:text-goldsoft">
                Profil
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="text-goldsoft">
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
