import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { streamAi, type ChatTurn } from "@/lib/ai-client";

export const Route = createFileRoute("/_authenticated/sohbet/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Astroloq söhbəti — Virgo Astrology" },
      { name: "description", content: "Bürclər, doğum xəritəsi və tranzitlər haqqında AI astroloq ilə canlı söhbət." },
      { property: "og:title", content: "AI Astroloq söhbəti — Virgo Astrology" },
      { property: "og:description", content: "Astroloji suallarınıza dərhal cavab alın." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Əqrəb bürcü üçün bu həftə necə keçəcək?",
  "Merkuri retroqrad mənə necə təsir edir?",
  "Şir və Oğlaq uyğunluğu haqqında danış",
  "Doğum xəritəmdə Ay nişanı nə deməkdir?",
];

function ChatPage() {
  const { threadId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const threads = useQuery({
    queryKey: ["chat-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const messages = useQuery({
    queryKey: ["chat-messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data, streaming]);

  const newThread = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Daxil olun");
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({ user_id: user.id, title: "Yeni söhbət" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/sohbet/$threadId", params: { threadId: id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeThread = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_threads").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      if (id === threadId) navigate({ to: "/sohbet" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy || !user) return;
    setInput("");
    setBusy(true);
    setStreaming("");

    const history: ChatTurn[] = [
      ...(messages.data ?? []).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
      { role: "user", content: clean },
    ];

    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, user_id: user.id, role: "user", content: clean });
    if (insertError) {
      setBusy(false);
      toast.error("Mesaj yadda saxlanmadı: " + insertError.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });

    try {
      let acc = "";
      const answer = await streamAi("chat", history, (d) => {
        acc += d;
        setStreaming(acc);
      });
      const final = (answer || acc).trim();
      if (final) {
        const { error } = await supabase
          .from("chat_messages")
          .insert({ thread_id: threadId, user_id: user.id, role: "assistant", content: final });
        if (error) toast.error("Cavab yadda saxlanmadı: " + error.message);
      }
      const isFirst = (messages.data?.length ?? 0) === 0;
      await supabase
        .from("chat_threads")
        .update({
          updated_at: new Date().toISOString(),
          ...(isFirst ? { title: clean.slice(0, 48) } : {}),
        })
        .eq("id", threadId);
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setStreaming("");
      setBusy(false);
      await queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
      inputRef.current?.focus();
    }
  }

  const empty = (messages.data?.length ?? 0) === 0 && !streaming;

  return (
    <Page>
      <PageHeader
        kicker="AI Astroloq"
        title="Ulduzlarla söhbət"
        subtitle="Bürcün, doğum xəritən və cari tranzitlər haqqında istədiyini soruş."
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => newThread.mutate()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-goldsoft transition"
          >
            <Plus className="size-4" /> Yeni söhbət
          </button>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {threads.data?.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  t.id === threadId ? "border-gold/50 bg-gold/10 text-white" : "border-white/8 text-mist hover:border-gold/30"
                }`}
              >
                <Link
                  to="/sohbet/$threadId"
                  params={{ threadId: t.id }}
                  className="flex-1 truncate text-left"
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  aria-label="Söhbəti sil"
                  onClick={() => removeThread.mutate(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-mist hover:text-red-400 transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9 rounded-2xl border border-white/5 bg-celestial-card/50 p-5 flex flex-col min-h-[60vh]">
          <div className="flex-1 space-y-5 overflow-y-auto max-h-[55vh] pr-1">
            {empty && (
              <div className="py-10 text-center">
                <span className="text-5xl">☾</span>
                <p className="mt-4 text-mist">Sualını yaz və ya aşağıdakılardan birini seç.</p>
                <div className="mt-5 grid sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-left text-sm rounded-xl border border-white/10 px-4 py-3 text-mist hover:border-gold/40 hover:text-white transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.data?.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl bg-gold text-ink px-4 py-2.5 text-sm whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <span className="size-7 shrink-0 grid place-items-center rounded-full border border-gold/40 text-gold text-xs">
                    ☾
                  </span>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              ),
            )}

            {(streaming || busy) && (
              <div className="flex gap-3">
                <span className="size-7 shrink-0 grid place-items-center rounded-full border border-gold/40 text-gold text-xs">
                  ☾
                </span>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-mist">
                  {streaming || "Ulduzlara baxıram…"}
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Sualını yaz…"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm resize-none placeholder:text-mist/70 focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              className="size-11 grid place-items-center rounded-full bg-gold text-ink hover:bg-goldsoft transition disabled:opacity-40"
              aria-label="Göndər"
            >
              <Send className="size-4" />
            </button>
          </form>
          <p className="mt-2 text-[11px] text-mist">
            AI astroloq əyləncə və özünü dərk məqsədlidir; tibbi və maliyyə məsləhəti vermir.
          </p>
        </section>
      </div>
    </Page>
  );
}
