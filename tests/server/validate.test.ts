import { describe, it, expect } from "vitest";
import { validate } from "../../server/coach";

/**
 * Every field validate() lets through is interpolated into a paid API call,
 * so an unbounded field is an unbounded bill. These tests pin the ceilings.
 */
const valid = () => ({
  lang: "en",
  transcript: "this is a perfectly ordinary spoken transcript with enough words",
  promptTitle: "Introduce yourself",
  promptText: "Tell us who you are in ninety seconds.",
  durationSec: 90,
  metrics: { wpm: 130, wordCount: 195 },
});

describe("validate", () => {
  it("accepts a normal request", () => {
    expect(validate(valid())).not.toBeNull();
  });

  it("rejects a non-object body", () => {
    expect(validate(null)).toBeNull();
    expect(validate("nope")).toBeNull();
  });

  it("rejects an unsupported language", () => {
    expect(validate({ ...valid(), lang: "fr" })).toBeNull();
  });

  it("rejects a transcript that is too short to coach", () => {
    expect(validate({ ...valid(), transcript: "too short" })).toBeNull();
  });

  it("rejects an oversized transcript", () => {
    expect(validate({ ...valid(), transcript: "word ".repeat(5000) })).toBeNull();
  });

  it("rejects an oversized promptText, which used to be unbounded", () => {
    expect(validate({ ...valid(), promptText: "x".repeat(2_001) })).toBeNull();
  });

  it("rejects an oversized promptTitle", () => {
    expect(validate({ ...valid(), promptTitle: "x".repeat(201) })).toBeNull();
  });

  it("rejects an oversized metrics object, which used to be unbounded", () => {
    const metrics: Record<string, string> = {};
    for (let i = 0; i < 500; i++) metrics[`key${i}`] = "x".repeat(20);
    expect(validate({ ...valid(), metrics })).toBeNull();
  });

  it("rejects a non-string or oversized wordOfDay but allows it to be absent", () => {
    expect(validate({ ...valid(), wordOfDay: "eloquent" })).not.toBeNull();
    expect(validate({ ...valid(), wordOfDay: 42 })).toBeNull();
    expect(validate({ ...valid(), wordOfDay: "x".repeat(101) })).toBeNull();
  });

  it("rejects a nonsensical duration", () => {
    expect(validate({ ...valid(), durationSec: 0 })).toBeNull();
    expect(validate({ ...valid(), durationSec: -5 })).toBeNull();
    expect(validate({ ...valid(), durationSec: 99_999 })).toBeNull();
    expect(validate({ ...valid(), durationSec: Number.NaN })).toBeNull();
  });

  it("rejects metrics that cannot be serialized", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(validate({ ...valid(), metrics: circular })).toBeNull();
  });
});
