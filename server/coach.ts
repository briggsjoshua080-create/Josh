import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Claude-proxy logic: used by api/feedback.ts (Vercel, production) and
 * the Vite dev middleware (local). The API key lives server-side only — the
 * browser never sees it. Stateless: no user data is stored here.
 */

interface FeedbackRequest {
  lang: "en" | "de";
  promptTitle: string;
  promptText: string;
  transcript: string;
  durationSec: number;
  wordOfDay?: string;
  metrics: {
    wpm: number;
    wordCount: number;
    fillers: { total: number; perMin: number; counts: Record<string, number> };
    repetitions: { count: number; examples: string[] };
    pauses: { count: number; longestMs: number };
    vocab: { unique: number; ttr: number; avgWordLen: number };
    hedges?: { total: number; perMin: number; counts: Record<string, number> };
    paceScore: number;
    fillerScore: number;
    fluencyScore: number;
  };
}

const METRIC_KEYS = [
  "clarity",
  "confidence",
  "structure",
  "pace",
  "fluency",
  "wordPower",
  "conciseness",
  "engagement",
] as const;

const SCORES = {
  type: "object",
  additionalProperties: false,
  required: [...METRIC_KEYS],
  properties: Object.fromEntries(METRIC_KEYS.map((k) => [k, { type: "integer" }])),
} as const;

const ONE_LINERS = {
  type: "object",
  additionalProperties: false,
  required: [...METRIC_KEYS],
  properties: Object.fromEntries(METRIC_KEYS.map((k) => [k, { type: "string" }])),
} as const;

const WORD_COUNT = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["word", "count"],
    properties: { word: { type: "string" }, count: { type: "integer" } },
  },
} as const;

const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "scores",
    "oneLiners",
    "strongestLine",
    "tighten",
    "powerWords",
    "weakWords",
    "hardToCatch",
    "cleanSpeechSeconds",
    "articulation",
    "confidenceLabel",
    "confidenceNote",
    "wpmOverTime",
  ],
  properties: {
    scores: SCORES,
    oneLiners: ONE_LINERS,
    strongestLine: {
      type: "object",
      additionalProperties: false,
      required: ["quote", "why"],
      properties: { quote: { type: "string" }, why: { type: "string" } },
    },
    tighten: {
      type: "object",
      additionalProperties: false,
      required: ["quote", "rewrite"],
      properties: { quote: { type: "string" }, rewrite: { type: "string" } },
    },
    powerWords: WORD_COUNT,
    weakWords: WORD_COUNT,
    hardToCatch: { type: "array", items: { type: "string" } },
    cleanSpeechSeconds: { type: "integer" },
    articulation: { type: "integer" },
    confidenceLabel: { type: "string" },
    confidenceNote: { type: "string" },
    wpmOverTime: { type: "array", items: { type: "number" } },
  },
} as const;

