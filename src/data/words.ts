import type { WordEntry } from "@/lib/types";

/**
 * Word of the day — authored per language (an English eloquence word for EN
 * mode, a German one for DE mode; not translations of each other).
 * Seed set; full authoring lands with the content pass.
 */
export const WORDS_EN: WordEntry[] = [
  {
    word: "eloquent",
    pos: "adjective",
    pronunciation: "EL-uh-kwent",
    definition: "Fluent and persuasive in speaking; vividly expressive.",
    example: "Her eloquent closing turned a skeptical room into an ovation.",
  },
  {
    word: "galvanize",
    pos: "verb",
    pronunciation: "GAL-vuh-nize",
    definition: "To shock or excite someone into taking action.",
    example: "One blunt question galvanized the whole team into rewriting the plan.",
  },
  {
    word: "succinct",
    pos: "adjective",
    pronunciation: "suk-SINKT",
    definition: "Briefly and clearly expressed; no wasted words.",
    example: "Give me the succinct version first — details can follow.",
  },
];

export const WORDS_DE: WordEntry[] = [
  {
    word: "prägnant",
    pos: "Adjektiv",
    pronunciation: "präg-NANT",
    definition: "Knapp und treffend formuliert; auf den Punkt.",
    example: "Ihr prägnantes Fazit blieb länger im Raum als die ganze Präsentation.",
  },
  {
    word: "stichhaltig",
    pos: "Adjektiv",
    pronunciation: "STICH-hal-tig",
    definition: "Einer Prüfung standhaltend; überzeugend begründet.",
    example: "Er lieferte drei stichhaltige Argumente, und der Widerstand brach.",
  },
  {
    word: "eindringlich",
    pos: "Adjektiv",
    pronunciation: "EIN-dring-lich",
    definition: "Nachdrücklich und intensiv; unter die Haut gehend.",
    example: "Ihre eindringliche Warnung veränderte die Stimmung im Saal sofort.",
  },
];
