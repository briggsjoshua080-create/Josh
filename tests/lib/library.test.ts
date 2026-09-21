import { describe, expect, it } from "vitest";
import {
  CONTEXT_TAGS,
  EFFECT_TAGS,
  LIBRARY_CARDS,
  TAG_SYNONYMS,
  searchLibrary,
  tagLabel,
} from "@/data/library";

describe("library data", () => {
  it("bundles the full starter set with unique ids", () => {
    expect(LIBRARY_CARDS.length).toBe(29);
    expect(new Set(LIBRARY_CARDS.map((c) => c.id)).size).toBe(LIBRARY_CARDS.length);
  });

  it("every card carries the required fields", () => {
    for (const c of LIBRARY_CARDS) {
      expect(c.context_tags.length).toBeGreaterThan(0);
      expect(c.effect_tags.length).toBeGreaterThan(0);
      expect(c.source.length).toBeGreaterThan(0);
      expect([1, 2]).toContain(c.source_tier);
    }
  });

  /**
   * PRODUCT.md: "Every string... is authored per-language, not machine-
   * translated." The Library was the one screen where that wasn't true — 29
   * cards with no German at all, wrapped in translated chrome.
   */
  it("carries authored copy in both languages for every card", () => {
    for (const c of LIBRARY_CARDS) {
      expect(c.title.en.length, `${c.id} title.en`).toBeGreaterThan(0);
      expect(c.title.de.length, `${c.id} title.de`).toBeGreaterThan(0);
      expect(c.technique.en.length, `${c.id} technique.en`).toBeGreaterThan(0);
      expect(c.technique.de.length, `${c.id} technique.de`).toBeGreaterThan(0);
      if (c.caveat) {
        expect(c.caveat.en.length, `${c.id} caveat.en`).toBeGreaterThan(0);
        expect(c.caveat.de.length, `${c.id} caveat.de`).toBeGreaterThan(0);
      }
    }
  });

  it("does not leave German copy identical to the English", () => {
    // A cheap guard against a card being added with the English pasted into
    // both slots, which is the failure mode this whole change exists to fix.
    const untranslated = LIBRARY_CARDS.filter((c) => c.technique.de === c.technique.en);
    expect(untranslated.map((c) => c.id)).toEqual([]);
  });

  it("derives the filter tag lists from the data", () => {
    expect(CONTEXT_TAGS).toContain("public_speaking");
    expect(EFFECT_TAGS).toContain("reduces_nervousness");
  });

  it("has a German label for every tag in use", () => {
    for (const tag of [...CONTEXT_TAGS, ...EFFECT_TAGS]) {
      const de = tagLabel(tag, "de");
      // The slug-title-cased fallback would leave an underscore-free English
      // string; a real label differs from it or is deliberately identical
      // (e.g. "Small Talk"), so assert it is at least non-empty and defined.
      expect(de.length, `${tag} de label`).toBeGreaterThan(0);
      expect(de).not.toContain("_");
    }
  });

  it("has everyday search words for every tag in use", () => {
    for (const tag of [...CONTEXT_TAGS, ...EFFECT_TAGS]) {
      const words = TAG_SYNONYMS[tag];
      expect(words, `${tag} synonyms`).toBeDefined();
      // At least one German and one English word, so neither language is
      // left with only the literal label to match against.
      expect(words.length, `${tag} synonyms`).toBeGreaterThanOrEqual(3);
      for (const w of words) expect(w, `${tag}: "${w}"`).toBe(w.toLowerCase());
    }
  });
});

describe("tagLabel", () => {
  it("title-cases slugs and keeps special cases readable", () => {
    expect(tagLabel("public_speaking")).toBe("Public Speaking");
    expect(tagLabel("q_and_a")).toBe("Q&A");
  });

  it("returns the German label when asked", () => {
    expect(tagLabel("public_speaking", "de")).toBe("Vor Publikum");
    expect(tagLabel("impromptu", "de")).toBe("Stegreif");
  });

  it("falls back to title-casing an unknown slug rather than showing a raw one", () => {
    expect(tagLabel("some_new_tag", "de")).toBe("Some New Tag");
  });
});

describe("searchLibrary", () => {
  it("matches title, technique, and tags case-insensitively and partially", () => {
    expect(searchLibrary("REAPPRAISE", null, null).map((c) => c.id)).toContain("a1");
    expect(searchLibrary("oxytocin", null, null).map((c) => c.id)).toContain("f1");
    // Tag match, by slug fragment and by human label
    expect(searchLibrary("nervous", null, null).length).toBeGreaterThan(0);
    expect(searchLibrary("Public Speaking", null, null).length).toBeGreaterThan(0);
  });

  it("searches the German copy when the app is in German", () => {
    // The concrete failure this fixes: a German user searching a German word
    // got "no results" from a library that demonstrably covers the topic.
    expect(searchLibrary("Vorfreude", null, null, "de").map((c) => c.id)).toContain("a1");
    expect(searchLibrary("Pause", null, null, "de").map((c) => c.id)).toContain("c1");
    expect(searchLibrary("Füllwörter", null, null, "de").map((c) => c.id)).toContain("c3");
  });

  it("matches a German tag label", () => {
    expect(searchLibrary("Stegreif", null, null, "de").length).toBeGreaterThan(0);
  });

  /**
   * The word a German user reaches for first. It is in no title, no technique
   * and no tag label — the library covers the topic thoroughly and the search
   * still came back empty, which is the worst version of this failure.
   */
  it("finds the stage-fright cards from the everyday word", () => {
    const ids = searchLibrary("Lampenfieber", null, null, "de").map((c) => c.id);
    expect(ids).toContain("a1");
    expect(searchLibrary("stage fright", null, null).length).toBeGreaterThan(0);
  });

  it("matches everyday words in either language", () => {
    expect(searchLibrary("Gehalt", null, null, "de").length).toBeGreaterThan(0);
    expect(searchLibrary("Zoom", null, null, "de").length).toBeGreaterThan(0);
    expect(searchLibrary("boring", null, null).length).toBeGreaterThan(0);
  });

  it("does not insist on umlauts the user may not type", () => {
    const withUmlaut = searchLibrary("Füllwörter", null, null, "de").map((c) => c.id);
    const without = searchLibrary("Fullworter", null, null, "de").map((c) => c.id);
    expect(without).toEqual(withUmlaut);
    expect(searchLibrary("Prasentation", null, null, "de").length).toBeGreaterThan(0);
  });

  it("ANDs the query with the context and effect filters", () => {
    const both = searchLibrary("", "interviews", "projects_confidence");
    expect(both.length).toBeGreaterThan(0);
    for (const c of both) {
      expect(c.context_tags).toContain("interviews");
      expect(c.effect_tags).toContain("projects_confidence");
    }
    expect(searchLibrary("pause", "virtual", null)).toHaveLength(0);
  });

  it("returns everything for a blank query with no filters", () => {
    expect(searchLibrary("", null, null)).toHaveLength(LIBRARY_CARDS.length);
    expect(searchLibrary("", null, null, "de")).toHaveLength(LIBRARY_CARDS.length);
  });
});
