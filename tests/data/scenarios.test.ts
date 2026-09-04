import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/data/scenarios";
import { SCENARIOS_3 } from "@/data/scenarios-3";
import { SCENARIOS_4 } from "@/data/scenarios-4";
import { CATEGORIES } from "@/data/categories";

const IMPROMPTU = [...SCENARIOS_3, ...SCENARIOS_4];

describe("scenario library", () => {
  it("holds 248 scenarios, 100 of them impromptu", () => {
    expect(SCENARIOS).toHaveLength(248);
    expect(IMPROMPTU).toHaveLength(100);
  });

  it("has globally unique ids", () => {
    const ids = SCENARIOS.map((s) => s.id);
    // Nothing validates this at runtime: a duplicate would silently merge two
    // scenarios' mastery and make SCENARIOS.find return the wrong prompt.
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses categories that exist in CATEGORIES", () => {
    const known = new Set(CATEGORIES.map((c) => c.id));
    for (const s of SCENARIOS) {
      expect(known, `${s.id} has an unknown category`).toContain(s.category);
    }
  });

  it("has a well-formed target window on every scenario", () => {
    for (const s of SCENARIOS) {
      expect(s.targetSec[0], `${s.id} target window`).toBeLessThan(s.targetSec[1]);
      expect(s.targetSec[0]).toBeGreaterThan(0);
    }
  });

  it("is bilingual everywhere", () => {
    for (const s of SCENARIOS) {
      for (const lang of ["en", "de"] as const) {
        expect(s.title[lang].trim(), `${s.id} title.${lang}`).not.toBe("");
        expect(s.prompt[lang].trim(), `${s.id} prompt.${lang}`).not.toBe("");
      }
    }
  });

  it("keeps 'impromptu' in every impromptu title so one search finds them all", () => {
    for (const s of IMPROMPTU) {
      expect(s.id, `${s.id} needs the imp- prefix`).toMatch(/^imp-/);
      expect(s.title.en.toLowerCase()).toContain("impromptu");
      expect(s.title.de.toLowerCase()).toContain("stegreif");
    }
  });

  it("surfaces the whole impromptu set from one search in either language", () => {
    // Mirrors the filter in src/screens/Scenarios.tsx.
    const search = (q: string, lang: "en" | "de") =>
      SCENARIOS.filter(
        (s) => s.title[lang].toLowerCase().includes(q) || s.prompt[lang].toLowerCase().includes(q),
      ).map((s) => s.id);

    const en = search("impromptu", "en");
    const de = search("stegreif", "de");
    for (const s of IMPROMPTU) {
      expect(en, `${s.id} missing from the EN search`).toContain(s.id);
      expect(de, `${s.id} missing from the DE search`).toContain(s.id);
    }
    // Two non-imp- scenarios call themselves impromptu drills in their own
    // prompt text and ride along in both languages: deb-one-minute-topics
    // (original library) and deb-no-notes-no-mercy (migrated from the old
    // daily-challenge path).
    expect(en).toHaveLength(102);
    expect(de).toHaveLength(102);
  });
});
