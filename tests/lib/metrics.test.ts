import { describe, it, expect } from "vitest";
import { countFillers, countRepetitions, wpmSeries } from "@/lib/metrics";
import type { SpeechSegment } from "@/lib/types";

const seg = (text: string, t = 0): SpeechSegment => ({ text, t });

/** The same words, chunked the way each engine chunks them. */
function chunkings(sentences: string[]): { name: string; segments: SpeechSegment[] }[] {
  return [
    // Chrome: one long continuous segment.
    { name: "single segment", segments: [seg(sentences.join(" "))] },
    // iOS Safari: one segment per utterance.
    { name: "per-utterance segments", segments: sentences.map((s, i) => seg(s, i * 1000)) },
  ];
}

describe("countFillers", () => {
  it("counts the same regardless of how the recognizer chunked the audio", () => {
    // This is the bug that made a laptop and a phone disagree about the same
    // speech: discourse markers were only counted at index 0 of a segment.
    const sentences = [
      "so I want to talk about pricing",
      "so the first point is margin",
      "so finally we should decide",
    ];
    const results = chunkings(sentences).map(({ segments }) => countFillers(segments, "en").total);
    expect(new Set(results).size).toBe(1);
  });

  it("counts an obvious filler run", () => {
    const { counts, total } = countFillers([seg("um I think uh maybe um yes")], "en");
    expect(counts.um).toBe(2);
    expect(counts.uh).toBe(1);
    expect(total).toBeGreaterThanOrEqual(3);
  });

  it("does not count comparative 'like', which is ordinary English", () => {
    const { counts } = countFillers(
      [seg("it looks like rain and it feels like summer and sounds like music")],
      "en",
    );
    expect(counts.like ?? 0).toBe(0);
  });

  it("does not count the verb 'like'", () => {
    expect(countFillers([seg("I like this and we like that")], "en").counts.like ?? 0).toBe(0);
  });

  it("does count a clause-initial filler 'like', the most recognisable use", () => {
    // Previously excluded outright, so the clearest case scored zero.
    expect(countFillers([seg("like I was thinking we should go")], "en").counts.like ?? 0).toBe(1);
  });

  it("matches multi-word fillers only on whole words", () => {
    expect(countFillers([seg("you know what I mean")], "en").counts["you know"]).toBe(1);
    // "mankind often" must not trigger "kind of"
    expect(countFillers([seg("mankind often wins")], "en").counts["kind of"] ?? 0).toBe(0);
  });

  it("counts German fillers, including inflected discourse markers", () => {
    const { counts, total } = countFillers([seg("äh also ich denke halt sozusagen ja")], "de");
    expect(counts["äh"]).toBe(1);
    expect(counts.halt).toBe(1);
    expect(counts.sozusagen).toBe(1);
    expect(total).toBeGreaterThanOrEqual(3);
  });

  it("returns nothing for clean speech", () => {
    expect(countFillers([seg("this sentence is entirely clean and direct")], "en").total).toBe(0);
  });
});

describe("countRepetitions", () => {
  it("counts an immediate word repeat", () => {
    expect(countRepetitions("we we went there").count).toBe(1);
  });

  it("ignores single-letter repeats, which are usually recognition artifacts", () => {
    expect(countRepetitions("I I went there").count).toBe(0);
  });

  it("counts a bigram stutter once, not once per word", () => {
    // "I went I went" is one stumble.
    expect(countRepetitions("I went I went to the shop").count).toBe(1);
  });

  it("does not double-count a long same-word run through both passes", () => {
    // "that that that that" is a single stutter event, not four findings.
    const { count } = countRepetitions("that that that that happened");
    expect(count).toBeLessThanOrEqual(3);
  });

  it("finds nothing in clean speech", () => {
    expect(countRepetitions("every word here is distinct and deliberate").count).toBe(0);
  });
});

describe("wpmSeries", () => {
  it("returns nothing when there is too little timing data to be honest", () => {
    expect(wpmSeries([seg("a few words")], 10)).toEqual([]);
    expect(wpmSeries([], 120)).toEqual([]);
  });

  it("uses windows wide enough to mean something", () => {
    // The doc comment promises ~15-30s buckets; a hard floor of 3 bins gave
    // 6.7s windows at 20s, where one recognition burst reads as a pace spike.
    const segments = Array.from({ length: 12 }, (_, i) => seg("five more words right here", i * 2500));
    const series = wpmSeries(segments, 30);
    const windowSec = 30 / series.length;
    expect(windowSec).toBeGreaterThanOrEqual(10);
  });

  it("produces a bucket per window for a longer recording", () => {
    const segments = Array.from({ length: 40 }, (_, i) => seg("some words spoken here", i * 3000));
    const series = wpmSeries(segments, 120);
    expect(series.length).toBeGreaterThan(2);
    expect(series.every((v) => Number.isFinite(v) && v >= 0)).toBe(true);
  });
});
