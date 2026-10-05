import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CITIES, computeNatalChart, SIGN_SYMBOLS, localizedSignName } from "@/lib/astrology";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan } from "@/hooks/useSubscription";
import { cancelSubscription } from "@/lib/subscription";
import { formatLongDate } from "@/lib/date-format";
import { TimeField24 } from "@/components/TimeField24";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profil.avatar_invalid_type"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t("profil.avatar_too_large"));
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user!.id;
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase.from("profiles").upsert({ id: uid, avatar_url: avatarUrl });
      if (profileError) throw profileError;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("profil.avatar_updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.save_failed"));
    } finally {
      setUploadingAvatar(false);
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
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="size-20 rounded-full overflow-hidden border border-white/10 bg-ink2 grid place-items-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <UserRound className="size-8 text-mist" />
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-ink/70 grid place-items-center">
                  <Loader2 className="size-5 animate-spin text-gold" />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="avatar-input"
                className="cursor-pointer inline-block text-sm px-4 py-2 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
              >
                {t("profil.avatar_upload_button")}
              </label>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <p className="mt-1.5 text-[11px] text-mist">{t("profil.avatar_hint")}</p>
            </div>
          </div>

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
              <label htmlFor="birth_time_hour" className="block text-xs text-mist mb-1.5">{t("profil.dogum_saati")}</label>
              <TimeField24
                idPrefix="birth_time"
                value={form.birth_time}
                onChange={(v) => setForm({ ...form, birth_time: v })}
              />
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

        <div className="space-y-6">
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
              <Link to="/sifarislerim" className="text-center text-sm px-4 py-2.5 rounded-full border border-white/10 text-mist hover:text-white transition">
                {t("profil.my_orders_link")}
              </Link>
              <Link to="/odenisler" className="text-center text-sm px-4 py-2.5 rounded-full border border-white/10 text-mist hover:text-white transition">
                {t("profil.my_payments_link")}
              </Link>
            </div>
          </aside>

          <SubscriptionCard />
        </div>
      </div>
    </Page>
  );
}

function SubscriptionCard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { plan, subscription, isLoading } = useEffectivePlan();

  const cancel = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await cancelSubscription(user.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-subscription", user?.id] });
      toast.success(t("profil.abunelik_legv_edildi"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isPaid = plan.key !== "pulsuz";
  const isCancelled = subscription?.status === "cancelled";

  return (
    <aside className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{t("profil.abunelik_heading")}</p>

      {isLoading ? (
        <p className="text-sm text-mist">{t("common.yuklenir")}</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="font-display text-xl">{plan.name}</span>
            {isPaid && !isCancelled && (
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gold/40 text-goldsoft">
                {t("profil.abunelik_status_active")}
              </span>
            )}
            {isCancelled && (
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-mist">
                {t("profil.abunelik_status_cancelled")}
              </span>
            )}
          </div>

          {isPaid && subscription && (
            <p className="mt-2 text-xs text-mist">
              {t("profil.abunelik_bitme_tarixi")}: {formatLongDate(new Date(subscription.currentPeriodEnd), lang)}
            </p>
          )}

          {!isPaid && <p className="mt-2 text-sm text-mist">{t("profil.abunelik_yoxdur")}</p>}

          <div className="mt-5 grid gap-2">
            <Link
              to="/paketler"
              className="text-center text-sm px-4 py-2.5 rounded-full border border-gold/40 text-goldsoft hover:bg-gold/10 transition"
            >
              {isPaid ? t("profil.abunelik_yukselt") : t("profil.abunelik_gor_paketler")}
            </Link>
            {isPaid && !isCancelled && (
              <button
                type="button"
                onClick={() => cancel.mutate()}
                disabled={cancel.isPending}
                className="text-center text-sm px-4 py-2.5 rounded-full border border-white/10 text-mist hover:text-red-300 hover:border-red-300/40 transition disabled:opacity-50"
              >
                {t("profil.abunelik_legv_et")}
              </button>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function Row({ label, value }: { label: string; value?: string | null | undefined }) {
  const { lang } = useLanguage();
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-mist">{label}</span>
      <span className="text-white">
        {value ? `${SIGN_SYMBOLS[value] ?? ""} ${localizedSignName(value, lang)}` : "—"}
      </span>
    </div>
  );
}
