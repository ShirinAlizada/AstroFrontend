import { createFileRoute } from "@tanstack/react-router";
import { ARTICLE_SYSTEM, ASTROLOGER_SYSTEM, streamAnswer } from "@/lib/ai.server";

type Body = {
  mode?: "chat" | "article";
  messages?: { role: "user" | "assistant"; content: string }[];
};

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log("[ai] handler hit");
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Yanlış sorğu", { status: 400 });
        }

        const messages = (body.messages ?? [])
          .filter((m) => typeof m?.content === "string" && m.content.trim().length > 0)
          .slice(-20)
          .map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.content.slice(0, 4000),
          }));

        if (messages.length === 0) return new Response("Mesaj yoxdur", { status: 400 });

        const system = body.mode === "article" ? ARTICLE_SYSTEM : ASTROLOGER_SYSTEM;
        const result = await streamAnswer({ system, messages, signal: request.signal });

        if ("error" in result) {
          return new Response(result.error.message, { status: result.error.status });
        }

        return new Response(result.stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
