import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CITIES, computeNatalChart, SIGN_SYMBOLS } from "@/lib/astrology";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profilim — Virgo Astrology" },
      { name: "description", content: "Doğum tarixi, dəqiq doğum saatı və doğum yerini daxil edərək natal xəritəni yenilə." },
      { property: "og:title", content: "Profilim — Virgo Astrology" },
      { property: "og:description", content: "Doğum məlumatlarını idarə et və natal xəritəni yenilə." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const schema = z.object({
    full_name: z.string().trim().min(2, t("profil.err_name")).max(80),
    birth_date: z.string().min(1, t("profil.err_date")),
    birth_time: z.string().min(1, t("profil.err_time")),
    birth_place: z.string().min(1, t("profil.err_place")),
  });
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    birth_time: "",
    birth_place: "Bakı",
    bio: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        birth_date: profile.birth_date ?? "",
        birth_time: (profile.birth_time ?? "").slice(0, 5),
        birth_place: profile.birth_place ?? "Bakı",
        bio: profile.bio ?? "",
      });
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("common.check_fields"));
      return;
    }
    const city = CITIES.find((c) => c.name === form.birth_place);
    if (!city) {
      toast.error(t("profil.select_city_error"));
      return;
    }
    setSaving(true);
    try {
      const chart = computeNatalChart({
        date: form.birth_date,
        time: form.birth_time,
        latitude: city.lat,
        longitude: city.lon,
      });
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user!.id;

      const { error: pErr } = await supabase.from("profiles").upsert({
        id: uid,
        full_name: form.full_name,
        bio: form.bio,
        birth_date: form.birth_date,
        birth_time: form.birth_time,
        birth_place: city.name,
        birth_lat: city.lat,
        birth_lon: city.lon,
        sun_sign: chart.sun,
        moon_sign: chart.moon,
        ascendant: chart.ascendant.sign,
      });
      if (pErr) throw pErr;

      const { error: cErr } = await supabase
        .from("natal_charts")
        .upsert({ user_id: uid, chart: JSON.parse(JSON.stringify(chart)) }, { onConflict: "user_id" });
      if (cErr) throw cErr;

      await queryClient.invalidateQueries();
      toast.success(t("profil.chart_calculated"));
      navigate({ to: "/xerite" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader
        kicker={t("page.profil.kicker")}
        title={t("page.profil.title")}
        subtitle={t("page.profil.subtitle")}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={save} className="lg:col-span-2 rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-xs text-mist mb-1.5">{t("profil.ad_soyad")}</label>
            <input id="full_name" value={form.full_name} maxLength={80}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="birth_date" className="block text-xs text-mist mb-1.5">{t("common.dogum_tarixi")}</label>
              <input id="birth_date" type="date" value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label htmlFor="birth_time" className="block text-xs text-mist mb-1.5">{t("profil.dogum_saati")}</label>
              <input id="birth_time" type="time" lang="az-AZ" value={form.birth_time}
                onChange={(e) => setForm({ ...form, birth_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label htmlFor="birth_place" className="block text-xs text-mist mb-1.5">{t("common.dogum_yeri")}</label>
              <select id="birth_place" value={form.birth_place}
                onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50">
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-ink">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="block text-xs text-mist mb-1.5">{t("profil.haqqimda")}</label>
            <textarea id="bio" rows={3} value={form.bio} maxLength={500}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gold/50" />
          </div>
          <button type="submit" disabled={saving || isLoading}
            className="px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60">
            {saving ? t("profil.saving") : t("profil.save_button")}
          </button>
        </form>

        <aside className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{t("profil.celestial_signature")}</p>
          <div className="space-y-3 text-sm">
            <Row label={t("common.gunes")} value={profile?.sun_sign} />
            <Row label={t("common.ay")} value={profile?.moon_sign} />
            <Row label={t("common.yukselen")} value={profile?.ascendant} />
          </div>
          <div className="mt-6 grid gap-2">
            <Link to="/xerite" className="text-center text-sm px-4 py-2.5 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition">
              {t("profil.my_chart_link")}
            </Link>
            <Link to="/rezervasiyalar" className="text-center text-sm px-4 py-2.5 rounded-full border border-white/10 text-mist hover:text-white transition">
              {t("profil.my_bookings_link")}
            </Link>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function Row({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-mist">{label}</span>
      <span className="text-white">
        {value ? `${SIGN_SYMBOLS[value] ?? ""} ${value}` : "—"}
      </span>
    </div>
  );
}
