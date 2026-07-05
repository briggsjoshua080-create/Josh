import { handleFeedback } from "../server/coach.js";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }
  const bodyText = await request.text();
  const out = await handleFeedback(bodyText, {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  });
  return new Response(out.body, {
    status: out.status,
    headers: { "content-type": "application/json" },
  });
}
