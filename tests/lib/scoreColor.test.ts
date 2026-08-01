import { describe, expect, it } from "vitest";
import { scoreBand, scoreColorVar } from "@/lib/scoreColor";

describe("scoreBand", () => {
  it("maps band boundaries", () => {
    expect(scoreBand(0)).toBe("weak");
    expect(scoreBand(59)).toBe("weak");
    expect(scoreBand(60)).toBe("fair");
    expect(scoreBand(74)).toBe("fair");
    expect(scoreBand(75)).toBe("good");
    expect(scoreBand(89)).toBe("good");
    expect(scoreBand(90)).toBe("excellent");
    expect(scoreBand(100)).toBe("excellent");
  });
});

describe("scoreColorVar", () => {
  it("returns the matching CSS variable reference", () => {
    expect(scoreColorVar(95)).toBe("var(--score-excellent)");
    expect(scoreColorVar(80)).toBe("var(--score-good)");
    expect(scoreColorVar(65)).toBe("var(--score-fair)");
    expect(scoreColorVar(20)).toBe("var(--score-weak)");
  });
});
