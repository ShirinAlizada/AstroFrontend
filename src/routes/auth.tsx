import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Daxil ol — Ruh Astrolojiya" },
      { name: "description", content: "Hesabına daxil ol və şəxsi natal xəritəni, jurnalını və rezervasiyalarını idarə et." },
      { property: "og:title", content: "Daxil ol — Ruh Astrolojiya" },
      { property: "og:description", content: "Şəxsi natal xəritə və astroloji hesabına giriş." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Düzgün e-poçt yazın" }).max(255),
  password: z.string().min(6, { message: "Şifrə ən azı 6 simvol olmalıdır" }).max(72),
  fullName: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profil", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Məlumatları yoxlayın");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName || null },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Xoş gəldin!");
          navigate({ to: "/profil", replace: true });
        } else {
          toast.success("E-poçtunuza təsdiq linki göndərildi.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Daxil oldunuz");
        navigate({ to: "/profil", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased grid place-items-center px-6 py-14">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="size-9 grid place-items-center rounded-full border border-gold/40 text-gold">☾</span>
          <span className="font-display text-2xl">Ruh Astrolojiya</span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-celestial-card/60 p-7">
          <h1 className="font-display text-3xl text-center">
            {mode === "login" ? "Xoş gəlmisən" : "Səmavi yolunu başlat"}
          </h1>
          <p className="text-mist text-sm text-center mt-2">
            {mode === "login"
              ? "Xəritənə davam etmək üçün daxil ol."
              : "Doğum məlumatların əsasında natal xəritəni qur."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block text-xs text-mist mb-1.5">Ad Soyad</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={80}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
                  placeholder="Adınız"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs text-mist mb-1.5">E-poçt</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
                placeholder="siz@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-mist mb-1.5">Şifrə</label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60"
            >
              {busy ? "Gözləyin…" : mode === "login" ? "Daxil ol" : "Qeydiyyatdan keç"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-5 w-full text-sm text-mist hover:text-goldsoft transition"
          >
            {mode === "login" ? "Hesabın yoxdur? Qeydiyyat" : "Artıq hesabın var? Daxil ol"}
          </button>
        </div>
      </div>
    </div>
  );
}
