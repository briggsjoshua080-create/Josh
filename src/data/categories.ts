import type { Bilingual, CategoryId, Scenario } from "@/lib/types";
import type { StringKey } from "@/lib/strings";

export interface Category {
  id: CategoryId;
  label: Bilingual;
  /** Icon name from src/components/Icon.tsx */
  icon: string;
}

/** Shared by every screen that shows a scenario's difficulty (Scenarios, Today). */
export const DIFFICULTY_LABEL: Record<Scenario["difficulty"], StringKey> = {
  1: "difficultyBeginner",
  2: "difficultyIntermediate",
  3: "difficultyAdvanced",
};

export const CATEGORIES: Category[] = [
  { id: "business", label: { en: "Business & Pitches", de: "Business & Pitches" }, icon: "briefcase" },
  { id: "interview", label: { en: "Job Interviews", de: "Vorstellungsgespräche" }, icon: "handshake" },
  { id: "storytelling", label: { en: "Storytelling", de: "Storytelling" }, icon: "book" },
  { id: "occasions", label: { en: "Toasts & Occasions", de: "Reden & Anlässe" }, icon: "glass" },
  { id: "difficult", label: { en: "Difficult Conversations", de: "Schwierige Gespräche" }, icon: "scale" },
  { id: "debate", label: { en: "Debate & Impromptu", de: "Debatte & Stegreif" }, icon: "bolt" },
  { id: "persuasion", label: { en: "Persuasion", de: "Überzeugen" }, icon: "target" },
  { id: "smalltalk", label: { en: "Small Talk", de: "Small Talk" }, icon: "chat" },
  { id: "crisis", label: { en: "Crisis Communication", de: "Krisenkommunikation" }, icon: "shield" },
  { id: "ted", label: { en: "TED-Style Talks", de: "TED-Style Talks" }, icon: "mic" },
];
