import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { useMenu } from "@/hooks/useMenu";
import { sendContactConfirmation } from "@/lib/email.functions";

export const Route = createFileRoute("/metnu")({
  head: () => ({
    meta: [
      { title: "Mətnu — Virgo Astrology" },
      { name: "description", content: "Astroloji məsləhət və xidmətlər üçün bizimlə əlaqə saxlayın." },
      { property: "og:title", content: "Mətnu — Virgo Astrology" },
      { property: "og:description", content: "Astroloji məsləhət və xidmətlər üçün bizimlə əlaqə saxlayın." },
    ],
  }),
  component: MetnuPage,
});

interface ContactForm {
  name: string;
  email: string;
  message: string;
  /** Honeypot: real users never see or fill this field (visually hidden,
   * excluded from tab order). A bot that blindly fills every input trips it. */
  website: string;
}

const EMPTY_FORM: ContactForm = { name: "", email: "", message: "", website: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MetnuPage() {
  const { open: menuOpen } = useMenu();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  const sendMutation = useMutation({
    mutationFn: async (values: ContactForm) => {
      const { error } = await supabase.from("contact_messages").insert({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      if (error) throw error;

      // Avtomatik təsdiq email-i — best-effort, uğursuz olsa belə əsas
      // göndərməni bloklamır.
      try {
        await sendContactConfirmation({ data: { name: values.name.trim(), email: values.email.trim() } });
      } catch {
        /* email göndərilmədi — səssizcə keç */
      }
    },
    onSuccess: () => {
      toast.success("Mesajınız göndərildi. Komandamız 48 saat ərzində cavab verəcək.");
      setForm(EMPTY_FORM);
    },
    onError: () => {
      toast.error("Mesaj göndərilmədi. Zəhmət olmasa yenidən cəhd edin.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot tripped — pretend success without ever contacting Supabase,
    // so the bot has no signal that it was caught.
    if (form.website.trim().length > 0) {
      toast.success("Mesajınız göndərildi. Komandamız 48 saat ərzində cavab verəcək.");
      setForm(EMPTY_FORM);
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      toast.error("Zəhmət olmasa adınızı daxil edin.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error("Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.");
      return;
    }
    if (message.length < 5) {
      toast.error("Zəhmət olmasa sualınızı yazın.");
      return;
    }

    sendMutation.mutate({ name, email, message });
  };

  return (
    <div className="min-h-screen bg-ink text-white font-sans antialiased overflow-x-hidden">
      <SiteNav />

      <main
        className={`mx-auto max-w-6xl px-6 py-12 transition-all duration-200 ease-out ${
          menuOpen ? "-translate-x-8 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Əlaqə</p>
            <h1 className="font-display text-4xl md:text-5xl max-w-xl">Səmavi məsləhət al</h1>
            <p className="mt-5 text-mist leading-relaxed max-w-md">
              Doğum tarixini, saatını və sualını bizimlə paylaş. Komandamız 48 saat ərzində cavab verəcək.
            </p>
          </div>

          <form
            className="rounded-2xl bg-celestial-card/60 border border-white/5 p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            {/* Honeypot — invisible to real users, invisible to screen readers,
               not reachable by Tab. A bot filling every field in the DOM trips it. */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden"
            />
            <div>
              <label htmlFor="name" className="block text-xs text-mist mb-1.5">Adınız</label>
              <input
                id="name"
                type="text"
                placeholder="Adınız"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={sendMutation.isPending}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs text-mist mb-1.5">E-poçt</label>
              <input
                id="email"
                type="email"
                placeholder="siz@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={sendMutation.isPending}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs text-mist mb-1.5">Sualınız</label>
              <textarea
                id="message"
                rows={4}
                placeholder="Səmavi xəritəniz haqqında nə öyrənmək istəyirsiniz?"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                disabled={sendMutation.isPending}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-mist/70 focus:outline-none focus:border-gold/50 resize-none disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full px-6 py-3 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sendMutation.isPending ? "Göndərilir..." : "Göndər"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
