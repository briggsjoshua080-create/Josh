import cards from "./library.json";
import type { Bilingual, Lang } from "@/lib/types";

/**
 * The Library: curated speaking & communication techniques, bundled with the
 * app as static JSON (library.json) so it works fully offline. To add cards,
 * append to library.json — the UI, search, and filter chips derive everything
 * (including the tag list) from the data.
 *
 * Every user-facing field is authored in both languages. It used to be English
 * only, which left a German user reading translated chrome wrapped around
 * entirely English cards — and searching "Lampenfieber" found nothing in a
 * library that demonstrably covers it.
 */
export interface LibraryCard {
  id: string;
  title: Bilingual;
  /** Plain-language explanation of the technique. */
  technique: Bilingual;
  context_tags: string[];
  effect_tags: string[];
  /** Citation. A proper noun, so it is not translated. */
  source: string;
  /** 1 = primary research, 2 = expert practice. */
  source_tier: number;
  /** Present only when the evidence is contested. */
  caveat?: Bilingual;
}

export const LIBRARY_CARDS: LibraryCard[] = cards;

/**
 * Display label per tag slug, in both languages.
 *
 * Previously derived by title-casing the English slug, which cannot produce a
 * German label at all — so the filter chips stayed English however the app was
 * set.
 */
const TAG_LABELS: Record<string, Bilingual> = {
  public_speaking: { en: "Public Speaking", de: "Vor Publikum" },
  interviews: { en: "Interviews", de: "Bewerbungsgespräche" },
  high_stakes: { en: "High Stakes", de: "Hoher Einsatz" },
  virtual: { en: "Virtual", de: "Digital" },
  presentations: { en: "Presentations", de: "Präsentationen" },
  small_talk: { en: "Small Talk", de: "Small Talk" },
  impromptu: { en: "Impromptu", de: "Stegreif" },
  difficult_conversations: { en: "Difficult Conversations", de: "Schwierige Gespräche" },
  persuasion: { en: "Persuasion", de: "Überzeugen" },
  negotiation: { en: "Negotiation", de: "Verhandeln" },
  networking: { en: "Networking", de: "Netzwerken" },
  leadership: { en: "Leadership", de: "Führung" },
  first_impressions: { en: "First Impressions", de: "Erster Eindruck" },
  dating: { en: "Dating", de: "Dating" },
  q_and_a: { en: "Q&A", de: "Fragerunde" },
  reduces_nervousness: { en: "Reduces Nervousness", de: "Senkt Nervosität" },
  projects_confidence: { en: "Projects Confidence", de: "Wirkt souverän" },
  improves_clarity: { en: "Improves Clarity", de: "Schafft Klarheit" },
  improves_memorability: { en: "Improves Memorability", de: "Bleibt hängen" },
  increases_engagement: { en: "Increases Engagement", de: "Bindet ein" },
  increases_trust: { en: "Increases Trust", de: "Stärkt Vertrauen" },
  increases_persuasion: { en: "Increases Persuasion", de: "Überzeugt mehr" },
  builds_rapport: { en: "Builds Rapport", de: "Baut Nähe auf" },
  reduces_conflict: { en: "Reduces Conflict", de: "Entschärft Konflikte" },
};

/** "public_speaking" → "Public Speaking" / "Vor Publikum". */
export function tagLabel(tag: string, lang: Lang = "en"): string {
  const known = TAG_LABELS[tag];
  if (known) return known[lang];
  // Unknown slug (a card added without a label): fall back to title-casing
  // rather than rendering a raw slug.
  return tag
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Every context/effect tag that appears in the data, in first-seen order. */
function collectTags(pick: (c: LibraryCard) => string[]): string[] {
  const seen = new Set<string>();
  for (const card of LIBRARY_CARDS) for (const tag of pick(card)) seen.add(tag);
  return [...seen];
}

export const CONTEXT_TAGS = collectTags((c) => c.context_tags);
export const EFFECT_TAGS = collectTags((c) => c.effect_tags);

/**
 * On-device search + filter over the local JSON — no network involved.
 *
 * Matches the ACTIVE language's title and technique, plus both tag lists
 * (case-insensitive, partial; tags match on the slug or either human label).
 * Tag filters AND together with the query.
 */
export function searchLibrary(
  query: string,
  contextTag: string | null,
  effectTag: string | null,
  lang: Lang = "en",
  cardsToSearch: LibraryCard[] = LIBRARY_CARDS,
): LibraryCard[] {
  const q = query.trim().toLowerCase();
  const tagMatches = (tag: string) =>
    tag.replaceAll("_", " ").includes(q) ||
    tagLabel(tag, lang).toLowerCase().includes(q) ||
    tagLabel(tag, "en").toLowerCase().includes(q);
  return cardsToSearch.filter(
    (c) =>
      (!contextTag || c.context_tags.includes(contextTag)) &&
      (!effectTag || c.effect_tags.includes(effectTag)) &&
      (!q ||
        c.title[lang].toLowerCase().includes(q) ||
        c.technique[lang].toLowerCase().includes(q) ||
        c.context_tags.some(tagMatches) ||
        c.effect_tags.some(tagMatches)),
  );
}
