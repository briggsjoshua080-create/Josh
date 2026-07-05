import type { Bilingual, CategoryId } from "@/lib/types";

export interface Category {
  id: CategoryId;
  label: Bilingual;
  /** Icon name from src/components/Icon.tsx */
  icon: string;
}

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
