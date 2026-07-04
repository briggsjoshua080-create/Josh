import type { Lang, PauseEvent, SpeechSegment } from "./types";

/**
 * Web Speech API wrapper: continuous recognition with auto-restart (Chrome
 * ends recognition after silence), pause detection from result timing, and a
 * parallel AnalyserNode so the UI can breathe with the actual voice level.
 *
 * E2E hook: `window.__oratoInjectSpeech(text)` feeds synthetic segments so the
 * full loop is testable in headless browsers with no speech service.
 */

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

const RECOGNITION_LANG: Record<Lang, string> = { en: "en-US", de: "de-DE" };
const PAUSE_THRESHOLD_MS = 1500;

export function speechSupported(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface RecorderCallbacks {
  onTranscript: (finalText: string, interim: string) => void;
  onLevel: (level: number) => void;
  onError: (code: "not-allowed" | "no-speech" | "unsupported" | "unknown") => void;
}

export interface RecorderResult {
  segments: SpeechSegment[];
  pauses: PauseEvent[];
  durationSec: number;
}

export class SpeechSession {
  private recognition: SpeechRecognitionLike | null = null;
  private segments: SpeechSegment[] = [];
  private pauses: PauseEvent[] = [];
  private interim = "";
  private startedAt = 0;
  private lastActivityAt = 0;
  private pauseOpenSince: number | null = null;
  private running = false;
  private tickTimer: number | null = null;
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private levelRaf: number | null = null;

  constructor(
    private lang: Lang,
    private cb: RecorderCallbacks,
  ) {}

  async start(): Promise<void> {
    this.startedAt = performance.now();
    this.lastActivityAt = this.startedAt;
    this.running = true;

    // Expose the E2E injection hook regardless of engine support.
    (window as unknown as Record<string, unknown>).__oratoInjectSpeech = (text: string) => {
      this.pushFinal(text);
    };

    this.startLevelMeter();

    const w = window as unknown as Record<string, SpeechRecognitionCtor | undefined>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      this.cb.onError("unsupported");
    } else {
      this.attachRecognition(Ctor);
    }

    // Pause bookkeeping runs on a coarse tick, independent of the engine.
    this.tickTimer = window.setInterval(() => this.checkPause(), 250);
  }

  private attachRecognition(Ctor: SpeechRecognitionCtor) {
    const rec = new Ctor();
    rec.lang = RECOGNITION_LANG[this.lang];
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      this.markActivity();
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const text = r[0].transcript.trim();
          if (text) this.segments.push({ text, t: Math.round(performance.now() - this.startedAt) });
        } else {
          interim += r[0].transcript;
        }
      }
      this.interim = interim;
      this.emit();
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this.cb.onError("not-allowed");
        this.running = false;
      } else if (e.error === "no-speech" || e.error === "aborted") {
        // benign — auto-restart handles it
      } else {
        this.cb.onError("unknown");
      }
    };

    rec.onend = () => {
      // Chrome stops after ~8s of silence; keep the session alive until the
      // user explicitly stops.
      if (this.running) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };

    try {
      rec.start();
      this.recognition = rec;
    } catch {
      this.cb.onError("unknown");
    }
  }

  private pushFinal(text: string) {
    this.markActivity();
    this.segments.push({ text: text.trim(), t: Math.round(performance.now() - this.startedAt) });
    this.interim = "";
    this.emit();
  }

  private emit() {
    this.cb.onTranscript(this.segments.map((s) => s.text).join(" "), this.interim);
  }

  private markActivity() {
    const now = performance.now();
    if (this.pauseOpenSince !== null) {
      const dur = now - this.pauseOpenSince;
      if (dur >= PAUSE_THRESHOLD_MS) {
        this.pauses.push({
          atMs: Math.round(this.pauseOpenSince - this.startedAt),
          durationMs: Math.round(dur),
        });
      }
      this.pauseOpenSince = null;
    }
    this.lastActivityAt = now;
  }

  private checkPause() {
    if (!this.running) return;
    const now = performance.now();
    if (this.pauseOpenSince === null && now - this.lastActivityAt >= PAUSE_THRESHOLD_MS) {
      this.pauseOpenSince = this.lastActivityAt;
    }
  }

  private async startLevelMeter() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new AudioContext();
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        if (!this.running) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        this.cb.onLevel(Math.min(1, rms * 4));
        this.levelRaf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // Level meter is progressive enhancement; recognition may still work.
    }
  }

  stop(): RecorderResult {
    this.running = false;
    // Close any open pause at stop time.
    if (this.pauseOpenSince !== null) {
      const dur = performance.now() - this.pauseOpenSince;
      if (dur >= PAUSE_THRESHOLD_MS) {
        this.pauses.push({
          atMs: Math.round(this.pauseOpenSince - this.startedAt),
          durationMs: Math.round(dur),
        });
      }
    }
    if (this.tickTimer !== null) clearInterval(this.tickTimer);
    if (this.levelRaf !== null) cancelAnimationFrame(this.levelRaf);
    try {
      this.recognition?.stop();
      this.recognition?.abort();
    } catch {
      /* noop */
    }
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.audioCtx?.close().catch(() => {});
    delete (window as unknown as Record<string, unknown>).__oratoInjectSpeech;

    return {
      segments: this.segments,
      pauses: this.pauses,
      durationSec: (performance.now() - this.startedAt) / 1000,
    };
  }
}
