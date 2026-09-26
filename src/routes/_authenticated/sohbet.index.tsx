import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/sohbet/")({
  head: () => ({
    meta: [
      { title: "AI Astroloq — Virgo Astrology" },
      { name: "description", content: "Virgo Astrology AI astroloq köməkçisi ilə söhbətə başla." },
      { property: "og:title", content: "AI Astroloq — Virgo Astrology" },
      { property: "og:description", content: "Astroloji suallarına dərhal cavab al." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SohbetIndex,
});

function SohbetIndex() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (loading || !user || started.current) return;
    started.current = true;
    (async () => {
      const { data: existing } = await supabase
        .from("chat_threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      const id = existing?.[0]?.id;
      if (id) {
        navigate({ to: "/sohbet/$threadId", params: { threadId: id }, replace: true });
        return;
      }
      const { data } = await supabase
        .from("chat_threads")
        .insert({ user_id: user.id, title: "Yeni söhbət" })
        .select("id")
        .single();
      if (data) navigate({ to: "/sohbet/$threadId", params: { threadId: data.id }, replace: true });
    })();
  }, [loading, user, navigate]);

  return (
    <Page>
      <p className="text-mist py-16">Söhbət hazırlanır…</p>
    </Page>
  );
}
