// Server-only transactional email sender (Resend's REST API via plain
// fetch — no SDK dependency needed). Same convention as push.server.ts:
// never imported at the top level of a route file or a *.functions.ts
// module, always `await import("@/lib/email.server")` from inside a server
// handler.
export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function ensureConfigured(): { apiKey: string; from: string } {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];

  if (!apiKey || !from) {
    const missing = [
      ...(!apiKey ? ["RESEND_API_KEY"] : []),
      ...(!from ? ["RESEND_FROM_EMAIL"] : []),
    ];
    throw new Error(`Missing email env variable(s): ${missing.join(", ")}`);
  }

  return { apiKey, from };
}

/**
 * Sends one transactional email via Resend. Throws on a hard failure
 * (missing config, network error, non-2xx from Resend) — callers that
 * shouldn't block their main action on email delivery catch this
 * themselves, the same way push sends are treated as best-effort.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { apiKey, from } = ensureConfigured();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

/** Shared HTML shell so every email looks like it belongs to the same app. */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="az">
  <body style="margin:0;padding:0;background:#0a0918;font-family:Georgia,'Cormorant Garamond',serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0918;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#14112e;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0;color:#d4af37;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Virgo Astrology</p>
                <h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 32px;color:#e5e2f5;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
