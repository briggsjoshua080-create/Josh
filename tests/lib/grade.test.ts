import { describe, expect, it } from "vitest";
import { GRADE_BANDS, letterGrade } from "@/lib/grade";

describe("GRADE_BANDS", () => {
  it("covers 0–100 with no gaps or overlaps", () => {
    const sorted = [...GRADE_BANDS].sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBe(100);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
  });
});

describe("letterGrade", () => {
  it("maps every band boundary to its letter", () => {
    const cases: Array<[number, string]> = [
      [0, "F"],
      [29, "F"],
      [30, "D-"],
      [49, "D-"],
      [50, "D"],
      [61, "D"],
      [62, "D+"],
      [68, "D+"],
      [69, "C-"],
      [74, "C-"],
      [75, "C"],
      [79, "C"],
      [80, "C+"],
      [83, "C+"],
      [84, "B-"],
      [87, "B-"],
      [88, "B"],
      [90, "B"],
      [91, "B+"],
      [93, "B+"],
      [94, "A-"],
      [96, "A-"],
      [97, "A"],
      [99, "A"],
      [100, "A+"],
    ];
    for (const [score, letter] of cases) {
      expect(letterGrade(score), `score ${score}`).toBe(letter);
    }
  });

  it("clamps out-of-range scores", () => {
    expect(letterGrade(-10)).toBe("F");
    expect(letterGrade(140)).toBe("A+");
  });

  it("rounds fractional scores before banding", () => {
    expect(letterGrade(29.4)).toBe("F");
    expect(letterGrade(29.5)).toBe("D-");
    expect(letterGrade(99.5)).toBe("A+");
  });

  it("awards A+ only at a full 100", () => {
    expect(letterGrade(99)).toBe("A");
    expect(letterGrade(99.4)).toBe("A");
    expect(letterGrade(100)).toBe("A+");
  });
});
