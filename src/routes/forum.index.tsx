import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LOCALE_MAP } from "@/lib/i18n/translations";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/forum/")({
  head: () => ({
    meta: [
      { title: "Forum — Virgo Astrology" },
      { name: "description", content: "Astrologiya mövzuları, tranzit yenilikləri və xəritə oxunuşları üzrə icma müzakirəsi." },
      { property: "og:title", content: "Forum — Virgo Astrology" },
      { property: "og:description", content: "Astrologiya icması: tranzitlər, xəritələr, müzakirələr." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ForumPage,
});

const CATEGORIES = ["ümumi", "tranzitlər", "natal xəritə", "cütlük xəritəsi", "sual-cavab"];

const CATEGORY_KEY: Record<string, string> = {
  "ümumi": "forum.cat_umumi",
  "tranzitlər": "forum.cat_tranzitler",
  "natal xəritə": "forum.cat_natal",
  "cütlük xəritəsi": "forum.cat_cutluk",
  "sual-cavab": "forum.cat_sual",
};

function ForumPage() {
  const { t, lang } = useLanguage();
  const locale = LOCALE_MAP[lang];
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("hamısı");
  const [form, setForm] = useState({ title: "", body: "", category: "ümumi" });

  const schema = z.object({
    title: z.string().trim().min(5, t("forum.err_title_min")).max(140),
    body: z.string().trim().min(10, t("forum.err_body_min")).max(3000),
  });

  const { data: topics } = useQuery({
    queryKey: ["forum-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user!.id;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
      const { error } = await supabase.from("forum_topics").insert({
        user_id: uid,
        author_name: profile?.full_name || t("common.istifadeci"),
        category: form.category,
        title: parsed.data.title,
        body: parsed.data.body,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("forum.topic_posted"));
      setForm({ title: "", body: "", category: "ümumi" });
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = topics?.filter((t) => filter === "hamısı" || t.category === filter);

  return (
    <Page>
      <PageHeader
        kicker={t("page.forum.kicker")}
        title={t("page.forum.title")}
        subtitle={t("page.forum.subtitle")}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {["hamısı", ...CATEGORIES].map((c) => (
          <button key={c} type="button" onClick={() => setFilter(c)}
            className={`text-xs px-4 py-2 rounded-full border transition ${
              filter === c ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}>
            {c === "hamısı" ? t("common.hamisi") : t(CATEGORY_KEY[c] ?? "") || c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {visible?.length === 0 && <p className="text-mist">{t("forum.no_topics")}</p>}
          {visible?.map((topic) => (
            <Link key={topic.id} to="/forum/$topicId" params={{ topicId: topic.id }}
              className="block rounded-2xl bg-celestial-card/60 border border-white/5 p-5 hover:border-gold/30 transition">
              <div className="flex items-center gap-3 text-xs text-mist">
                <span className="px-2.5 py-1 rounded-full border border-violet/30 text-violet">
                  {t(CATEGORY_KEY[topic.category] ?? "") || topic.category}
                </span>
                <span>{new Date(topic.created_at).toLocaleDateString(locale)}</span>
              </div>
              <h2 className="font-display text-2xl mt-2">{topic.title}</h2>
              <p className="text-sm text-white/75 mt-1 line-clamp-2">{topic.body}</p>
              <p className="text-xs text-mist mt-3">{topic.author_name}</p>
            </Link>
          ))}
        </div>

        <aside className="lg:col-span-5 h-fit rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
          <h2 className="font-display text-2xl mb-4">{t("forum.new_topic_heading")}</h2>
          {user ? (
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
              <div>
                <label htmlFor="cat" className="block text-xs text-mist mb-1.5">{t("forum.category_label")}</label>
                <select id="cat" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-ink">{t(CATEGORY_KEY[c] ?? "") || c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="t-title" className="block text-xs text-mist mb-1.5">{t("common.baslik")}</label>
                <input id="t-title" value={form.title} maxLength={140}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
              </div>
              <div>
                <label htmlFor="t-body" className="block text-xs text-mist mb-1.5">{t("forum.text_label")}</label>
                <textarea id="t-body" rows={5} value={form.body} maxLength={3000}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gold/50" />
              </div>
              <button type="submit" disabled={create.isPending}
                className="w-full px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60">
                {t("forum.share_button")}
              </button>
            </form>
          ) : (
            <div className="text-sm text-mist">
              {t("forum.login_prefix")}{" "}
              <Link to="/auth" className="text-goldsoft hover:text-gold">{t("common.daxil_ol").toLowerCase()}</Link>.
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
}
