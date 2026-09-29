import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { placeShopOrder } from "@/lib/shop";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Route = createFileRoute("/_authenticated/sebet")({
  head: () => ({
    meta: [{ title: "Səbət — Virgo Astrology" }, { name: "description", content: "Səbətinizi yoxlayın və sifarişi tamamlayın." }],
  }),
  component: CartPage,
});

function itemDisplayName(item: { name: string; nameEn: string | null; nameRu: string | null }, lang: "az" | "en" | "ru") {
  if (lang === "en") return item.nameEn || item.name;
  if (lang === "ru") return item.nameRu || item.name;
  return item.name;
}

function CartPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { items, totalAzn, setCartQuantity, removeFromCart, clearCart } = useCart();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const order = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t("sebet.login_prompt"));
      await placeShopOrder(user.id, items, { fullName, phone, address, note: note.trim() || undefined });
    },
    onSuccess: () => {
      toast.success(t("sebet.success"));
      clearCart();
      setFullName("");
      setPhone("");
      setAddress("");
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message || t("sebet.error")),
  });

  const formComplete = fullName.trim().length >= 2 && phone.trim().length >= 6 && address.trim().length >= 5;
  const field = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50";

  if (items.length === 0) {
    return (
      <Page>
        <PageHeader kicker={t("sebet.kicker")} title={t("sebet.title")} subtitle={t("sebet.subtitle")} />
        <div className="rounded-3xl border border-white/8 bg-celestial-card/50 p-10 text-center">
          <ShoppingBag className="size-8 mx-auto text-mist" />
          <p className="mt-4 font-display text-xl">{t("sebet.empty_title")}</p>
          <p className="mt-1.5 text-sm text-mist">{t("sebet.empty_desc")}</p>
          <Link
            to="/tarot"
            className="mt-6 inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold text-ink hover:bg-goldsoft transition"
          >
            {t("sebet.browse_button")}
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader kicker={t("sebet.kicker")} title={t("sebet.title")} subtitle={t("sebet.subtitle")} />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="rounded-2xl border border-white/8 bg-celestial-card/50 p-4 flex items-center gap-4">
              <div className="size-16 shrink-0 rounded-xl overflow-hidden bg-ink2 border border-white/10">
                {item.imageUrl && <img src={item.imageUrl} alt={itemDisplayName(item, lang)} className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base truncate">{itemDisplayName(item, lang)}</p>
                <p className="text-xs text-mist mt-0.5">{item.priceAzn} AZN</p>
                <div className="flex items-center gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setCartQuantity(item.productId, item.quantity - 1)}
                    className="size-7 grid place-items-center rounded-full border border-white/10 text-mist hover:text-white transition"
                    aria-label="-"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity(item.productId, item.quantity + 1)}
                    className="size-7 grid place-items-center rounded-full border border-white/10 text-mist hover:text-white transition"
                    aria-label="+"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-lg text-gold">{item.priceAzn * item.quantity} AZN</p>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  aria-label={t("sebet.remove")}
                  className="mt-2 text-mist hover:text-red-400 transition"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4 flex items-center justify-between">
            <span className="text-sm text-goldsoft">{t("sebet.total_label")}</span>
            <span className="font-display text-2xl text-gold">{totalAzn} AZN</span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (formComplete) order.mutate();
          }}
          className="lg:col-span-5 h-fit rounded-3xl border border-white/8 bg-celestial-card/50 p-6 space-y-3.5"
        >
          <h2 className="font-display text-2xl">{t("sebet.checkout_heading")}</h2>

          <div>
            <label htmlFor="sebet-name" className="block text-xs text-mist mb-1.5">{t("sebet.form_fullname_label")}</label>
            <input id="sebet-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="sebet-phone" className="block text-xs text-mist mb-1.5">{t("sebet.form_phone_label")}</label>
            <input
              id="sebet-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994 XX XXX XX XX"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="sebet-address" className="block text-xs text-mist mb-1.5">{t("sebet.form_address_label")}</label>
            <textarea
              id="sebet-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${field} resize-none`}
            />
          </div>
          <div>
            <label htmlFor="sebet-note" className="block text-xs text-mist mb-1.5">{t("sebet.form_note_label")}</label>
            <input id="sebet-note" value={note} onChange={(e) => setNote(e.target.value)} className={field} />
          </div>

          <p className="text-[11px] text-mist leading-relaxed pt-1 flex items-start gap-1.5">
            <Sparkles className="size-3.5 shrink-0 mt-0.5" />
            {t("sebet.demo_notice")}
          </p>

          <button
            type="submit"
            disabled={!formComplete || order.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-50"
          >
            {order.isPending && <Loader2 className="size-4 animate-spin" />}
            {order.isPending ? t("sebet.processing") : t("sebet.submit_button").replace("{price}", String(totalAzn))}
          </button>
        </form>
      </div>
    </Page>
  );
}
