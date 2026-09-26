import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/astroloq")({
  head: () => ({
    meta: [
      { title: "Astroloqlar və rezervasiya — Virgo Astrology" },
      { name: "description", content: "Təsdiqlənmiş astroloqlarla canlı və ya yazılı konsultasiya seansı rezerv et." },
      { property: "og:title", content: "Astroloqlar və rezervasiya — Virgo Astrology" },
      { property: "og:description", content: "Peşəkar astroloqlarla seans rezervasiyası." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AstrologersPage,
});

function AstrologersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ session_type: "live", scheduled_at: "", note: "" });

  const { data: astrologers, isLoading } = useQuery({
    queryKey: ["astrologers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("astrologers")
        .select("*")
        .eq("verified", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const book = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error(t("astroloq.err_select_astrologer"));
      if (!form.scheduled_at) throw new Error(t("astroloq.err_select_datetime"));
      if (new Date(form.scheduled_at).getTime() < Date.now()) throw new Error(t("astroloq.err_future_datetime"));
      if (form.note.length > 500) throw new Error(t("astroloq.err_note_too_long"));
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("bookings").insert({
        user_id: auth.user!.id,
        astrologer_id: selected,
        session_type: form.session_type,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        note: form.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("astroloq.booking_sent"));
      setSelected(null);
      setForm({ session_type: "live", scheduled_at: "", note: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Page>
      <PageHeader
        kicker={t("page.astroloq.kicker")}
        title={t("page.astroloq.title")}
        subtitle={t("page.astroloq.subtitle")}
      />

      {isLoading && <p className="text-mist">{t("common.yuklenir")}</p>}

      <div className="grid md:grid-cols-3 gap-5">
        {astrologers?.map((a) => (
          <article key={a.id} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 flex flex-col">
            <div className="size-14 rounded-full grid place-items-center border border-gold/40 text-gold text-xl">
              {a.display_name.charAt(0)}
            </div>
            <h2 className="font-display text-2xl mt-4">{a.display_name}</h2>
            <p className="text-gold text-xs tracking-widest uppercase mt-1">{a.title}</p>
            <p className="text-sm text-mist mt-3 leading-relaxed flex-1">{a.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {a.specialties.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full border border-violet/30 text-violet">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1 text-sm text-goldsoft">
                <Star className="size-4 fill-current" /> {a.rating}
              </span>
              <span className="text-sm text-white">{a.price_azn} ₼ {t("astroloq.seans_suffix")}</span>
            </div>
            <button type="button" onClick={() => setSelected(selected === a.id ? null : a.id)}
              className="mt-4 w-full px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
              {selected === a.id ? t("nav.baglat") : t("astroloq.pick_time")}
            </button>

            {selected === a.id && (
              <div className="mt-4 border-t border-white/5 pt-4">
                {user ? (
                  <form onSubmit={(e) => { e.preventDefault(); book.mutate(); }} className="space-y-3">
                    <div>
                      <label htmlFor={`type-${a.id}`} className="block text-xs text-mist mb-1.5">{t("astroloq.session_type")}</label>
                      <select id={`type-${a.id}`} value={form.session_type}
                        onChange={(e) => setForm({ ...form, session_type: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
                        <option value="live" className="bg-ink">{t("astroloq.opt_live")}</option>
                        <option value="written" className="bg-ink">{t("astroloq.opt_written")}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`when-${a.id}`} className="block text-xs text-mist mb-1.5">{t("astroloq.datetime")}</label>
                      <input id={`when-${a.id}`} type="datetime-local" lang="az" value={form.scheduled_at}
                        onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
                    </div>
                    <div>
                      <label htmlFor={`note-${a.id}`} className="block text-xs text-mist mb-1.5">{t("astroloq.note_label")}</label>
                      <textarea id={`note-${a.id}`} rows={2} value={form.note} maxLength={500}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-gold/50" />
                    </div>
                    <button type="submit" disabled={book.isPending}
                      className="w-full px-5 py-2.5 rounded-full border border-gold/50 text-goldsoft text-sm hover:bg-gold/10 transition disabled:opacity-60">
                      {t("astroloq.book_button")}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-mist">
                    {t("astroloq.login_prefix")} <Link to="/auth" className="text-goldsoft hover:text-gold">{t("common.daxil_ol").toLowerCase()}</Link>.
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </Page>
  );
}
