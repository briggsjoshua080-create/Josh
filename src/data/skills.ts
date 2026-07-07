import type { Bilingual, CategoryId, Scores } from "@/lib/types";

/** A score dimension a scenario category strengthens (drives "Recommended next"). */
export type SkillDimension = Exclude<keyof Scores, "overall">;

export interface SkillInfo {
  /** The skill this category trains, phrased for a card ("Reduces filler words"). */
  trains: Bilingual;
  /** One sentence on why practicing it helps. */
  why: Bilingual;
  /** Feedback-report dimensions this category improves most directly. */
  dimensions: SkillDimension[];
}

/**
 * Speaking-skill metadata per scenario category. Each entry maps a category to
 * the feedback dimensions it trains, so the library can recommend the category
 * that targets the user's weakest score.
 */
export const SKILLS: Record<CategoryId, SkillInfo> = {
  business: {
    trains: { en: "Sharpens structure", de: "Schärft die Struktur" },
    why: {
      en: "Forces a clear point-first arc, so decision-makers follow you in seconds.",
      de: "Erzwingt einen klaren Aufbau mit der Kernaussage zuerst — Entscheider folgen dir in Sekunden.",
    },
    dimensions: ["structure", "comprehensiveness"],
  },
  interview: {
    trains: { en: "Builds composure under questions", de: "Trainiert Souveränität bei Fragen" },
    why: {
      en: "Rehearsing high-stakes answers keeps your delivery steady when it counts.",
      de: "Wer heikle Antworten probt, bleibt im Ernstfall ruhig und flüssig.",
    },
    dimensions: ["fluency", "professionalism"],
  },
  storytelling: {
    trains: { en: "Strengthens vivid wording", de: "Stärkt bildhafte Sprache" },
    why: {
      en: "Stories reward concrete images and rhythm, stretching your expressive range.",
      de: "Geschichten belohnen konkrete Bilder und Rhythmus — das erweitert deinen Ausdruck.",
    },
    dimensions: ["eloquence", "stylistic"],
  },
  occasions: {
    trains: { en: "Polishes phrasing and projection", de: "Poliert Ausdruck und Projektion" },
    why: {
      en: "Toasts demand warm, precise wording delivered loud enough to reach every table.",
      de: "Reden zu Anlässen verlangen warme, präzise Worte — laut genug für den letzten Tisch.",
    },
    dimensions: ["phrasing", "volume"],
  },
  difficult: {
    trains: { en: "Trains careful wording", de: "Trainiert bedachte Wortwahl" },
    why: {
      en: "Hard conversations punish sloppy phrasing, so you learn to weigh every sentence.",
      de: "Schwierige Gespräche bestrafen schlampige Formulierungen — du lernst, jeden Satz abzuwägen.",
    },
    dimensions: ["phrasing", "professionalism"],
  },
  debate: {
    trains: { en: "Tightens argument logic", de: "Schärft die Argumentationslogik" },
    why: {
      en: "Thinking on your feet forces claim–evidence–conclusion chains at speaking speed.",
      de: "Stegreif-Denken erzwingt Behauptung–Beleg–Schluss in Echtzeit.",
    },
    dimensions: ["logic", "fluency"],
  },
  persuasion: {
    trains: { en: "Builds convincing arguments", de: "Baut überzeugende Argumente" },
    why: {
      en: "Persuading skeptics teaches you to order reasons so each one lands harder.",
      de: "Skeptiker zu überzeugen lehrt dich, Argumente so zu ordnen, dass jedes stärker trifft.",
    },
    dimensions: ["logic", "structure"],
  },
  smalltalk: {
    trains: { en: "Reduces filler words", de: "Reduziert Füllwörter" },
    why: {
      en: "Low-stakes chat is the safest place to swap every “um” for a calm pause.",
      de: "Lockere Gespräche sind der sicherste Ort, jedes „äh“ gegen eine ruhige Pause zu tauschen.",
    },
    dimensions: ["fillers", "fluency"],
  },
  crisis: {
    trains: { en: "Steadies your pace under pressure", de: "Stabilisiert dein Tempo unter Druck" },
    why: {
      en: "Delivering bad news calmly trains a controlled tempo when adrenaline pushes you to rush.",
      de: "Schlechte Nachrichten ruhig zu überbringen trainiert kontrolliertes Tempo, wenn Adrenalin dich hetzt.",
    },
    dimensions: ["pace", "comprehensiveness"],
  },
  ted: {
    trains: { en: "Elevates stage presence", de: "Steigert die Bühnenpräsenz" },
    why: {
      en: "Talk-style delivery combines pacing, imagery, and projection into one performance.",
      de: "Der Talk-Stil verbindet Tempo, Bilder und Projektion zu einem Auftritt.",
    },
    dimensions: ["pace", "stylistic", "eloquence"],
  },
};
