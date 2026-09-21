import { IncomingMessage } from "http";
import { handleFeedback } from "../server/coach.js";

/**
 * `maxDuration` must exceed the client's 45s ceiling (see COACH_TIMEOUT_MS in
 * src/lib/feedback.ts). Without it the platform default can kill the function
 * mid-generation — Anthropic still bills the tokens, and the user is told the
 * coach is unavailable, so the spend is pure waste.
 */
export const config = { runtime: "nodejs", maxDuration: 60 };

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
/**
 * The client can put anything in the FIRST `x-forwarded-for` entry, so reading
 * that position makes the rate limit trivially bypassable — a fresh fake value
 * per request looks like a fresh IP. The platform appends the real peer last,
 * and sets `x-real-ip` itself, so prefer that and fall back to the last hop.
 */
export function clientIp(req: IncomingMessage): string {
  const realIp = req.headers["x-real-ip"];
  const direct = Array.isArray(realIp) ? realIp[0] : realIp;
  if (direct?.trim()) return direct.trim();

  const forwardedFor = req.headers["x-forwarded-for"];
  const chain = Array.isArray(forwardedFor) ? forwardedFor.join(",") : forwardedFor;
  const hops = chain?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
  return hops.at(-1) || req.socket?.remoteAddress || "unknown";
}

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

    const ip = clientIp(req);

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
