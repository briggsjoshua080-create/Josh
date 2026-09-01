import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/data/scenarios";
import { SCENARIOS_3 } from "@/data/scenarios-3";
import { SCENARIOS_4 } from "@/data/scenarios-4";
import { CATEGORIES } from "@/data/categories";

const IMPROMPTU = [...SCENARIOS_3, ...SCENARIOS_4];

describe("scenario library", () => {
  it("holds 170 scenarios, 100 of them impromptu", () => {
    expect(SCENARIOS).toHaveLength(170);
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
    // deb-one-minute-topics predates this set and calls itself an impromptu
    // drill in its prompt, so it rides along in both languages.
    expect(en).toHaveLength(101);
    expect(de).toHaveLength(101);
  });
});
