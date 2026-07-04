import type { Scenario } from "@/lib/types";

/**
 * The standalone practice library (70 scenarios across 10 categories).
 * Seed set for the core-loop build; full authoring lands with the content pass.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "biz-elevator-30",
    category: "business",
    title: { en: "The 30-second elevator pitch", de: "Der 30-Sekunden-Elevator-Pitch" },
    prompt: {
      en: "You step into an elevator with the investor you've been chasing for months. You have thirty seconds: what you're building, why it wins, what you need.",
      de: "Du steigst in den Aufzug — neben dir der Investor, den du seit Monaten erreichen willst. Dreißig Sekunden: Was du baust, warum es gewinnt, was du brauchst.",
    },
    difficulty: 2,
    targetSec: [25, 45],
  },
  {
    id: "story-weekend",
    category: "storytelling",
    title: { en: "Your weekend, but a story", de: "Dein Wochenende, aber als Geschichte" },
    prompt: {
      en: "Tell the story of your last weekend so that a stranger would actually want to hear the ending. Pick one thread; give it stakes, however small.",
      de: "Erzähle dein letztes Wochenende so, dass ein Fremder wirklich das Ende hören will. Wähle einen Faden; gib ihm Fallhöhe, und sei sie noch so klein.",
    },
    difficulty: 1,
    targetSec: [60, 120],
  },
  {
    id: "occ-wedding-toast",
    category: "occasions",
    title: { en: "The wedding toast", de: "Die Hochzeitsrede" },
    prompt: {
      en: "Your best friend just got married. Raise a glass: one story that captures who they are, one line about the couple, one wish for their future.",
      de: "Dein bester Freund hat gerade geheiratet. Erhebe das Glas: eine Geschichte, die zeigt, wer er ist, ein Satz über das Paar, ein Wunsch für die Zukunft.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
];
