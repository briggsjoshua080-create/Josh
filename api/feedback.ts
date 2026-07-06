import { IncomingMessage } from "http";
import { handleFeedback } from "../server/coach.js";

export const config = { runtime: "nodejs" };

type ResponseLike = {
  statusCode?: number;
  status?: (code: number) => ResponseLike;
  json?: (obj: any) => void;
  end?: (data?: string) => void;
  setHeader?: (key: string, value: string) => void;
};

export default async function handler(req: IncomingMessage & { body?: string }, res: ResponseLike) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const bodyText = await new Promise<string>((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString?.() || chunk;
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
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader?.("content-type", "application/json");
    res.end?.(JSON.stringify({ error: error.message || "Internal server error" }));
  }
}
