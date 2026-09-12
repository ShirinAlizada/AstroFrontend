import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/forum/$topicId")({
  head: () => ({
    meta: [
      { title: "Mövzu — Ruh Astrolojiya forumu" },
      { name: "description", content: "Astrologiya forumunda mövzu müzakirəsi və icma cavabları." },
      { property: "og:title", content: "Mövzu — Ruh Astrolojiya forumu" },
      { property: "og:description", content: "Forum mövzusu və cavablar." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: TopicPage,
  errorComponent: () => (
    <Page>
      <p className="text-mist py-10">Mövzu yüklənmədi.</p>
    </Page>
  ),
});

function TopicPage() {
  const { topicId } = useParams({ from: "/forum/$topicId" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const { data: topic } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_topics").select("*").eq("id", topicId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: replies } = useQuery({
    queryKey: ["replies", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const reply = useMutation({
    mutationFn: async () => {
      const text = body.trim();
      if (text.length < 2) throw new Error("Cavab çox qısadır");
      if (text.length > 2000) throw new Error("Cavab çox uzundur");
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user!.id;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
      const { error } = await supabase.from("forum_replies").insert({
        topic_id: topicId,
        user_id: uid,
        author_name: profile?.full_name || "İstifadəçi",
        body: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["replies", topicId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Page>
      <Link to="/forum" className="text-sm text-mist hover:text-goldsoft">← Foruma qayıt</Link>

      {topic && (
        <article className="mt-5 rounded-2xl bg-celestial-card/60 border border-white/5 p-6">
          <div className="flex items-center gap-3 text-xs text-mist">
            <span className="px-2.5 py-1 rounded-full border border-violet/30 text-violet">{topic.category}</span>
            <span>{new Date(topic.created_at).toLocaleString("az-AZ")}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl mt-3">{topic.title}</h1>
          <p className="text-xs text-mist mt-1">{topic.author_name}</p>
          <p className="mt-4 text-white/85 leading-relaxed whitespace-pre-wrap">{topic.body}</p>
        </article>
      )}

      <h2 className="font-display text-2xl mt-8 mb-3">Cavablar ({replies?.length ?? 0})</h2>
      <div className="space-y-3">
        {replies?.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white/5 border border-white/5 p-4">
            <div className="flex justify-between text-xs text-mist">
              <span>{r.author_name}</span>
              <span>{new Date(r.created_at).toLocaleDateString("az-AZ")}</span>
            </div>
            <p className="mt-2 text-sm text-white/85 whitespace-pre-wrap">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {user ? (
          <form onSubmit={(e) => { e.preventDefault(); reply.mutate(); }} className="space-y-3">
            <label htmlFor="reply" className="block text-xs text-mist">Cavabın</label>
            <textarea id="reply" rows={4} value={body} maxLength={2000}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gold/50" />
            <button type="submit" disabled={reply.isPending}
              className="px-6 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition disabled:opacity-60">
              Göndər
            </button>
          </form>
        ) : (
          <p className="text-sm text-mist">
            Cavab yazmaq üçün <Link to="/auth" className="text-goldsoft hover:text-gold">daxil ol</Link>.
          </p>
        )}
      </div>
    </Page>
  );
}
