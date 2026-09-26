import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";

export const Route = createFileRoute("/_authenticated/rezervasiyalar")({
  head: () => ({
    meta: [
      { title: "Rezervasiyalarım — Virgo Astrology" },
      { name: "description", content: "Astroloqlarla canlı və yazılı konsultasiya görüşlərini izlə və idarə et." },
      { property: "og:title", content: "Rezervasiyalarım — Virgo Astrology" },
      { property: "og:description", content: "Konsultasiya görüşlərinin siyahısı və statusu." },
    ],
  }),
  component: BookingsPage,
});

const STATUS_AZ: Record<string, string> = {
  pending: "Gözləyir",
  confirmed: "Təsdiqləndi",
  completed: "Tamamlandı",
  cancelled: "Ləğv edildi",
};

function BookingsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, astrologers(display_name, title)")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rezervasiya ləğv edildi");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Page>
      <PageHeader kicker="Görüşlər" title="Rezervasiyalarım" subtitle="Astroloqlarla planlaşdırdığın seanslar." />

      {data?.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-celestial-card/60 p-8 text-center">
          <p className="text-mist">Hələ rezervasiyan yoxdur.</p>
          <Link to="/astroloq" className="inline-block mt-4 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition">
            Astroloq seç
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.map((b) => (
          <div key={b.id} className="rounded-2xl bg-celestial-card/60 border border-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{b.astrologers?.display_name ?? "Astroloq"}</h2>
                <p className="text-mist text-xs mt-0.5">{b.astrologers?.title}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-gold/40 text-goldsoft">
                {STATUS_AZ[b.status] ?? b.status}
              </span>
            </div>
            <div className="mt-4 text-sm text-mist space-y-1">
              <div>Tarix: <span className="text-white">{new Date(b.scheduled_at).toLocaleString("az-AZ", { hour12: false })}</span></div>
              <div>Növ: <span className="text-white">{b.session_type === "live" ? "Canlı seans" : "Yazılı təhlil"}</span></div>
              {b.note && <div>Qeyd: <span className="text-white">{b.note}</span></div>}
            </div>
            {b.status !== "cancelled" && b.status !== "completed" && (
              <button type="button" onClick={() => cancel.mutate(b.id)}
                className="mt-4 text-xs px-4 py-2 rounded-full border border-white/10 text-mist hover:text-red-300 transition">
                Ləğv et
              </button>
            )}
          </div>
        ))}
      </div>
    </Page>
  );
}
