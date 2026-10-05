import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useAuth, useIsAdmin, useIsSuperAdmin } from "@/hooks/useAuth";
import { streamAi } from "@/lib/ai-client";
import {
  adminListUsers,
  adminSetRole,
  adminCreateUser,
  adminDeleteUser,
  type AssignableRole,
} from "@/lib/admin-users.functions";
import type { ShopCategory } from "@/lib/shop";
import { pushOrderStatus } from "@/lib/push.functions";
import { sendOrderStatusEmail } from "@/lib/email.functions";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Virgo Astrology" },
      { name: "description", content: "İstifadəçiləri, təsdiqlənmiş astroloqları, rezervasiyaları və horoskop mətnlərini idarə et." },
      { property: "og:title", content: "Admin panel — Virgo Astrology" },
      { property: "og:description", content: "Platformanın idarəetmə paneli." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { key: "overview", label: "İcmal" },
  { key: "users", label: "İstifadəçilər və rollar" },
  { key: "astrologers", label: "Astroloqlar" },
  { key: "bookings", label: "Rezervasiyalar" },
  { key: "articles", label: "Məqalə" },
  { key: "content", label: "Horoskop" },
  { key: "shop", label: "Mağaza" },
  { key: "shop-orders", label: "Mağaza sifarişləri" },
  { key: "messages", label: "Mesajlar" },
] as const;

