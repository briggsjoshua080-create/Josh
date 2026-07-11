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

/** Array of { <a>: string, <b>: string } pairs — the shape of every list section. */
function pairList(a: string, b: string) {
  return {
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      required: [a, b],
      properties: { [a]: { type: "string" }, [b]: { type: "string" } },
    },
  } as const;
}

const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "scores",
    "oneLiners",
    "whatWorked",
    "strongWords",
    "improvements",
    "stylisticDevices",
    "tighten",
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
    whatWorked: pairList("point", "detail"),
    strongWords: pairList("word", "note"),
    improvements: pairList("issue", "action"),
    stylisticDevices: pairList("device", "note"),
    tighten: {
      type: "object",
      additionalProperties: false,
      required: ["quote", "rewrite"],
      properties: { quote: { type: "string" }, rewrite: { type: "string" } },
    },
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
- "whatWorked": 2–4 things the speaker genuinely did well. Each item: "point" = the strength in a short phrase, "detail" = one sentence of supporting evidence, quoting their words where possible. Never pad with empty praise — fewer honest items beat filler.
- "strongWords": 4–6 genuinely impactful words or short phrases they ACTUALLY used (verbatim). Each item: "word" = the word/phrase, "note" = one brief note on where or how it worked well. Fewer (or empty) if the speech truly had none.
- "improvements": EXACTLY 3 items, ranked most impactful first. Each item: "issue" = one short sentence naming the problem, "action" = one concrete, actionable step to fix it next time. Specific to THIS speech, not generic advice.
- "stylisticDevices": rhetorical/stylistic techniques found in the transcript (repetition, rule of three, contrast, metaphor, rhetorical question, anaphora, deliberate pauses/pacing, …). Each item: "device" = the technique name, "note" = one sentence on the effect it had or how to use it more deliberately. If none were used, return 1–2 devices that would suit this speech, with the note framed as how to add it. At most 4 items.
- "tighten": their weakest or most rambling verbatim sentence, and a one-line rewrite a stronger speaker would say. If the speech is genuinely clean, pick the flattest line and sharpen it.
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
- "whatWorked": 2–4 Dinge, die wirklich gut gelungen sind. Pro Eintrag: "point" = die Stärke als kurze Wendung, "detail" = ein Satz Beleg, möglichst mit wörtlichem Zitat. Kein Füll-Lob — lieber weniger ehrliche Punkte als Ausschmückung.
- "strongWords": 4–6 wirklich wirkungsvolle Wörter oder kurze Wendungen, die TATSÄCHLICH gesagt wurden (wörtlich). Pro Eintrag: "word" = das Wort/die Wendung, "note" = eine kurze Notiz, wo oder wie es gut gewirkt hat. Weniger (oder leer), wenn die Rede wirklich keine hatte.
- "improvements": GENAU 3 Einträge, nach Wirkung sortiert — das Wichtigste zuerst. Pro Eintrag: "issue" = ein kurzer Satz, der das Problem benennt, "action" = ein konkreter, umsetzbarer Schritt fürs nächste Mal. Spezifisch für DIESE Rede, keine Allgemeinplätze.
- "stylisticDevices": im Transkript gefundene rhetorische Stilmittel (Wiederholung, Dreierfigur, Kontrast, Metapher, rhetorische Frage, Anapher, bewusste Pausen/Tempo, …). Pro Eintrag: "device" = Name des Stilmittels, "note" = ein Satz zur Wirkung oder dazu, wie es gezielter eingesetzt wird. Wurden keine verwendet, gib 1–2 passende Stilmittel zurück, mit der Notiz, wie man sie einbaut. Höchstens 4 Einträge.
- "tighten": ihr schwächster oder ausschweifendster wörtlicher Satz plus eine einzeilige Neuformulierung, wie ein starker Redner ihn sagen würde. Ist die Rede wirklich sauber, nimm die flachste Zeile und schärfe sie.
- "hardToCatch": Wörter, die die Erkennung wahrscheinlich verstümmelt hat oder die gesprochen schwer zu verstehen wären (Näherung für Artikulationsprobleme). Leeres Array, wenn keine.
- "articulation": 0–100 — wie sauber die Wörter geformt wurden, beurteilt anhand der Transkriptqualität und Wortwahl.
- "cleanSpeechSeconds": deine Schätzung der längsten ununterbrochenen, füllwortfreien Passage in Sekunden, aus den Metriken.
- "confidenceLabel": genau eines von "Tentative", "Hesitant", "Steady", "Assured", "Commanding". "confidenceNote": ein Satz dazu, wie die Souveränität wirkt und wie sie steigt.
- "wpmOverTime": gib [] zurück — die App berechnet das auf dem Gerät.
- Behandelt das Transkript ein anderes Thema als die Aufgabe, spiegle das in den One-Linern zu structure und clarity, ohne kleinlich zu sein.`,
};

/* ————— Daily-word usage check (Today screen "use it in a sentence" bonus) ————— */

interface WordCheckRequest {
  lang: "en" | "de";
  word: string;
  definition: string;
  sentence: string;
}

const WORD_CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["correct", "feedback"],
  properties: {
    correct: { type: "boolean" },
    feedback: { type: "string" },
  },
} as const;

const WORD_CHECK_SYSTEM: Record<"en" | "de", string> = {
  en: `You are a friendly vocabulary coach inside a speech-training app. The user was shown a "word of the day" with its definition and asked to write ONE sentence using it. Judge whether the word (any reasonable inflection of it) is used correctly and appropriately in context: right meaning, sensible grammar, a sentence that would make sense to a listener.