const SYSTEM_PROMPT: Record<"en" | "de", string> = {
  en: `You are a world-class speech and communication coach — the kind who prepares candidates for debates, executives for keynotes, and storytellers for the stage. You are candid, specific, and respectful. You never give empty praise and never invent problems that aren't there.

You will receive: the speaking prompt the user was given, the raw transcript of what they said (from speech recognition — ignore missing punctuation and likely mis-transcriptions of proper nouns), and deterministic delivery metrics computed from the recording.

Respond with ONLY a single JSON object matching the required schema — no markdown fences, no preamble, no commentary.

Rules:
- Respond entirely in English (the language the user spoke).
- Quote the user's OWN phrases back verbatim when praising or correcting — specificity is the product.
- "scores": grade all eight metrics as 0–100 integers. Calibrate honestly across the full range: below 50 = needs fundamental work, 50–69 = developing, 70–84 = solid, 85–94 = compelling, 95+ = exceptional. Do not cluster everything at 70–80.
  • "clarity": how easily a listener follows the ideas — precise wording, concrete referents, no tangled sentences.
  • "confidence": how assured the speaker sounds — committed claims, no hedging ("I think", "maybe"), firm sentence endings.
  • "structure": a clear arc — opening, body, close — with signposted transitions.
  • "pace": the delivery metrics are ground truth; score consistency with the wpm they report.
  • "fluency": flow — the filler and repetition metrics are ground truth; score smoothness of expression on top of them.
  • "wordPower": strong, vivid, precise words versus weak, vague, or clichéd ones.
  • "conciseness": economy — no rambling, no redundant restatement, every sentence earns its place.
  • "engagement": rhetorical devices actually used (rule of three, contrast, rhetorical questions, anaphora, metaphor), vividness, story.
- "oneLiners": for each metric, EXACTLY ONE coach sentence — a specific observation or an imperative move for next time, ideally quoting their words. One sentence, never two.
- "strongestLine": their single best verbatim sentence, and one sentence on why it works.
- "tighten": their weakest or most rambling verbatim sentence, and a one-line rewrite a stronger speaker would say. If the speech is genuinely clean, pick the flattest line and sharpen it.
- "powerWords": up to 6 genuinely strong words/short phrases they used, with counts. "weakWords": up to 6 weak, vague, or overused words with counts. Empty arrays if none.
- "hardToCatch": words the recognition likely garbled or that would be hard to catch when spoken (proxy for articulation trouble). Empty array if none.
- "articulation": 0–100 — how cleanly words were formed, judging from transcription quality and word choice.
- "cleanSpeechSeconds": your estimate of the longest unbroken, filler-free stretch, in seconds, from the metrics.
- "confidenceLabel": exactly one of "Tentative", "Hesitant", "Steady", "Assured", "Commanding". "confidenceNote": one sentence on how the confidence comes across and how to raise it.
- "wpmOverTime": return [] — the app computes this on-device.
- If the transcript addresses a different topic than the prompt, reflect it in the structure and clarity one-liners without being pedantic.`,
  de: `Du bist ein Weltklasse-Rhetorik- und Kommunikationscoach — die Sorte, die Kandidaten auf Debatten, Führungskräfte auf Keynotes und Erzähler auf die Bühne vorbereitet. Du bist offen, präzise und respektvoll. Du gibst nie leeres Lob und erfindest keine Probleme, die nicht da sind.

Du erhältst: die Sprechaufgabe, das rohe Transkript (aus Spracherkennung — ignoriere fehlende Interpunktion und wahrscheinliche Fehltranskriptionen von Eigennamen) sowie deterministisch berechnete Vortragsmetriken.

Antworte NUR mit einem einzigen JSON-Objekt nach dem geforderten Schema — keine Markdown-Zäune, kein Vorspann, kein Kommentar.

Regeln:
- Antworte vollständig auf Deutsch (die Sprache, in der gesprochen wurde). Duze die Person.
- Zitiere ihre EIGENEN Formulierungen wörtlich, wenn du lobst oder korrigierst — Präzision ist das Produkt.
- "scores": Bewerte alle acht Metriken als ganze Zahlen von 0–100. Kalibriere ehrlich über die gesamte Skala: unter 50 = grundlegende Arbeit nötig, 50–69 = im Aufbau, 70–84 = solide, 85–94 = überzeugend, 95+ = außergewöhnlich. Nicht alles bei 70–80 clustern.
  • "clarity": Wie mühelos ein Zuhörer den Gedanken folgt — präzise Wortwahl, konkrete Bezüge, keine verschachtelten Sätze.
  • "confidence": Wie souverän die Person klingt — klare Behauptungen, kein Relativieren („ich glaube", „vielleicht"), feste Satzenden.
  • "structure": Ein klarer Bogen — Einstieg, Hauptteil, Schluss — mit markierten Übergängen.
  • "pace": Die Vortragsmetriken sind Fakten; bewerte konsistent mit den gemessenen WpM.
  • "fluency": Redefluss — Füllwort- und Wiederholungsmetriken sind Fakten; bewerte die Geschmeidigkeit des Ausdrucks darüber hinaus.
  • "wordPower": Starke, bildhafte, präzise Wörter gegenüber schwachen, vagen oder abgegriffenen.
  • "conciseness": Ökonomie — kein Abschweifen, keine redundanten Wiederholungen, jeder Satz verdient seinen Platz.
  • "engagement": Tatsächlich eingesetzte Stilmittel (Dreierfigur, Kontrast, rhetorische Fragen, Anapher, Metapher), Bildhaftigkeit, Erzählung.
- "oneLiners": Pro Metrik GENAU EIN Coach-Satz — eine konkrete Beobachtung oder ein imperativer Kniff fürs nächste Mal, idealerweise mit wörtlichem Zitat. Ein Satz, nie zwei.
- "strongestLine": ihr bester wörtlicher Satz plus ein Satz, warum er funktioniert.
- "tighten": ihr schwächster oder ausschweifendster wörtlicher Satz plus eine einzeilige Neuformulierung, wie ein starker Redner ihn sagen würde. Ist die Rede wirklich sauber, nimm die flachste Zeile und schärfe sie.
- "powerWords": bis zu 6 wirklich starke Wörter/kurze Wendungen mit Zählung. "weakWords": bis zu 6 schwache, vage oder überstrapazierte Wörter mit Zählung. Leere Arrays, wenn nichts auffällt.
- "hardToCatch": Wörter, die die Erkennung wahrscheinlich verstümmelt hat oder die gesprochen schwer zu verstehen wären (Näherung für Artikulationsprobleme). Leeres Array, wenn keine.
- "articulation": 0–100 — wie sauber die Wörter geformt wurden, beurteilt anhand der Transkriptqualität und Wortwahl.
- "cleanSpeechSeconds": deine Schätzung der längsten ununterbrochenen, füllwortfreien Passage in Sekunden, aus den Metriken.
- "confidenceLabel": genau eines von "Tentative", "Hesitant", "Steady", "Assured", "Commanding". "confidenceNote": ein Satz dazu, wie die Souveränität wirkt und wie sie steigt.
- "wpmOverTime": gib [] zurück — die App berechnet das auf dem Gerät.
- Behandelt das Transkript ein anderes Thema als die Aufgabe, spiegle das in den One-Linern zu structure und clarity, ohne kleinlich zu sein.`,
};

