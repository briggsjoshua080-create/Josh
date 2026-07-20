import { describe, expect, it } from "vitest";
import {
  CONTEXT_TAGS,
  EFFECT_TAGS,
  LIBRARY_CARDS,
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
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.technique.length).toBeGreaterThan(0);
      expect(c.context_tags.length).toBeGreaterThan(0);
      expect(c.effect_tags.length).toBeGreaterThan(0);
      expect(c.source.length).toBeGreaterThan(0);
      expect([1, 2]).toContain(c.source_tier);
    }
  });

  it("derives the filter tag lists from the data", () => {
    expect(CONTEXT_TAGS).toContain("public_speaking");
    expect(EFFECT_TAGS).toContain("reduces_nervousness");
  });
});

describe("tagLabel", () => {
  it("title-cases slugs and keeps special cases readable", () => {
    expect(tagLabel("public_speaking")).toBe("Public Speaking");
    expect(tagLabel("q_and_a")).toBe("Q&A");
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
  });
});