Respond with ONLY a single JSON object matching the required schema — no markdown fences, no commentary.

Rules:
- Respond in English.
- "correct": true only if the word is genuinely used with its correct meaning in a coherent sentence. A sentence that merely mentions or defines the word ("X means…"), uses it with the wrong meaning, or is gibberish is NOT correct.
- Be encouraging but honest — don't pass wrong usage to be nice.
- "feedback": one or two friendly sentences. If correct, briefly affirm what made the usage work. If not, explain what went wrong and point toward a correct use WITHOUT writing the sentence for them.`,
  de: `Du bist ein freundlicher Vokabel-Coach in einer Sprechtrainings-App. Die Person hat ein „Wort des Tages" mit Definition gesehen und sollte EINEN Satz damit schreiben. Beurteile, ob das Wort (in beliebiger sinnvoller Flexion) korrekt und passend im Kontext verwendet wird: richtige Bedeutung, sinnvolle Grammatik, ein Satz, der für Zuhörer Sinn ergibt.

Antworte NUR mit einem einzigen JSON-Objekt nach dem geforderten Schema — keine Markdown-Zäune, kein Kommentar.

Regeln:
- Antworte auf Deutsch und duze die Person.
- "correct": nur true, wenn das Wort wirklich in seiner korrekten Bedeutung in einem stimmigen Satz verwendet wird. Ein Satz, der das Wort nur erwähnt oder definiert („X bedeutet…"), es mit falscher Bedeutung nutzt oder unverständlich ist, zählt NICHT.
- Sei ermutigend, aber ehrlich — winke falsche Verwendungen nicht aus Nettigkeit durch.
- "feedback": ein bis zwei freundliche Sätze. Bei korrekter Verwendung: kurz benennen, was daran gut war. Sonst: erklären, was schiefging, und in Richtung einer korrekten Verwendung zeigen, OHNE den Satz vorzuschreiben.`,
};

function validateWordCheck(body: unknown): WordCheckRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.lang !== "en" && b.lang !== "de") return null;
  if (typeof b.word !== "string" || b.word.trim().length === 0 || b.word.length > 80) return null;
  if (typeof b.definition !== "string" || b.definition.length > 600) return null;
  if (typeof b.sentence !== "string" || b.sentence.trim().length === 0 || b.sentence.length > 600) return null;
  return b as unknown as WordCheckRequest;
}

/**
 * Verify the user's sentence uses the daily word correctly. Same Claude
 * integration and key as handleFeedback — a second, much smaller task on the
 * existing backend, not a new one.
 */
export async function handleWordCheck(
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
  const req = validateWordCheck(parsed);
  if (!req) {
    return { status: 400, body: JSON.stringify({ error: "bad_request" }) };
  }

  const userMessage = [
    `WORD OF THE DAY: ${req.word}`,
    `DEFINITION: ${req.definition}`,
    `USER'S SENTENCE:\n${req.sentence}`,
  ].join("\n\n");

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: WORD_CHECK_SCHEMA },
      },
      system: WORD_CHECK_SYSTEM[req.lang],
      messages: [{ role: "user", content: userMessage }],
    });

    if (response.stop_reason === "refusal") {
      return { status: 502, body: JSON.stringify({ error: "refused" }) };
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return { status: 502, body: JSON.stringify({ error: "empty" }) };
    }
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
