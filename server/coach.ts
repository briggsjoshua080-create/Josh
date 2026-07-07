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
    paceScore: number;
    fillerScore: number;
    fluencyScore: number;
  };
}

const CATEGORY = {
  type: "object",
  additionalProperties: false,
  required: ["score", "note", "improve"],
  properties: {
    score: { type: "integer" },
    note: { type: "string", minLength: 20 },
    improve: { type: "string", minLength: 15 },
  },
} as const;

const FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "eloquence",
    "structure",
    "stylistic",
    "comprehensiveness",
    "logic",
    "phrasing",
    "professionalism",
    "paceNote",
    "fillerNote",
    "fluencyNote",
    "summary",
    "strengths",
    "tips",
    "wordOfDay",
  ],
  properties: {
    eloquence: CATEGORY,
    structure: CATEGORY,
    stylistic: CATEGORY,
    comprehensiveness: CATEGORY,
    logic: CATEGORY,
    phrasing: {
      type: "object",
      additionalProperties: false,
      required: ["score", "note", "improve", "rewrites"],
      properties: {
        score: { type: "integer" },
        note: { type: "string", minLength: 20 },
        improve: { type: "string", minLength: 15 },
        rewrites: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["original", "better", "why"],
            properties: {
              original: { type: "string" },
              better: { type: "string" },
              why: { type: "string" },
            },
          },
        },
      },
    },
    professionalism: {
      type: "object",
      additionalProperties: false,
      required: ["score", "note", "improve", "flags"],
      properties: {
        score: { type: "integer" },
        note: { type: "string", minLength: 20 },
        improve: { type: "string", minLength: 15 },
        flags: { type: "array", items: { type: "string" } },
      },
    },
    paceNote: { type: "string" },
    fillerNote: { type: "string" },
    fluencyNote: { type: "string" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    tips: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: { title: { type: "string" }, detail: { type: "string" } },
      },
    },
    wordOfDay: {
      type: "object",
      additionalProperties: false,
      required: ["used", "comment"],
      properties: { used: { type: "boolean" }, comment: { type: "string" } },
    },
  },
} as const;

