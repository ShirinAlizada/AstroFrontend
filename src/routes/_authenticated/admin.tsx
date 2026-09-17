import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { streamAi } from "@/lib/ai-client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Ruh Astrolojiya" },
      { name: "description", content: "İstifadəçiləri, təsdiqlənmiş astroloqları, rezervasiyaları və horoskop mətnlərini idarə et." },
      { property: "og:title", content: "Admin panel — Ruh Astrolojiya" },
      { property: "og:description", content: "Platformanın idarəetmə paneli." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { key: "overview", label: "İcmal" },
  { key: "users", label: "İstifadəçilər" },
  { key: "astrologers", label: "Astroloqlar" },
  { key: "bookings", label: "Rezervasiyalar" },
  { key: "articles", label: "Qəzet" },
  { key: "content", label: "Horoskop" },
] as const;

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [tab, setTab] = useState<string>("overview");

  if (loading) return <Page><p className="text-mist py-10">Yüklənir…</p></Page>;

  if (!isAdmin) {
    return (
      <Page>
        <PageHeader kicker="Admin" title="Giriş məhduddur" subtitle="Bu səhifə yalnız admin rolu olan istifadəçilər üçündür." />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader kicker="Admin" title="İdarəetmə paneli" subtitle="İstifadəçilər, astroloqlar, rezervasiyalar və məzmun." />
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`text-sm px-5 py-2 rounded-full border transition ${
              tab === t.key ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "articles" && <ArticlesTab />}
      {tab === "users" && <UsersTab />}
      {tab === "astrologers" && <AstrologersTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "content" && <ContentTab />}
    </Page>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">{children}</div>;
}

function UsersTab() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, sun_sign, birth_place, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data?.map((p) => (
        <Card key={p.id}>
          <div className="flex justify-between">
            <span className="font-display text-xl">{p.full_name ?? "Adsız istifadəçi"}</span>
            <span className="text-xs text-mist">{new Date(p.created_at).toLocaleDateString("az-AZ")}</span>
          </div>
          <p className="text-sm text-mist mt-1">
            {p.sun_sign ?? "Bürc yoxdur"} · {p.birth_place ?? "Yer qeyd edilməyib"}
          </p>
        </Card>
      ))}
      {data?.length === 0 && <p className="text-mist">İstifadəçi yoxdur.</p>}
    </div>
  );
}

function AstrologersTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ display_name: "", title: "", bio: "", price_azn: 60 });

  const { data } = useQuery({
    queryKey: ["admin-astrologers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("astrologers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("astrologers").update({ verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-astrologers"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const add = useMutation({
    mutationFn: async () => {
      if (form.display_name.trim().length < 2) throw new Error("Ad yazın");
      const { error } = await supabase.from("astrologers").insert({
        display_name: form.display_name.trim(),
        title: form.title.trim() || null,
        bio: form.bio.trim() || null,
        price_azn: Number(form.price_azn) || 50,
        verified: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Astroloq əlavə olundu");
      setForm({ display_name: "", title: "", bio: "", price_azn: 60 });
      queryClient.invalidateQueries({ queryKey: ["admin-astrologers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4">
        {data?.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-display text-xl">{a.display_name}</div>
                <div className="text-xs text-mist">{a.title} · {a.price_azn} ₼</div>
              </div>
              <button type="button" onClick={() => toggle.mutate({ id: a.id, verified: !a.verified })}
                className={`text-xs px-4 py-2 rounded-full border transition ${
                  a.verified ? "border-gold text-goldsoft" : "border-white/15 text-mist"
                }`}>
                {a.verified ? "Təsdiqlənib" : "Təsdiqlə"}
              </button>
            </div>
          </Card>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="lg:col-span-5 h-fit rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-3">
        <h2 className="font-display text-2xl mb-1">Yeni astroloq</h2>
        <input placeholder="Ad Soyad" value={form.display_name} maxLength={80}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
        <input placeholder="İxtisas" value={form.title} maxLength={80}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
        <textarea placeholder="Bio" rows={3} value={form.bio} maxLength={500}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none placeholder:text-mist/70 focus:outline-none focus:border-gold/50" />
        <input type="number" min={0} value={form.price_azn}
          onChange={(e) => setForm({ ...form, price_azn: Number(e.target.value) })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
        <button type="submit" className="w-full px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
          Əlavə et
        </button>
      </form>
    </div>
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, astrologers(display_name)")
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {data?.length === 0 && <p className="text-mist">Rezervasiya yoxdur.</p>}
      {data?.map((b) => (
        <Card key={b.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-lg">{b.astrologers?.display_name}</div>
              <div className="text-xs text-mist">
                {new Date(b.scheduled_at).toLocaleString("az-AZ")} · {b.session_type === "live" ? "Canlı" : "Yazılı"}
              </div>
            </div>
            <select value={b.status} onChange={(e) => setStatus.mutate({ id: b.id, status: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
              <option value="pending" className="bg-ink">Gözləyir</option>
              <option value="confirmed" className="bg-ink">Təsdiqləndi</option>
              <option value="completed" className="bg-ink">Tamamlandı</option>
              <option value="cancelled" className="bg-ink">Ləğv edildi</option>
            </select>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ContentTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-horoscopes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horoscopes")
        .select("*")
        .order("period_start", { ascending: false })
        .limit(36);
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (content.trim().length < 10) throw new Error("Mətn çox qısadır");
      const { error } = await supabase.from("horoscopes").update({ content: content.trim() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Yeniləndi");
      queryClient.invalidateQueries({ queryKey: ["admin-horoscopes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data?.map((h) => (
        <Card key={h.id}>
          <div className="text-xs text-gold tracking-widest uppercase">
            {h.sign} · {h.period} · {h.period_start}
          </div>
          <textarea defaultValue={h.content} rows={3}
            onBlur={(e) => e.target.value !== h.content && update.mutate({ id: h.id, content: e.target.value })}
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-gold/50" />
          <p className="text-xs text-mist mt-1">Dəyişiklik sahədən çıxanda yadda saxlanır.</p>
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-celestial-card/60 p-5">
      <div className="font-display text-4xl text-goldsoft">{value}</div>
      <div className="mt-1 text-xs tracking-widest uppercase text-mist">{label}</div>
    </div>
  );
}

function OverviewTab() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const counts = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("astrologers").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("forum_topics").select("*", { count: "exact", head: true }),
        supabase.from("journal_entries").select("*", { count: "exact", head: true }),
      ]);
      return counts.map((c) => c.count ?? 0);
    },
  });
  const v = (i: number) => data?.[i] ?? 0;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="İstifadəçi" value={v(0)} />
      <Stat label="Astroloq" value={v(1)} />
      <Stat label="Rezervasiya" value={v(2)} />
      <Stat label="Gözləyən rezervasiya" value={v(3)} />
      <Stat label="Məqalə" value={v(4)} />
      <Stat label="Dərc olunmuş" value={v(5)} />
      <Stat label="Forum mövzusu" value={v(6)} />
      <Stat label="Jurnal qeydi" value={v(7)} />
    </div>
  );
}

function slugify(text: string) {
  const map: Record<string, string> = { ə: "e", ı: "i", ö: "o", ü: "u", ç: "c", ş: "s", ğ: "g", İ: "i" };
  return text
    .toLowerCase()
    .replace(/[əıöüçşğİ]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type ArticleForm = { id?: string; title: string; excerpt: string; body: string; tag: string; published: boolean };

const EMPTY_ARTICLE: ArticleForm = { title: "", excerpt: "", body: "", tag: "Ümumi", published: false };

function ArticlesTab() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<ArticleForm>(EMPTY_ARTICLE);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, body, tag, published, published_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (form.title.trim().length < 5) throw new Error("Başlıq çox qısadır");
      if (form.body.trim().length < 50) throw new Error("Mətn çox qısadır");
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || null,
        body: form.body.trim(),
        tag: form.tag.trim() || "Ümumi",
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
      };
      if (form.id) {
        const { error } = await supabase.from("articles").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({ ...payload, slug: `${slugify(form.title)}-${Date.now().toString(36).slice(-4)}`, author_id: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Yadda saxlanıldı");
      setForm(EMPTY_ARTICLE);
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("articles")
        .update({ published, published_at: published ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function generateDraft() {
    if (topic.trim().length < 3) {
      toast.error("Mövzu yazın");
      return;
    }
    setGenerating(true);
    setForm((f) => ({ ...f, body: "" }));
    try {
      let acc = "";
      await streamAi("article", [{ role: "user", content: `Mövzu: ${topic.trim()}` }], (d) => {
        acc += d;
        setForm((f) => ({ ...f, body: acc }));
      });
      const title = /BAŞLIQ:\s*(.+)/.exec(acc)?.[1]?.trim() ?? "";
      const excerpt = /XÜLASƏ:\s*(.+)/.exec(acc)?.[1]?.trim() ?? "";
      const bodyPart = acc.split(/MƏTN:\s*/)[1]?.trim() ?? acc.trim();
      setForm((f) => ({ ...f, title: title || f.title, excerpt: excerpt || f.excerpt, body: bodyPart }));
      toast.success("Qaralama hazırdır — oxuyub redaktə edin");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const field = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50";

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-3">
        {data?.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-display text-xl truncate">{a.title}</div>
                <div className="text-xs text-mist mt-1">
                  {a.tag} · {a.published ? "dərc olunub" : "qaralama"}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setForm({ id: a.id, title: a.title, excerpt: a.excerpt ?? "", body: a.body, tag: a.tag, published: a.published })}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-mist hover:border-gold/40">
                  Redaktə
                </button>
                <button type="button" onClick={() => togglePublish.mutate({ id: a.id, published: !a.published })}
                  className={`text-xs px-3 py-1.5 rounded-full border ${a.published ? "border-gold text-goldsoft" : "border-white/15 text-mist"}`}>
                  {a.published ? "Gizlət" : "Dərc et"}
                </button>
                <button type="button" onClick={() => remove.mutate(a.id)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-mist hover:border-red-400/50 hover:text-red-400">
                  Sil
                </button>
              </div>
            </div>
          </Card>
        ))}
        {data?.length === 0 && <p className="text-mist">Məqalə yoxdur.</p>}
      </div>

      <div className="lg:col-span-6 h-fit rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-3">
        <h2 className="font-display text-2xl">{form.id ? "Məqaləni redaktə et" : "Yeni məqalə"}</h2>

        <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-2">
          <p className="text-xs tracking-widest uppercase text-gold">AI köməkçi</p>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Mövzu: məsələn, Venera retroqrad" className={field} />
          <button type="button" onClick={generateDraft} disabled={generating}
            className="w-full px-5 py-2.5 rounded-full border border-gold/50 text-goldsoft text-sm hover:bg-gold/10 transition disabled:opacity-50">
            {generating ? "Yazılır…" : "AI ilə qaralama yaz"}
          </button>
        </div>

        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Başlıq" maxLength={160} className={field} />
        <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Etiket" maxLength={40} className={field} />
        <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Qısa anons" rows={2} maxLength={300} className={`${field} resize-none`} />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Məqalə mətni" rows={12} className={`${field} resize-y`} />
        <label className="flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[color:var(--color-gold,#d9b45b)]" />
          Dərhal dərc et
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => save.mutate()} className="flex-1 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            Yadda saxla
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(EMPTY_ARTICLE)} className="px-5 py-2.5 rounded-full border border-white/15 text-mist text-sm">
              Ləğv et
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
