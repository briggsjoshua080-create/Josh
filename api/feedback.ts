import { IncomingMessage } from "http";
import { handleFeedback } from "../server/coach.js";

export const config = { runtime: "nodejs" };

type ResponseLike = {
  statusCode?: number;
  setHeader?: (key: string, value: string) => void;
  end?: (data?: string) => void;
};

export default async function handler(req: IncomingMessage & { body?: string }, res: ResponseLike) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "method_not_allowed" }));
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

    const out = await handleFeedback(bodyText, {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    });

    res.statusCode = out.status;
    res.setHeader?.("content-type", "application/json");
    res.end?.(out.body);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "server_error", detail: error instanceof Error ? error.message : String(error) }));
  }
}
