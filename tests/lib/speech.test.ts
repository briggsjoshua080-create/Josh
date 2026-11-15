import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * Finish has to see the words the engine is still finalising. Recognition
 * delivers a phrase's final result 1–3 s after it is spoken, so a Finish
 * tapped right after the last word used to be judged "too short" and needed a
 * second tap.
 */
class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  /** Words the engine is "still processing"; delivered as final on stop(). */
  pending = "";
  /** Simulates an engine that never answers stop() (timeout path). */
  silent = false;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {}
  abort() {}
  stop() {
    if (this.silent) return;
    setTimeout(() => {
      if (this.pending) {
        this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: this.pending } }] });
      }
      this.onend?.();
    }, 300);
  }
}

async function freshSession() {
  vi.resetModules();
  vi.stubGlobal("window", {
    SpeechRecognition: FakeRecognition,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });
  vi.stubGlobal("navigator", {}); // no mediaDevices: the level meter is skipped
  const { SpeechSession } = await import("@/lib/speech");
  const session = new SpeechSession("en", { onTranscript: () => {}, onLevel: () => {}, onError: () => {} });
  await session.start();
  return session;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SpeechSession.finalize", () => {
  it("waits for the words the engine is still finalising", async () => {
    const sentence = "practice beats talent every single time and small habits compound daily";
    // stop() alone (what Finish used to call) loses them…
    const before = await freshSession();
    FakeRecognition.last!.pending = sentence;
    expect(before.stop().segments).toEqual([]);
    // …finalize() keeps them.
    const session = await freshSession();
    FakeRecognition.last!.pending = sentence;
    const result = await session.finalize();
    expect(result.segments.map((s) => s.text).join(" ")).toBe(sentence);
  });

  it("gives up after the grace period if the engine never answers", async () => {
    const session = await freshSession();
    FakeRecognition.last!.silent = true;
    const started = Date.now();
    const result = await session.finalize(200);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(result.segments).toEqual([]);
  });
});
