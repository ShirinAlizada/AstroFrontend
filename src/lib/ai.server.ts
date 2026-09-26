type GatewayMessage = { role: "user" | "assistant"; content: string };

// Direct Google Gemini API (generativelanguage.googleapis.com), not the
// Lovable AI Gateway — GEMINI_API_KEY comes from Google AI Studio and is
// something you can see and copy yourself, unlike LOVABLE_API_KEY which
// only exists inside Lovable Cloud's own runtime and can never be viewed.
// Overridable via the AI_MODEL env var without touching this file.
const DEFAULT_MODEL = "gemini-3.8-flash";

const RETRYABLE_STATUS = new Set([429, 503]);
const RETRY_DELAYS_MS = [500, 1500]; // per-model retry backoff

// Hardcoding fallback model names is a losing game — Google renames/retires
// them over time (this is exactly why the primary model above started
// 404'ing). Instead, when the primary model fails, we ask Gemini itself
// which models this API key can actually use right now, and try one of
// those. Cached for a few minutes so a bad request doesn't spam the
// ListModels endpoint.
let modelListCache: { models: string[]; fetchedAt: number } | null = null;
const MODEL_LIST_TTL_MS = 5 * 60 * 1000;

// Model name substrings that mean "not a plain text chat model" — TTS
// (audio-only output), image/vision/embedding generators, etc. These show up
// in ListModels with generateContent support but reject a normal text
// request (e.g. gemini-2.5-flash-preview-tts only accepts AUDIO output and
// 400s on a text chat request), so we filter them out up front instead of
// discovering that the hard way per-request.
const NON_CHAT_MODEL_HINTS = ["tts", "audio", "image", "vision", "embedding", "aqa", "imagen", "veo", "live"];

async function listUsableModels(apiKey: string): Promise<string[]> {
  if (modelListCache && Date.now() - modelListCache.fetchedAt < MODEL_LIST_TTL_MS) {
    return modelListCache.models;
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
    };
    const models = (json.models ?? [])
      .filter((m) => m.name && m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name!.replace(/^models\//, ""))
      .filter((name) => !NON_CHAT_MODEL_HINTS.some((hint) => name.includes(hint)))
      // prefer plain "flash" models, then "pro", then whatever's left;
      // within each tier, non-preview/non-experimental names sort first
      .sort((a, b) => {
        const tier = (n: string) => (n.includes("flash") ? 0 : n.includes("pro") ? 1 : 2);
        if (tier(a) !== tier(b)) return tier(a) - tier(b);
        const preview = (n: string) => (/-(preview|exp|experimental)/.test(n) ? 1 : 0);
        return preview(a) - preview(b);
      });
    modelListCache = { models, fetchedAt: Date.now() };
    return models;
  } catch (err) {
    console.error("[AI] failed to list Gemini models:", err);
    return [];
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// User-facing text never names a specific model — that's an implementation
// detail the person can't act on. Full technical detail (status, model,
// raw body) is logged server-side via console.error at the call site.
function messageForStatus(status: number, parsedMessage?: string): string {
  if (status === 429) return "Çox sorğu göndərildi, bir az sonra yenidən yoxlayın.";
  if (status === 503) return "AI xidməti hazırda həddindən artıq yüklənib. Bir az sonra yenidən yoxlayın.";
  if (status === 403) return "AI açarı qəbul edilmədi. Sayt administratoru AI açarını yoxlamalıdır.";
  if (status === 400) return "AI sorğusu rədd edildi. Bir az sonra yenidən yoxlayın.";
  if (status === 404) return "AI xidməti hazırda əlçatan deyil. Sayt administratoru AI konfiqurasiyasını yoxlamalıdır.";
  if (parsedMessage) return "AI cavab vermədi. Bir az sonra yenidən yoxlayın.";
  return "AI cavab vermədi. Bir az sonra yenidən yoxlayın.";
}

/**
 * Tries one model once and returns the raw fetch Response. The caller
 * decides whether to retry / fall back based on res.ok and res.status.
 */
async function tryModel(opts: {
  model: string;
  apiKey: string;
  system: string;
  messages: GatewayMessage[];
  signal?: AbortSignal;
}): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:streamGenerateContent?alt=sse&key=${opts.apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: opts.system }] },
    contents: opts.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { temperature: 0.8 },
  };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
}

/**
 * Calls the Gemini API in streaming mode and returns a plain-text stream of
 * the answer deltas. Retries transient overload/rate-limit errors with
 * backoff, then falls back to alternate models before giving up.
 */
