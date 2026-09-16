export type ChatTurn = { role: "user" | "assistant"; content: string };

/** Streams the AI answer from /api/ai, calling onDelta for each chunk. */
export async function streamAi(
  mode: "chat" | "article",
  messages: ChatTurn[],
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, messages }),
    ...(signal ? { signal } : {}),
  });

  if (!res.ok || !res.body) {
    const message = (await res.text().catch(() => "")) || "AI cavab vermədi.";
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      onDelta(chunk);
    }
  }
  return full;
}
