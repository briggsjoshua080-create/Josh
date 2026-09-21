import { IncomingMessage } from "http";
import { handleFeedback } from "../server/coach.js";

export const config = { runtime: "nodejs" };

type ResponseLike = {
  statusCode?: number;
  setHeader?: (key: string, value: string) => void;
  end?: (data?: string) => void;
};

/**
 * A cross-origin POST with `content-type: text/plain` is a CORS *simple*
 * request: no preflight, so it executes and bills us even though the attacker
 * never sees the response. Any third-party page could therefore spend the
 * API budget through its visitors' browsers — from their real IPs, which
 * defeats per-IP limiting too. Requiring JSON and a same-origin Origin closes
 * that without affecting the app's own same-origin fetch.
 */
function isAllowedRequest(req: IncomingMessage): boolean {
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) return false;

  const origin = req.headers.origin;
  if (!origin) return true; // same-origin fetches may omit it entirely

  const host = req.headers.host;
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export default async function handler(req: IncomingMessage & { body?: string }, res: ResponseLike) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (!isAllowedRequest(req)) {
    res.statusCode = 403;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "forbidden" }));
    return;
  }

  try {
    const bodyText = await new Promise<string>((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString?.() ?? chunk;
      });
      req.on("error", reject);
      req.on("end", () => resolve(data));
    });

    const forwardedFor = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0])?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const out = await handleFeedback(
      bodyText,
      {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
      },
      ip,
    );

    res.statusCode = out.status;
    res.setHeader?.("content-type", "application/json");
    res.end?.(out.body);
  } catch (error) {
    // Log the full error server-side only; the client never sees internals.
    console.error(error);
    res.statusCode = 500;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "server_error" }));
  }
}