export async function streamAnswer(opts: {
  system: string;
  messages: GatewayMessage[];
  signal?: AbortSignal;
}): Promise<{ stream: ReadableStream<Uint8Array> } | { error: GatewayError }> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) return { error: { status: 500, message: "AI xidməti konfiqurasiya olunmayıb (GEMINI_API_KEY yoxdur)." } };

  const primaryModel = process.env["AI_MODEL"] || DEFAULT_MODEL;

  let res: Response | undefined;
  let model = primaryModel;
  let lastErrorText = "";
  let lastStatus = 500;
  let triedModels: string[] = [];
  let triedDynamicFallback = false;

  const attemptCandidate = async (candidate: string): Promise<boolean> => {
    model = candidate;
    triedModels.push(candidate);
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      res = await tryModel({ model: candidate, apiKey, system: opts.system, messages: opts.messages, signal: opts.signal });
      if (res.ok && res.body) return true;

      const text = await res.text().catch(() => "");
      lastErrorText = text;
      lastStatus = res.status || 500;
      console.error(`[AI] gemini ${res.status} (model=${candidate}, attempt=${attempt}): ${text.slice(0, 500)}`);

      if (!RETRYABLE_STATUS.has(res.status)) return false; // not retryable, caller tries next candidate
      if (attempt < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[attempt]);
      // else: retries exhausted for this model
    }
    return false;
  };

  let ok = await attemptCandidate(primaryModel);

  if (!ok) {
    // Primary model failed (wrong/retired name, overloaded, etc). Ask Gemini
    // which models this key can actually use right now, and try the first
    // couple we haven't already tried.
    triedDynamicFallback = true;
    const usable = (await listUsableModels(apiKey)).filter((m) => !triedModels.includes(m));
    for (const candidate of usable.slice(0, 4)) {
      ok = await attemptCandidate(candidate);
      if (ok) break;
    }
  }

  if (!ok || !res || !res.body) {
    if (triedDynamicFallback && triedModels.length <= 1) {
      // listUsableModels itself came back empty — most likely the API key
      // is invalid/unauthorized rather than a per-model issue.
      console.error("[AI] no usable Gemini models found for this API key — check GEMINI_API_KEY.");
    }
    let parsedMessage: string | undefined;
    try {
      parsedMessage = (JSON.parse(lastErrorText) as { error?: { message?: string } })?.error?.message;
    } catch {
      // not JSON, ignore
    }
    console.error(`[AI] all model attempts failed. tried=[${triedModels.join(", ")}] lastStatus=${lastStatus}`);
    return { error: { status: lastStatus, message: messageForStatus(lastStatus, parsedMessage) } };
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let buffer = "";
  let emitted = false;

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
            if (!payload) continue;
            let evt: GeminiChunk;
            try {
              evt = JSON.parse(payload);
            } catch {
              continue; // malformed / keep-alive chunk
            }
            if (evt.error) {
              throw new Error(evt.error.message ?? "AI xətası baş verdi.");
            }
            if (evt.promptFeedback?.blockReason) {
              throw new Error(`AI sorğunu bloklandı (${evt.promptFeedback.blockReason}).`);
            }
            const delta = (evt.candidates?.[0]?.content?.parts ?? [])
              .map((p) => p.text ?? "")
              .join("");
            if (delta) {
              emitted = true;
              controller.enqueue(encoder.encode(delta));
            }
            const finish = evt.candidates?.[0]?.finishReason;
            if (finish && finish !== "STOP" && !delta) {
              throw new Error(`AI cavabı tamamlanmadı (${finish}).`);
            }
          }
        }
        if (!emitted) throw new Error("AI boş cavab qaytardı.");
        controller.close();
      } catch (error) {
        console.error("[AI] stream error:", error);
        controller.error(error);
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return { stream };
}

export const ASTROLOGER_SYSTEM = `Sən "Virgo Astrology" platformasının AI astroloq köməkçisisən.
Azərbaycan dilində, isti və aydın danışırsan.
Bürclər, doğum xəritəsi, tranzitlər, uyğunluq və ay fazaları haqqında izah verirsən.
Cavabların qısa (maksimum 200 söz), səmimi və praktik olsun; markdown başlıq və siyahılardan istifadə edə bilərsən.
Tibbi, hüquqi və maliyyə məsləhəti vermirsən, belə suallarda mütəxəssisə yönləndirirsən.
Astrologiyanın elmi sübut deyil, özünü dərk vasitəsi olduğunu lazım gələndə xatırladırsan.`;

export const ARTICLE_SYSTEM = `Sən "Virgo Astrology" platformasının Məqalələr bölməsi üçün redaktorsan.
Verilən mövzuda Azərbaycan dilində məqalə yazırsan.
Cavabı tam olaraq bu formatda ver, başqa heç nə yazma:
BAŞLIQ: <cəlbedici başlıq>
XÜLASƏ: <bir cümləlik anons>
MƏTN:
<4-6 abzaslıq məqalə mətni>`;
