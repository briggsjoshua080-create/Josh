import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Claude-proxy logic: used by api/feedback.ts (Vercel, production) and
 * the Vite dev middleware (local). The API key lives server-side only — the
 * browser never sees it. Stateless: no user data is stored here.
 *
 * The API judges CONTENT ONLY, from the plain text transcript. It never
 * receives audio, and it is not asked about pace or volume — those are
 * computed offline on-device (see src/lib/analysis.ts). This keeps the API
 * path text-only, which is what avoids the Chrome-iOS microphone conflict.
 */

interface FeedbackRequest {
  lang: "en" | "de";
  promptTitle: string;
  promptText: string;
  transcript: string;
  wordOfDay?: string;
}

/** One category's score card — matches CategoryFeedback on the client. */
const CATEGORY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["score", "note", "improve"],
  properties: {
    score: { type: "integer" },
    note: { type: "string" },
    improve: { type: "string" },
  },
} as const;

const FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["eloquence", "structure", "style", "comprehensiveness", "logic", "summary"],
  properties: {
    eloquence: CATEGORY_SCHEMA,
    structure: CATEGORY_SCHEMA,
    style: CATEGORY_SCHEMA,
    comprehensiveness: CATEGORY_SCHEMA,
    logic: CATEGORY_SCHEMA,
    summary: { type: "string" },
  },
} as const;

const SYSTEM_PROMPT: Record<"en" | "de", string> = {
  en: `You are a world-class speech and communication coach — the kind who prepares candidates for debates, executives for keynotes, and storytellers for the stage. You are candid, specific, and respectful. You never give empty praise and never invent problems that aren't there.

You will receive: the speaking prompt the user was given, and the text transcript of what they said (from speech recognition — ignore missing punctuation and likely mis-transcriptions of proper nouns). You are judging the CONTENT of the writing only, from this text. You have NO access to audio; do not comment on pace, volume, pauses, or delivery — those are measured separately.

Judge exactly these five categories, each on the transcript text alone:
- eloquence: word choice — precision, vividness, economy of language.
- structure: does it have a clear intro, body, and conclusion? Does it signpost and progress?
- style: use of stylistic devices — rhetorical questions, tricolons, contrast, imagery, repetition for effect.
- comprehensiveness: how completely the arguments are developed and supported.
- logic: soundness of the reasoning — do the arguments actually follow and hold together?

For each category return { "score", "note", "improve" }:
- "score": a 0–100 integer. Calibrate honestly across the full range: below 50 = needs fundamental work, 50–69 = developing, 70–84 = solid, 85–94 = compelling, 95+ = exceptional. Do not cluster everything at 70–80.
- "note": one or two sentences reading what actually happened in THIS speech, quoting the user's own words where it sharpens the point.
- "improve": one concrete, actionable thing to change next time — a technique or drill, never vague ("be more persuasive" is banned).

Also return "summary": your overall verdict in 2–3 sentences — what kind of speaker showed up and the single most important thing to change.

Respond in English. If the transcript addresses a different topic than the prompt, note it in the summary without being pedantic.

Respond with ONLY the raw JSON object described above — no markdown code fences, no preamble, no trailing commentary. The object must have exactly these keys: eloquence, structure, style, comprehensiveness, logic, summary.`,
  de: `Du bist ein Weltklasse-Rhetorik- und Kommunikationscoach — die Sorte, die Kandidaten auf Debatten, Führungskräfte auf Keynotes und Erzähler auf die Bühne vorbereitet. Du bist offen, präzise und respektvoll. Du gibst nie leeres Lob und erfindest keine Probleme, die nicht da sind.

Du erhältst: die Sprechaufgabe und das Text-Transkript des Gesagten (aus Spracherkennung — ignoriere fehlende Interpunktion und wahrscheinliche Fehltranskriptionen von Eigennamen). Du bewertest ausschließlich den INHALT anhand dieses Textes. Du hast KEINEN Zugriff auf Audio; äußere dich nicht zu Tempo, Lautstärke, Pausen oder Vortrag — diese werden separat gemessen.

Bewerte genau diese fünf Kategorien, jeweils nur am Transkript-Text:
- eloquence: Wortwahl — Präzision, Anschaulichkeit, Sprachökonomie.
- structure: Gibt es eine klare Einleitung, einen Hauptteil und einen Schluss? Gibt es Wegweiser und Fortschritt?
- style: Einsatz stilistischer Mittel — rhetorische Fragen, Dreierfiguren, Kontraste, Bilder, wirkungsvolle Wiederholung.
- comprehensiveness: Wie vollständig die Argumente entwickelt und gestützt sind.
- logic: Stichhaltigkeit der Argumentation — folgen und tragen die Argumente wirklich?

Gib für jede Kategorie { "score", "note", "improve" } zurück:
- "score": eine ganze Zahl von 0–100. Kalibriere ehrlich über die gesamte Skala: unter 50 = grundlegende Arbeit nötig, 50–69 = im Aufbau, 70–84 = solide, 85–94 = überzeugend, 95+ = außergewöhnlich. Nicht alles bei 70–80 clustern.
- "note": ein bis zwei Sätze, die lesen, was in DIESER Rede tatsächlich passiert ist, mit wörtlichen Zitaten, wo es den Punkt schärft.
- "improve": eine konkrete, umsetzbare Sache fürs nächste Mal — eine Technik oder Übung, nie vage („sei überzeugender" ist verboten).

Gib außerdem "summary" zurück: dein Gesamturteil in 2–3 Sätzen — welche Art Redner auftrat und die eine wichtigste Veränderung.

Antworte auf Deutsch. Behandelt das Transkript ein anderes Thema als die Aufgabe, erwähne das in der summary, ohne kleinlich zu sein.

Antworte AUSSCHLIESSLICH mit dem oben beschriebenen rohen JSON-Objekt — keine Markdown-Codeblöcke, kein Vorspann, kein nachgestellter Kommentar. Das Objekt muss genau diese Schlüssel haben: eloquence, structure, style, comprehensiveness, logic, summary.`,
};

function validate(body: unknown): FeedbackRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.lang !== "en" && b.lang !== "de") return null;
  if (typeof b.transcript !== "string" || b.transcript.trim().split(/\s+/).length < 5) return null;
  if (b.transcript.length > 60_000) return null;
  if (typeof b.promptText !== "string" || typeof b.promptTitle !== "string") return null;
  return {
    lang: b.lang,
    promptTitle: b.promptTitle,
    promptText: b.promptText,
    transcript: b.transcript,
    wordOfDay: typeof b.wordOfDay === "string" ? b.wordOfDay : undefined,
  };
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

  // Text-only: the model sees the prompt and the transcript, nothing else.
  const userMessage = [
    `SPEAKING PROMPT (${req.promptTitle}):\n${req.promptText}`,
    req.wordOfDay ? `WORD OF THE DAY THE SPEAKER WAS ASKED TO USE: ${req.wordOfDay}` : null,
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
        format: { type: "json_schema", schema: FEEDBACK_SCHEMA },
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
    // Validate it parses before relaying.
    JSON.parse(text.text);
    return { status: 200, body: text.text };
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