/** "yeni" statusunda olan mağaza sifarişlərinin sayı — admin panelində bildiriş üçün. Yenisi gələndə (say artanda) toast göstərmək üçün 30 saniyədə bir yenilənir. */
function useNewOrdersCount() {
  return useQuery({
    queryKey: ["admin-new-orders-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("shop_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "yeni");
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
}

/** Oxunmamış ("/metnu" formundan daxil olan) əlaqə mesajlarının sayı. Yenisi gələndə toast göstərmək üçün 30 saniyədə bir yenilənir. */
function useNewMessagesCount() {
  return useQuery({
    queryKey: ["admin-new-messages-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
}

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [tab, setTab] = useState<string>("overview");
  const { data: newOrdersCount } = useNewOrdersCount();
  const prevOrdersCountRef = useRef<number | null>(null);
  const { data: newMessagesCount } = useNewMessagesCount();
  const prevMessagesCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (newOrdersCount === undefined) return;
    const prev = prevOrdersCountRef.current;
    if (prev !== null && newOrdersCount > prev) {
      const diff = newOrdersCount - prev;
      toast.success(diff === 1 ? "Yeni sifariş daxil oldu" : `${diff} yeni sifariş daxil oldu`);
    }
    prevOrdersCountRef.current = newOrdersCount;
  }, [newOrdersCount]);

  useEffect(() => {
    if (newMessagesCount === undefined) return;
    const prev = prevMessagesCountRef.current;
    if (prev !== null && newMessagesCount > prev) {
      const diff = newMessagesCount - prev;
      toast.success(diff === 1 ? "Yeni mesaj daxil oldu" : `${diff} yeni mesaj daxil oldu`);
    }
    prevMessagesCountRef.current = newMessagesCount;
  }, [newMessagesCount]);

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
            className={`relative text-sm px-5 py-2 rounded-full border transition ${
              tab === t.key ? "border-gold bg-gold/15 text-goldsoft" : "border-white/10 text-mist hover:border-gold/40"
            }`}>
            {t.label}
            {t.key === "shop-orders" && (newOrdersCount ?? 0) > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[10px] font-semibold align-middle">
                {newOrdersCount}
              </span>
            )}
            {t.key === "messages" && (newMessagesCount ?? 0) > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[10px] font-semibold align-middle">
                {newMessagesCount}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "articles" && <ArticlesTab />}
      {tab === "users" && <UsersTab />}
      {tab === "astrologers" && <AstrologersTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "content" && <ContentTab />}
      {tab === "shop" && <ShopTab />}
      {tab === "shop-orders" && <ShopOrdersTab />}
      {tab === "messages" && <MessagesTab />}
    </Page>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">{children}</div>;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  astrologer: "Astroloq",
  user: "İstifadəçi",
};
const ASSIGNABLE_ROLES: AssignableRole[] = ["super_admin", "admin", "astrologer"];
const EMPTY_NEW_USER = { email: "", password: "", full_name: "", role: "user" as AssignableRole };

function UsersTab() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin(user?.id);
  const [form, setForm] = useState(EMPTY_NEW_USER);

  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminListUsers(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  const onError = (e: Error) => toast.error(e.message);

  const setRole = useMutation({
    mutationFn: (vars: { userId: string; role: AssignableRole; grant: boolean }) =>
      adminSetRole({ data: vars }),
    onSuccess: refresh,
    onError,
  });

  const removeUser = useMutation({
    mutationFn: (userId: string) => adminDeleteUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("İstifadəçi silindi");
      refresh();
    },
    onError,
  });

  const createUser = useMutation({
    mutationFn: () =>
      adminCreateUser({
        data: {
          email: form.email,
          password: form.password,
          role: form.role,
          ...(form.full_name.trim() ? { full_name: form.full_name.trim() } : {}),
        },
      }),
    onSuccess: () => {
      toast.success("İstifadəçi yaradıldı");
      setForm(EMPTY_NEW_USER);
      refresh();
    },
    onError,
  });

  const field =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50";

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        {isLoading && <p className="text-mist">Yüklənir…</p>}
        {error && <p className="text-red-300 text-sm">{(error as Error).message}</p>}
        {data?.map((u) => (
          <Card key={u.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-xl truncate">{u.full_name ?? "Adsız istifadəçi"}</div>
                <div className="text-xs text-mist truncate">{u.email}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {u.roles.length === 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-mist">
                      Rol yoxdur
                    </span>
                  )}
                  {u.roles.map((r) => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-full border border-gold/40 text-goldsoft">
                      {ROLE_LABEL[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>
              {isSuperAdmin && u.id !== user?.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`${u.email} silinsin? Bu geri qaytarılmır.`)) removeUser.mutate(u.id);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-mist hover:border-red-400/50 hover:text-red-400 shrink-0"
                >
                  Sil
                </button>
              )}
            </div>
            {isSuperAdmin && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                {ASSIGNABLE_ROLES.map((r) => {
                  const has = u.roles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole.mutate({ userId: u.id, role: r, grant: !has })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        has ? "border-gold bg-gold/15 text-goldsoft" : "border-white/15 text-mist hover:border-gold/40"
                      }`}
                    >
                      {has ? "✓ " : "+ "}
                      {ROLE_LABEL[r]}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
        {data?.length === 0 && <p className="text-mist">İstifadəçi yoxdur.</p>}
      </div>

      {isSuperAdmin ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUser.mutate();
          }}
          className="lg:col-span-5 h-fit rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-3"
        >
          <h2 className="font-display text-2xl">Yeni istifadəçi</h2>
          <input
            className={field}
            placeholder="Ad Soyad"
            value={form.full_name}
            maxLength={80}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            className={field}
            type="email"
            placeholder="E-poçt"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={field}
            type="password"
            placeholder="Şifrə (min 6 simvol)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className={field}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AssignableRole })}
          >
            <option value="user" className="bg-ink">İstifadəçi</option>
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r} className="bg-ink">
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="w-full px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60"
          >
            {createUser.isPending ? "Yaradılır…" : "Əlavə et"}
          </button>
        </form>
      ) : (
        <p className="lg:col-span-5 text-sm text-mist">
          Yeni istifadəçi əlavə etmək, silmək və rol vermək yalnız super admin üçündür.
        </p>
      )}
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
                {new Date(b.scheduled_at).toLocaleString("az-AZ", { hour12: false })} · {b.session_type === "live" ? "Canlı" : "Yazılı"}
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

const SHOP_CATEGORIES: { key: ShopCategory; label: string }[] = [
  { key: "tarot", label: "Tarot" },
  { key: "kristal", label: "Kristallar" },
  { key: "sham", label: "Şamlar" },
  { key: "kitab", label: "Kitablar" },
];

type ShopProductForm = {
  id?: string;
  category: ShopCategory;
  slug: string;
  name: string;
  name_en: string;
  name_ru: string;
  description: string;
  description_en: string;
  description_ru: string;
  price_azn: number;
  unit_label: string;
  image_url: string;
  sort_order: number;
  stock_qty: number;
  is_active: boolean;
};

const EMPTY_SHOP_PRODUCT: ShopProductForm = {
  category: "tarot",
  slug: "",
  name: "",
  name_en: "",
  name_ru: "",
  description: "",
  description_en: "",
  description_ru: "",
  price_azn: 0,
  unit_label: "",
  image_url: "",
  sort_order: 0,
  stock_qty: 20,
  is_active: true,
};

function ShopTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | ShopCategory>("all");
  const [form, setForm] = useState<ShopProductForm>(EMPTY_SHOP_PRODUCT);

  const { data } = useQuery({
    queryKey: ["admin-shop-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (data ?? []).filter((p) => filter === "all" || p.category === filter);

  const save = useMutation({
    mutationFn: async () => {
      if (form.name.trim().length < 2) throw new Error("Ad yazın");
      if (!form.price_azn || form.price_azn <= 0) throw new Error("Qiymət düzgün deyil");
      const payload = {
        category: form.category,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        name_en: form.name_en.trim() || null,
        name_ru: form.name_ru.trim() || null,
        description: form.description.trim(),
        description_en: form.description_en.trim() || null,
        description_ru: form.description_ru.trim() || null,
        price_azn: Number(form.price_azn),
        unit_label: form.unit_label.trim() || null,
        image_url: form.image_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        stock_qty: Math.max(0, Number(form.stock_qty) || 0),
        is_active: form.is_active,
      };
      if (form.id) {
        const { error } = await supabase.from("shop_products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shop_products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Yadda saxlanıldı");
      setForm(EMPTY_SHOP_PRODUCT);
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("shop_products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Tam formu açmadan sürətli anbar tənzimləməsi (+1/-1). Azaltma
  // decrement_shop_stock ilə atomik yoxlanılır — stok 0-a çatıbsa "-" heç nə
  // etmir (server tərəfdə rədd olunur, mənfiyə düşmür).
  const adjustStock = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      if (delta > 0) {
        const { error } = await supabase.rpc("increment_shop_stock", { _product_id: id, _qty: delta });
        if (error) throw error;
      } else if (delta < 0) {
        const { data: ok, error } = await supabase.rpc("decrement_shop_stock", { _product_id: id, _qty: -delta });
        if (error) throw error;
        if (!ok) throw new Error("Stok 0-dan aşağı düşə bilməz");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50";

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        <div className="flex flex-wrap gap-2 mb-1">
          <button type="button" onClick={() => setFilter("all")}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition ${filter === "all" ? "border-gold text-goldsoft" : "border-white/15 text-mist"}`}>
            Hamısı
          </button>
          {SHOP_CATEGORIES.map((c) => (
            <button key={c.key} type="button" onClick={() => setFilter(c.key)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition ${filter === c.key ? "border-gold text-goldsoft" : "border-white/15 text-mist"}`}>
              {c.label}
            </button>
          ))}
        </div>
        {filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-mist uppercase tracking-wide">
                    {SHOP_CATEGORIES.find((c) => c.key === p.category)?.label ?? p.category}
                  </span>
                  {!p.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-400/30 text-red-300">Deaktiv</span>}
                </div>
                <div className="font-display text-lg mt-1.5 truncate">{p.name}</div>
                <div className="text-xs text-mist mt-0.5">{p.price_azn} AZN{p.unit_label ? ` · ${p.unit_label}` : ""}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <button type="button" onClick={() => adjustStock.mutate({ id: p.id, delta: -1 })} disabled={p.stock_qty <= 0}
                    className="size-6 grid place-items-center rounded-full border border-white/15 text-mist hover:border-gold/40 disabled:opacity-30 disabled:hover:border-white/15">
                    −
                  </button>
                  <span className={`text-xs min-w-[5.5rem] text-center ${p.stock_qty <= 0 ? "text-red-300" : p.stock_qty <= 5 ? "text-amber-300" : "text-mist"}`}>
                    {p.stock_qty <= 0 ? "Stokda yoxdur" : `Anbarda: ${p.stock_qty}`}
                  </span>
                  <button type="button" onClick={() => adjustStock.mutate({ id: p.id, delta: 1 })}
                    className="size-6 grid place-items-center rounded-full border border-white/15 text-mist hover:border-gold/40">
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0 items-end">
                <button type="button" onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${p.is_active ? "border-gold text-goldsoft" : "border-white/15 text-mist"}`}>
                  {p.is_active ? "Aktiv" : "Aktiv et"}
                </button>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setForm({
                    id: p.id, category: p.category as ShopCategory, slug: p.slug, name: p.name,
                    name_en: p.name_en ?? "", name_ru: p.name_ru ?? "",
                    description: p.description, description_en: p.description_en ?? "", description_ru: p.description_ru ?? "",
                    price_azn: p.price_azn, unit_label: p.unit_label ?? "",
                    image_url: p.image_url ?? "", sort_order: p.sort_order, stock_qty: p.stock_qty, is_active: p.is_active,
                  })} className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-mist hover:border-gold/40">
                    Redaktə
                  </button>
                  <button type="button" onClick={() => { if (confirm(`${p.name} silinsin?`)) remove.mutate(p.id); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-mist hover:border-red-400/50 hover:text-red-400">
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-mist">Məhsul yoxdur.</p>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
        className="lg:col-span-5 h-fit rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-3">
        <h2 className="font-display text-2xl">{form.id ? "Məhsulu redaktə et" : "Yeni məhsul"}</h2>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ShopCategory })} className={field}>
          {SHOP_CATEGORIES.map((c) => <option key={c.key} value={c.key} className="bg-ink">{c.label}</option>)}
        </select>
        <input placeholder="Ad (AZ)" value={form.name} maxLength={120}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
        <input placeholder="Slug (boş buraxsanız avtomatik)" value={form.slug} maxLength={60}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} className={field} />
        <textarea placeholder="Təsvir (AZ)" rows={3} value={form.description} maxLength={600}
          onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${field} resize-none`} />
        <div className="rounded-xl border border-white/10 p-3 space-y-2.5">
          <p className="text-[10px] tracking-widest uppercase text-mist">Tərcümələr (opsional — boşsa AZ mətni göstərilir)</p>
          <input placeholder="Ad (EN)" value={form.name_en} maxLength={120}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={field} />
          <textarea placeholder="Təsvir (EN)" rows={2} value={form.description_en} maxLength={600}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })} className={`${field} resize-none`} />
          <input placeholder="Ad (RU)" value={form.name_ru} maxLength={120}
            onChange={(e) => setForm({ ...form, name_ru: e.target.value })} className={field} />
          <textarea placeholder="Təsvir (RU)" rows={2} value={form.description_ru} maxLength={600}
            onChange={(e) => setForm({ ...form, description_ru: e.target.value })} className={`${field} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min={0} placeholder="Qiymət (AZN)" value={form.price_azn || ""}
            onChange={(e) => setForm({ ...form, price_azn: Number(e.target.value) })} className={field} />
          <input type="number" min={0} placeholder="Sıra" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={field} />
        </div>
        <div>
          <label htmlFor="shop-stock" className="block text-[10px] tracking-widest uppercase text-mist mb-1.5">
            Anbar sayı
          </label>
          <input id="shop-stock" type="number" min={0} placeholder="Stokda neçə ədəd var" value={form.stock_qty}
            onChange={(e) => setForm({ ...form, stock_qty: Number(e.target.value) })} className={field} />
        </div>
        <input placeholder='Ölçü vahidi (məs. "78 kart", "500 qram")' value={form.unit_label} maxLength={60}
          onChange={(e) => setForm({ ...form, unit_label: e.target.value })} className={field} />
        <input placeholder="Şəkil linki (opsional, boşsa ikon göstərilir)" value={form.image_url} maxLength={300}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={field} />
        <label className="flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="accent-[color:var(--color-gold,#d9b45b)]" />
          Aktiv (mağazada görünsün)
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={save.isPending}
            className="flex-1 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60">
            {save.isPending ? "Yadda saxlanılır…" : "Yadda saxla"}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(EMPTY_SHOP_PRODUCT)} className="px-5 py-2.5 rounded-full border border-white/15 text-mist text-sm">
              Ləğv et
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  yeni: "Yeni",
  tesdiqlenib: "Təsdiqlənib",
  gonderilib: "Göndərilib",
  legv_edilib: "Ləğv edilib",
};

function ShopOrdersTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-shop-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_orders")
        .select("*, shop_order_items(product_id, product_name, quantity, unit_price_azn)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Sifariş "Ləğv edilib" statusuna keçəndə anbar geri qaytarılır (məhsul
  // yenidən satıla bilsin); ləğvdən geri (başqa statusa) keçəndə isə stok
  // yenidən tutulur. Bu, stokun sifariş statusu ilə həmişə tutarlı qalmasını
  // təmin edir.
  const setStatus = useMutation({
    mutationFn: async ({ order, status }: { order: NonNullable<typeof data>[number]; status: string }) => {
      const { error } = await supabase.from("shop_orders").update({ status }).eq("id", order.id);
      if (error) throw error;

      const wasCancelled = order.status === "legv_edilib";
      const nowCancelled = status === "legv_edilib";
      const items = order.shop_order_items ?? [];

      if (nowCancelled && !wasCancelled) {
        for (const it of items) {
          if (it.product_id) await supabase.rpc("increment_shop_stock", { _product_id: it.product_id, _qty: it.quantity });
        }
      } else if (!nowCancelled && wasCancelled) {
        for (const it of items) {
          if (it.product_id) await supabase.rpc("decrement_shop_stock", { _product_id: it.product_id, _qty: it.quantity });
        }
      }

      // Browser push + email, alongside the existing in-app bell notification
      // (DB trigger). Best-effort — neither should ever block the status update.
      try {
        await pushOrderStatus({ data: { orderId: order.id } });
      } catch {
        /* push göndərilmədi — səssizcə keç */
      }
      try {
        await sendOrderStatusEmail({ data: { orderId: order.id } });
      } catch {
        /* email göndərilmədi — səssizcə keç */
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-new-orders-count"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {data?.length === 0 && <p className="text-mist">Sifariş yoxdur.</p>}
      {data?.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display text-lg">{o.full_name}</div>
              <div className="text-xs text-mist mt-0.5">{o.phone} · {o.address}</div>
              {o.note && <div className="text-xs text-mist mt-0.5">Qeyd: {o.note}</div>}
              <div className="mt-2 space-y-0.5">
                {(o.shop_order_items ?? []).map((it, i: number) => (
                  <div key={i} className="text-xs text-mist">
                    {it.quantity} × {it.product_name} — {it.unit_price_azn * it.quantity} AZN
                  </div>
                ))}
              </div>
              <div className="text-sm text-goldsoft font-display mt-2">{o.total_azn} AZN</div>
            </div>
            <select value={o.status} onChange={(e) => setStatus.mutate({ order: o, status: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50 shrink-0">
              {Object.entries(ORDER_STATUS_LABEL).map(([k, label]) => (
                <option key={k} value={k} className="bg-ink">{label}</option>
              ))}
            </select>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MessagesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-new-messages-count"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {isLoading && <p className="text-mist">Yüklənir…</p>}
      {data?.length === 0 && <p className="text-mist">Mesaj yoxdur.</p>}
      {data?.map((m) => (
        <Card key={m.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg">{m.name}</span>
                {!m.is_read && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gold/15 text-goldsoft text-[10px] font-semibold tracking-wide uppercase">
                    Yeni
                  </span>
                )}
              </div>
              <a href={`mailto:${m.email}`} className="text-xs text-goldsoft hover:underline">{m.email}</a>
              <p className="text-sm text-white/85 mt-2 whitespace-pre-wrap max-w-2xl">{m.message}</p>
              <div className="text-[11px] text-mist mt-2">
                {new Date(m.created_at).toLocaleString("az-AZ")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => markRead.mutate({ id: m.id, isRead: !m.is_read })}
              disabled={markRead.isPending}
              className="shrink-0 text-sm px-4 py-2 rounded-full border border-white/10 hover:border-gold/40 text-mist hover:text-goldsoft transition disabled:opacity-60"
            >
              {m.is_read ? "Oxunmamış et" : "Oxundu kimi işarələ"}
            </button>
          </div>
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
    <div className="space-y-8">
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
      <SalesPanel />
    </div>
  );
}

interface TopProduct {
  name: string;
  qty: number;
}

interface DailyRevenuePoint {
  date: string;
  label: string;
  shop: number;
  subscription: number;
}

interface SalesStats {
  shopRevenue: number;
  subscriptionRevenue: number;
  activeSubscribers: number;
  topProducts: TopProduct[];
  dailyRevenue: DailyRevenuePoint[];
}

const TREND_DAYS = 14;

function SalesPanel() {
  const { data } = useQuery<SalesStats>({
    queryKey: ["admin-sales-stats"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - (TREND_DAYS - 1));
      since.setHours(0, 0, 0, 0);

      const [ordersRes, paymentsRes, subsRes, itemsRes] = await Promise.all([
        supabase.from("shop_orders").select("total_azn, status, created_at"),
        supabase.from("payment_transactions").select("amount_azn, status, created_at"),
        supabase.from("user_subscriptions").select("status, current_period_end"),
        supabase.from("shop_order_items").select("product_name, quantity"),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (subsRes.error) throw subsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      const orders = ordersRes.data ?? [];
      const payments = paymentsRes.data ?? [];

      const shopRevenue = orders
        .filter((o) => o.status !== "legv_edilib")
        .reduce((sum, o) => sum + o.total_azn, 0);

      const subscriptionRevenue = payments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amount_azn, 0);

      const now = Date.now();
      const activeSubscribers = (subsRes.data ?? []).filter(
        (s) => s.status === "active" && new Date(s.current_period_end).getTime() > now,
      ).length;

      const productTotals = new Map<string, number>();
      for (const item of itemsRes.data ?? []) {
        productTotals.set(item.product_name, (productTotals.get(item.product_name) ?? 0) + item.quantity);
      }
      const topProducts = [...productTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));

      // Son 14 günün gündəlik gəlir trendi (mağaza + abunəlik), qrafik üçün.
      const dayBuckets = new Map<string, DailyRevenuePoint>();
      for (let i = 0; i < TREND_DAYS; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dayBuckets.set(key, {
          date: key,
          label: d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" }),
          shop: 0,
          subscription: 0,
        });
      }
      for (const o of orders) {
        if (o.status === "legv_edilib" || !o.created_at) continue;
        const key = o.created_at.slice(0, 10);
        const bucket = dayBuckets.get(key);
        if (bucket) bucket.shop += o.total_azn;
      }
      for (const p of payments) {
        if (p.status !== "succeeded" || !p.created_at) continue;
        const key = p.created_at.slice(0, 10);
        const bucket = dayBuckets.get(key);
        if (bucket) bucket.subscription += p.amount_azn;
      }
      const dailyRevenue = [...dayBuckets.values()];

      return { shopRevenue, subscriptionRevenue, activeSubscribers, topProducts, dailyRevenue };
    },
  });

  const shopRevenue = data?.shopRevenue ?? 0;
  const subscriptionRevenue = data?.subscriptionRevenue ?? 0;
  const totalRevenue = shopRevenue + subscriptionRevenue;
  const topProducts = data?.topProducts ?? [];
  const maxQty = topProducts[0]?.qty ?? 1;
  const dailyRevenue = data?.dailyRevenue ?? [];
  const hasTrendData = dailyRevenue.some((d) => d.shop + d.subscription > 0);

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Satış paneli</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Ümumi gəlir (AZN)" value={totalRevenue} />
        <Stat label="Mağaza gəliri (AZN)" value={shopRevenue} />
        <Stat label="Abunəlik gəliri (AZN)" value={subscriptionRevenue} />
        <Stat label="Aktiv abunəçi" value={data?.activeSubscribers ?? 0} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-celestial-card/60 p-5">
        <p className="text-xs tracking-widest uppercase text-mist mb-4">Son {TREND_DAYS} gün — gəlir trendi (AZN)</p>
        {!hasTrendData ? (
          <p className="text-sm text-mist">Bu dövrdə hələ satış yoxdur.</p>
        ) : (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#a7a2c6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a7a2c6" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: "#1b1740", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  labelStyle={{ color: "#e7ce88" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="shop" name="Mağaza" stroke="#d4af37" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="subscription" name="Abunəlik" stroke="#8b7bef" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-celestial-card/60 p-5">
        <p className="text-xs tracking-widest uppercase text-mist mb-4">Ən çox satılan məhsullar</p>
        {topProducts.length === 0 ? (
          <p className="text-sm text-mist">Hələ satış yoxdur.</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs text-mist w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="text-goldsoft shrink-0">{p.qty} ədəd</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${Math.max(6, (p.qty / maxQty) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
