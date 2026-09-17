type GatewayMessage = { role: "user" | "assistant"; content: string };

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

export type GatewayError = { status: number; message: string };

/**
 * Calls the Lovable AI Gateway Responses API in streaming mode and returns a
 * plain-text stream of the answer deltas.
 */
export async function streamAnswer(opts: {
  system: string;
  messages: GatewayMessage[];
  signal?: AbortSignal;
}): Promise<{ stream: ReadableStream<Uint8Array> } | { error: GatewayError }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { error: { status: 500, message: "AI xidməti konfiqurasiya olunmayıb." } };

  const input = [
    { role: "developer", content: [{ type: "input_text", text: opts.system }] },
    ...opts.messages.map((m) =>
      m.role === "assistant"
        ? { role: "assistant", content: [{ type: "output_text", text: m.content }] }
        : { role: "user", content: [{ type: "input_text", text: m.content }] },
    ),
  ];

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    let message = "AI cavab vermədi.";
    if (res.status === 429) message = "Çox sorğu göndərildi, bir az sonra yenidən yoxlayın.";
    else if (res.status === 402) message = "AI kreditləri bitib. Zəhmət olmasa balansı artırın.";
    else if (res.status === 403) message = "AI istifadəsi bu iş sahəsində bağlıdır.";
    else if (text) message = text.slice(0, 300);
    return { error: { status: res.status || 500, message } };
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload) as { type?: string; delta?: string };
              if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
                controller.enqueue(encoder.encode(evt.delta));
              }
            } catch {
              // ignore malformed keep-alive chunks
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return { stream };
}

export const ASTROLOGER_SYSTEM = `Sən "Ruh Astrolojiya" platformasının AI astroloq köməkçisisən.
Azərbaycan dilində, isti və aydın danışırsan.
Bürclər, doğum xəritəsi, tranzitlər, uyğunluq və ay fazaları haqqında izah verirsən.
Cavabların qısa (maksimum 200 söz), səmimi və praktik olsun; markdown başlıq və siyahılardan istifadə edə bilərsən.
Tibbi, hüquqi və maliyyə məsləhəti vermirsən, belə suallarda mütəxəssisə yönləndirirsən.
Astrologiyanın elmi sübut deyil, özünü dərk vasitəsi olduğunu lazım gələndə xatırladırsan.`;

export const ARTICLE_SYSTEM = `Sən astrologiya qəzeti üçün redaktorsan.
Verilən mövzuda Azərbaycan dilində məqalə yazırsan.
Cavabı tam olaraq bu formatda ver, başqa heç nə yazma:
BAŞLIQ: <cəlbedici başlıq>
XÜLASƏ: <bir cümləlik anons>
MƏTN:
<4-6 abzaslıq məqalə mətni>`;