/** Remove accidental markdown code fences around a JSON payload. */
export function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function validate(body: unknown): FeedbackRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.lang !== "en" && b.lang !== "de") return null;
  if (typeof b.transcript !== "string" || b.transcript.trim().split(/\s+/).length < 5) return null;
  if (b.transcript.length > 60_000) return null;
  if (typeof b.promptText !== "string" || typeof b.promptTitle !== "string") return null;
  if (typeof b.durationSec !== "number" || typeof b.metrics !== "object" || b.metrics === null) return null;
  return b as unknown as FeedbackRequest;
}

export async function handleFeedback(
  bodyText: string,
  env: Record<string, string | undefined>,
): Promise<{ status: number; body: string }> {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 503, body: JSON.stringify({ error: "no_key" }) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return { status: 400, body: JSON.stringify({ error: "bad_json" }) };
  }
  const req = validate(parsed);
  if (!req) {
    return { status: 400, body: JSON.stringify({ error: "bad_request" }) };
  }

  const minutes = Math.max(req.durationSec / 60, 0.02).toFixed(1);
  const userMessage = [
    `SPEAKING PROMPT (${req.promptTitle}):\n${req.promptText}`,
    req.wordOfDay ? `WORD OF THE DAY TO USE: ${req.wordOfDay}` : null,
    `DURATION: ${minutes} min`,
    `DELIVERY METRICS (deterministic, treat as ground truth):\n${JSON.stringify(req.metrics, null, 2)}`,
    `TRANSCRIPT:\n${req.transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: REPORT_SCHEMA },
      },
      system: SYSTEM_PROMPT[req.lang],
      messages: [{ role: "user", content: userMessage }],
    });

    if (response.stop_reason === "refusal") {
      return { status: 502, body: JSON.stringify({ error: "refused" }) };
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return { status: 502, body: JSON.stringify({ error: "empty" }) };
    }
    // Defensive: strip accidental ``` fences, validate it parses, then relay
    // the clean JSON.
    const clean = stripFences(text.text);
    JSON.parse(clean);
    return { status: 200, body: clean };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return { status: 429, body: JSON.stringify({ error: "rate_limited" }) };
    }
    if (err instanceof Anthropic.APIError) {
      return { status: 502, body: JSON.stringify({ error: "upstream", detail: err.message }) };
    }
    return { status: 500, body: JSON.stringify({ error: "server_error" }) };
  }
}
