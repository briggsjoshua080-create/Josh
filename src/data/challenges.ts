import type { Challenge } from "@/lib/types";

/**
 * The 66-day core program. Difficulty ramps in six acts of eleven days:
 * foundations → structure → story → persuasion → pressure → mastery.
 * Seed set for the core-loop build; full authoring lands with the content pass.
 */
export const CHALLENGES: Challenge[] = [
  {
    day: 1,
    title: { en: "Introduce yourself", de: "Stell dich vor" },
    prompt: {
      en: "Introduce yourself to a room of strangers — your name, what you do, and one thing you genuinely care about. No résumé recital: make them remember one thing.",
      de: "Stell dich einem Raum voller Fremder vor — dein Name, was du tust und eine Sache, die dir wirklich wichtig ist. Kein Lebenslauf-Vortrag: Sorg dafür, dass sie sich an eine Sache erinnern.",
    },
    focus: {
      en: "One clear thread. End on a full sentence, not a trail-off.",
      de: "Ein roter Faden. Ende mit einem ganzen Satz, nicht im Verlaufen.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    day: 2,
    title: { en: "Your yesterday, out loud", de: "Dein gestriger Tag, laut" },
    prompt: {
      en: "Describe your day yesterday as if telling a friend — but give it a beginning, a turn, and an ending. Find the one moment worth telling.",
      de: "Beschreibe deinen gestrigen Tag, als würdest du einem Freund erzählen — aber gib ihm Anfang, Wendung und Ende. Finde den einen erzählenswerten Moment.",
    },
    focus: {
      en: "Structure over chronology. Skip the boring parts on purpose.",
      de: "Struktur statt Chronologie. Lass Langweiliges bewusst weg.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    day: 3,
    title: { en: "Explain your craft", de: "Erklär dein Handwerk" },
    prompt: {
      en: "Explain what you do for work (or study) to a curious twelve-year-old. No jargon survives. Use one concrete comparison from everyday life.",
      de: "Erkläre einem neugierigen Zwölfjährigen, was du beruflich machst (oder studierst). Kein Fachwort überlebt. Nutze einen konkreten Vergleich aus dem Alltag.",
    },
    focus: {
      en: "Simplicity is a skill. One analogy carries the whole talk.",
      de: "Einfachheit ist Können. Eine Analogie trägt die ganze Rede.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
];

/** Days 67+ cycle through these with the day number carried forward. */
export const ADVANCED_ROTATION: Omit<Challenge, "day">[] = [
  {
    title: { en: "The commencement address", de: "Die Abschlussrede" },
    prompt: {
      en: "Deliver two minutes of a commencement speech to graduates entering your field. One hard truth, one genuine encouragement, one memorable closing line.",
      de: "Halte zwei Minuten einer Abschlussrede für Absolventen deines Fachs. Eine harte Wahrheit, eine echte Ermutigung, ein einprägsamer Schlusssatz.",
    },
    focus: {
      en: "Gravity without pomposity. The last sentence is the speech.",
      de: "Gewicht ohne Pathos. Der letzte Satz ist die Rede.",
    },
    difficulty: 5,
    targetSec: [100, 150],
  },
  {
    title: { en: "Defend the indefensible", de: "Verteidige das Unhaltbare" },
    prompt: {
      en: "Argue convincingly for an opinion you personally reject. Steelman it — your audience should not be able to tell you disagree.",
      de: "Argumentiere überzeugend für eine Meinung, die du persönlich ablehnst. Steelmanne sie — dein Publikum darf nicht merken, dass du anderer Ansicht bist.",
    },
    focus: {
      en: "Total commitment. Any wink to the audience breaks it.",
      de: "Volles Commitment. Jedes Augenzwinkern zerstört es.",
    },
    difficulty: 5,
    targetSec: [90, 150],
  },
];
