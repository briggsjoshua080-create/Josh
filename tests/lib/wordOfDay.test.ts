import { describe, it, expect } from "vitest";
import { wordOfDayUsed } from "@/lib/feedback";

/**
 * The bonus must fire only when the word was actually spoken. The old rule
 * stripped "Eis" to "Ei" and substring-matched, so "ein", "eine" and
 * "einfach" all triggered it — i.e. almost any German sentence earned XP for a
 * word the user never said.
 */
describe("wordOfDayUsed", () => {
  it("matches the word as spoken", () => {
    expect(wordOfDayUsed("that was truly eloquent of you", "eloquent")).toBe(true);
  });

  it("matches a German inflected form", () => {
    expect(wordOfDayUsed("seine Rhetorik war beeindruckend", "Rhetorik")).toBe(true);
    // Suffix growth is handled: Rede -> Reden.
    expect(wordOfDayUsed("seine Reden waren gut", "Rede")).toBe(true);
  });

  it("does not pretend to handle irregular plurals", () => {
    // Thema -> Themen changes the stem, which suffix rules cannot bridge. This
    // is a documented miss, not a silent one: it costs a bonus rather than
    // awarding one that wasn't earned, which is the right way round to fail.
    expect(wordOfDayUsed("wir haben die Themen besprochen", "Thema")).toBe(false);
  });

  it("does not fire on an unrelated word that merely shares a prefix", () => {
    expect(wordOfDayUsed("ich habe ein einfaches Beispiel", "Eis")).toBe(false);
    expect(wordOfDayUsed("eine eingehende Analyse", "Eis")).toBe(false);
  });

  it("does not fire mid-word", () => {
    expect(wordOfDayUsed("the concatenation was long", "cat")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(wordOfDayUsed("ELOQUENT delivery", "eloquent")).toBe(true);
  });

  it("returns false when the word is absent", () => {
    expect(wordOfDayUsed("nothing relevant here at all", "eloquent")).toBe(false);
  });
});