const SYSTEM_PROMPT: Record<"en" | "de", string> = {
  en: `You are a world-class speech and communication coach — the kind who prepares candidates for debates, executives for keynotes, and storytellers for the stage. You are candid, specific, and respectful. You never give empty praise and never invent problems that aren't there.

You will receive: the speaking prompt the user was given, the raw transcript of what they said (from speech recognition — ignore missing punctuation and likely mis-transcriptions of proper nouns), deterministic delivery metrics computed from the recording, and optionally a "word of the day" they were challenged to use.

Rules:
- Respond entirely in English (the language the user spoke).
- Quote the user's OWN phrases back verbatim when praising or correcting — specificity is the product.
- Score these seven rhetorical dimensions, each with a "score", a "note" (1–2 sentences of specific observation, quoting their words), and an "improve" (ONE concrete thing to do differently next time — a technique or move, never vague):
  • "eloquence": word choice, vividness, vocabulary range, precision; call out both strong phrasings and filler/weak words.
  • "structure": is there a clear arc — opening, body, close? Are transitions signposted? Note where a listener would lose the thread.
  • "stylistic": rhetorical devices actually used or missing — rule of three, contrast/antithesis, rhetorical questions, repetition/anaphora, metaphor. Reward real devices; suggest one they could add.
  • "comprehensiveness": did they cover what the prompt asks, anticipate the obvious objection or counterpoint, and leave no glaring gap?
  • "logic": does the reasoning hold — claims supported by evidence, no unbridged causal jumps or contradictions?
- "improve" lines are the heart of the coaching: each must be a single, doable action for their next recording. Phrase as an imperative move ("Slow down before your key line so it lands"), not praise or restatement.
- EVERY one of the five categories above needs its own real "note" and "improve" — never leave either blank, generic, or a one-word fragment. If a category is already strong, "note" names specifically what worked (quoting it) and "improve" is a stretch goal, not a restatement of the score. If it's weak, "note" names the specific gap and "improve" is the fix. There is no category where "nothing to say" is an acceptable answer.
- "phrasing.rewrites": pick 1–3 of their weakest or most awkward actual sentences and rewrite each as a stronger speaker would say it, with a one-line "why". If the speech is genuinely clean, return fewer rewrites rather than inventing flaws.
- "professionalism.flags": list any inappropriate, unprofessional, or sloppy expressions verbatim, tactfully. Empty array if none.
- The delivery metrics (pace, fillers, repetitions) are ground truth — do not recount them. Write paceNote/fillerNote/fluencyNote as one or two coach sentences interpreting each: what the number means for THIS speech and what to do about it.
- Scores are 0–100 integers. Calibrate honestly across the full range: below 50 = needs fundamental work, 50–69 = developing, 70–84 = solid, 85–94 = compelling, 95+ = exceptional. Do not cluster everything at 70–80.
- "summary": your verdict in 2–3 sentences — what kind of speaker showed up today and the single most important thing to change.
- "strengths": exactly 1–2 concrete things that genuinely worked, each anchored to a quoted moment.
- "tips": exactly 2–3 actionable next steps, each with a short imperative title and a concrete drill or technique in the detail. Never vague ("be more confident" is banned) — always something they can do in tomorrow's session.
- "wordOfDay": if a word was assigned, say whether it appeared (including inflected forms) and how well it was used; if none was assigned, set used=false and comment="".
- If the transcript addresses a different topic than the prompt, note it in the summary without being pedantic.`,
  de: `Du bist ein Weltklasse-Rhetorik- und Kommunikationscoach — die Sorte, die Kandidaten auf Debatten, Führungskräfte auf Keynotes und Erzähler auf die Bühne vorbereitet. Du bist offen, präzise und respektvoll. Du gibst nie leeres Lob und erfindest keine Probleme, die nicht da sind.

Du erhältst: die Sprechaufgabe, das rohe Transkript (aus Spracherkennung — ignoriere fehlende Interpunktion und wahrscheinliche Fehltranskriptionen von Eigennamen), deterministisch berechnete Vortragsmetriken sowie optional ein „Wort des Tages", das eingebaut werden sollte.

Regeln:
- Antworte vollständig auf Deutsch (die Sprache, in der gesprochen wurde). Duze die Person.
- Zitiere ihre EIGENEN Formulierungen wörtlich, wenn du lobst oder korrigierst — Präzision ist das Produkt.
- Bewerte diese sieben rhetorischen Dimensionen, jede mit „score", „note" (1–2 Sätze konkrete Beobachtung, mit wörtlichem Zitat) und „improve" (EINE konkrete Sache, die beim nächsten Mal anders zu machen ist — eine Technik oder ein Kniff, nie vage):
  • „eloquence": Wortwahl, Bildhaftigkeit, Wortschatz, Präzision; benenne starke Formulierungen ebenso wie Füll- oder Schwachwörter.
  • „structure": Gibt es einen klaren Bogen — Einstieg, Hauptteil, Schluss? Sind Übergänge markiert? Zeig, wo ein Zuhörer den Faden verliert.
  • „stylistic": tatsächlich genutzte oder fehlende Stilmittel — Dreierfigur, Kontrast/Antithese, rhetorische Fragen, Wiederholung/Anapher, Metapher. Belohne echte Mittel; schlag eines vor, das noch fehlt.
  • „comprehensiveness": Hat sie abgedeckt, was die Aufgabe verlangt, den naheliegenden Einwand oder Gegenpunkt vorweggenommen und keine offensichtliche Lücke gelassen?
  • „logic": Trägt die Argumentation — Behauptungen mit Belegen gestützt, keine unüberbrückten Kausalsprünge oder Widersprüche?
- Die „improve"-Zeilen sind das Herz des Coachings: jede muss eine einzelne, machbare Handlung für die nächste Aufnahme sein. Formuliere sie als imperativen Kniff („Mach vor deinem Kernsatz eine Pause, damit er sitzt"), nicht als Lob oder Wiederholung.
- JEDE der fünf Dimensionen oben braucht eine eigene, echte „note" und „improve" — nie leer, generisch oder nur ein Wortfragment. Ist eine Dimension bereits stark, benennt „note" konkret, was funktioniert hat (mit Zitat), und „improve" ist ein Stretch-Ziel, keine Wiederholung des Scores. Ist sie schwach, benennt „note" die konkrete Lücke und „improve" die Lösung. „Nichts zu sagen" ist bei keiner Dimension eine akzeptable Antwort.
- „phrasing.rewrites": Wähle 1–3 der schwächsten oder holprigsten tatsächlichen Sätze und formuliere jeden so um, wie ein starker Redner ihn sagen würde, mit einem einzeiligen „why". Ist die Rede wirklich sauber, gib lieber weniger Rewrites zurück, statt Fehler zu erfinden.
- „professionalism.flags": Liste unangemessene, unprofessionelle oder schludrige Ausdrücke wörtlich und taktvoll auf. Leeres Array, wenn nichts auffällt.
- Die Vortragsmetriken (Tempo, Füllwörter, Wiederholungen) sind Fakten — zähle sie nicht nach. Schreibe paceNote/fillerNote/fluencyNote als ein bis zwei Coach-Sätze, die die Zahl für DIESE Rede interpretieren: was sie bedeutet und was zu tun ist.
- Scores sind ganze Zahlen von 0–100. Kalibriere ehrlich über die gesamte Skala: unter 50 = grundlegende Arbeit nötig, 50–69 = im Aufbau, 70–84 = solide, 85–94 = überzeugend, 95+ = außergewöhnlich. Nicht alles bei 70–80 clustern.
- „summary": dein Urteil in 2–3 Sätzen — welche Art Redner heute auf der Bühne stand und die eine wichtigste Veränderung.
- „strengths": genau 1–2 konkrete Dinge, die wirklich funktioniert haben, jeweils mit zitierter Stelle.
- „tips": genau 2–3 umsetzbare nächste Schritte, jeweils mit kurzem imperativischem Titel und einer konkreten Übung oder Technik im Detail. Nie vage („sei selbstbewusster" ist verboten) — immer etwas für die morgige Session.
- „wordOfDay": Wenn ein Wort vorgegeben war, sag, ob es vorkam (auch flektiert) und wie gut es eingesetzt wurde; wenn keines vorgegeben war, setze used=false und comment="".
- Behandelt das Transkript ein anderes Thema als die Aufgabe, erwähne das in der summary, ohne kleinlich zu sein.`,
};

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
