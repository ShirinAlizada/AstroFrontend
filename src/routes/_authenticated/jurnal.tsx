import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Route = createFileRoute("/_authenticated/jurnal")({
  head: () => ({
    meta: [
      { title: "Tranzit jurnalı — Ruh Astrolojiya" },
      { name: "description", content: "Gündəlik əhvalını və hadisələrini yaz, planet tranzitlərinin təsirini izlə." },
      { property: "og:title", content: "Tranzit jurnalı — Ruh Astrolojiya" },
      { property: "og:description", content: "Gündəlik əhval və tranzit qeydləri." },
    ],
  }),
  component: JournalPage,
});

const MOODS = ["😔", "😕", "😐", "🙂", "😄"];

function JournalPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    mood: 3,
    title: "",
    content: "",
    transit_note: "",
  });

  const schema = z.object({
    content: z.string().trim().min(3, t("jurnal.err_content_min")).max(2000),
    title: z.string().trim().max(120).optional(),
    transit_note: z.string().trim().max(300).optional(),
  });

  const { data: entries } = useQuery({
    queryKey: ["journal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("journal_entries").insert({
        user_id: auth.user!.id,
        entry_date: form.entry_date,
        mood: form.mood,
        title: form.title || null,
        content: form.content,
        transit_note: form.transit_note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("jurnal.entry_added"));
      setForm({ ...form, title: "", content: "", transit_note: "" });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("common.silindi"));
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const avgMood = entries?.length
    ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
    : "—";

  return (
    <Page>
      <PageHeader
        kicker={t("page.jurnal.kicker")}
        title={t("page.jurnal.title")}
        subtitle={t("page.jurnal.subtitle")}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
          className="lg:col-span-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-4 h-fit"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="entry_date" className="block text-xs text-mist mb-1.5">{t("jurnal.date_label")}</label>
              <input id="entry_date" type="date" value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <span className="block text-xs text-mist mb-1.5">{t("jurnal.mood_label")}</span>
              <div className="flex gap-1">
                {MOODS.map((m, i) => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, mood: i + 1 })}
                    aria-label={t("jurnal.mood_aria").replace("{n}", String(i + 1))}
                    className={`size-9 rounded-full border text-base transition ${
                      form.mood === i + 1 ? "border-gold bg-gold/15" : "border-white/10 hover:border-gold/40"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-xs text-mist mb-1.5">{t("common.baslik")}</label>
            <input id="title" value={form.title} maxLength={120}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label htmlFor="content" className="block text-xs text-mist mb-1.5">{t("jurnal.content_label")}</label>
            <textarea id="content" rows={5} value={form.content} maxLength={2000}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label htmlFor="transit_note" className="block text-xs text-mist mb-1.5">{t("jurnal.transit_note_label")}</label>
            <input id="transit_note" value={form.transit_note} maxLength={300}
              placeholder={t("jurnal.transit_placeholder")}
              onChange={(e) => setForm({ ...form, transit_note: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
          </div>
          <button type="submit" disabled={add.isPending}
            className="w-full px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60">
            {add.isPending ? t("jurnal.submitting") : t("jurnal.add_entry")}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5 flex items-center justify-between">
            <span className="text-mist text-sm">{t("jurnal.total_entries").replace("{n}", String(entries?.length ?? 0))}</span>
            <span className="text-mist text-sm">
              {t("jurnal.avg_mood").split("{avg}")[0]}
              <span className="text-goldsoft">{avgMood}</span>
              {t("jurnal.avg_mood").split("{avg}")[1]}
            </span>
          </div>

          {entries?.length === 0 && <p className="text-mist">{t("jurnal.no_entries")}</p>}

          {entries?.map((e) => (
            <article key={e.id} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-gold tracking-widest uppercase">{e.entry_date}</div>
                  {e.title && <h2 className="font-display text-xl mt-1">{e.title}</h2>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{MOODS[e.mood - 1]}</span>
                  <button type="button" aria-label={t("common.sil")} onClick={() => remove.mutate(e.id)}
                    className="text-mist hover:text-red-400 transition">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{e.content}</p>
              {e.transit_note && (
                <p className="mt-3 text-xs text-violet">☾ {e.transit_note}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </Page>
  );
}
