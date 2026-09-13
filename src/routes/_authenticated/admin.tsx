import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

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
  { key: "users", label: "İstifadəçilər" },
  { key: "astrologers", label: "Astroloqlar" },
  { key: "bookings", label: "Rezervasiyalar" },
  { key: "content", label: "Məzmun" },
] as const;

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [tab, setTab] = useState<string>("users");

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
