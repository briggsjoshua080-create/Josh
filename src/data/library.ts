import cards from "./library.json";

/**
 * The Library: curated speaking & communication techniques, bundled with the
 * app as static JSON (library.json) so it works fully offline. To add cards,
 * append to library.json — the UI, search, and filter chips derive everything
 * (including the tag list) from the data.
 */
export interface LibraryCard {
  id: string;
  title: string;
  /** Plain-language explanation of the technique. */
  technique: string;
  context_tags: string[];
  effect_tags: string[];
  /** Citation. */
  source: string;
  /** 1 = primary research, 2 = expert practice. */
  source_tier: number;
  /** Present only when the evidence is contested. */
  caveat?: string;
}

export const LIBRARY_CARDS: LibraryCard[] = cards;

/** Tag slugs whose display label isn't a straight title-casing. */
const TAG_LABELS: Record<string, string> = {
  q_and_a: "Q&A",
  ted: "TED",
};

/** "public_speaking" → "Public Speaking" (with special cases above). */
export function tagLabel(tag: string): string {
  return (
    TAG_LABELS[tag] ??
    tag
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
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
 * The query matches title, technique, and both tag lists (case-insensitive,
 * partial; tags match on the slug or the human label). Tag filters AND
 * together with the query.
 */
export function searchLibrary(
  query: string,
  contextTag: string | null,
  effectTag: string | null,
  cardsToSearch: LibraryCard[] = LIBRARY_CARDS,
): LibraryCard[] {
  const q = query.trim().toLowerCase();
  const tagMatches = (tag: string) =>
    tag.replaceAll("_", " ").includes(q) || tagLabel(tag).toLowerCase().includes(q);
  return cardsToSearch.filter(
    (c) =>
      (!contextTag || c.context_tags.includes(contextTag)) &&
      (!effectTag || c.effect_tags.includes(effectTag)) &&
      (!q ||
        c.title.toLowerCase().includes(q) ||
        c.technique.toLowerCase().includes(q) ||
        c.context_tags.some(tagMatches) ||
        c.effect_tags.some(tagMatches)),
  );
}
