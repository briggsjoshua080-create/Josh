# Orato — Speech Training Studio

A bilingual (English/German) PWA that trains you like a future politician,
storyteller, and communication expert. Record yourself daily, get live
transcription in the browser, and receive candid speech coaching powered by
Claude — pace, eloquence, fillers, disfluencies, phrasing rewrites, and
professionalism, scored honestly.

## What's inside

- **66-day Daily Challenge Path** in six escalating acts (foundations →
  structure → story → persuasion → pressure → mastery), continuing
  indefinitely past day 66 via an advanced rotation. Includes a bilingual
  **Word of the Day** (definition, pronunciation, example) to work into each
  recording.
- **70-scenario practice library** across 10 categories (pitches, interviews,
  toasts, difficult conversations, debate, crisis comms, TED-style, …) with
  category filters, "surprise me", and a swipeable card deck (spring physics).
- **Recording loop**: Web Speech API live transcription (`de-DE` / `en-US`),
  pause detection, voice-level-driven recording glow, typed fallback for
  browsers without speech recognition.
- **Hybrid scoring**: deterministic client-side metrics (WPM, per-language
  filler-word detection incl. „äh/halt/sozusagen“, repetitions, pauses,
  vocabulary richness) blended with Claude-judged eloquence, phrasing, and
  professionalism. Offline heuristic coaching when the API is unreachable,
  with one-tap retry.
- **Local-only data**: all sessions, transcripts, and scores live in
  IndexedDB (Dexie). No accounts, no server-side storage, no paywall.
- **Progress**: streak tracking, score trend chart, full session history.
- **PWA**: installable, offline app shell via service worker.

## Stack

React 19 + Vite 8 · Tailwind CSS 4 · Motion (motion.dev) · Dexie ·
vite-plugin-pwa · one Vercel edge function (`api/feedback.ts`) proxying the
Anthropic Messages API with structured outputs.

## Development

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-… npm run dev   # key optional; without it the app
                                         # falls back to offline coaching
```

The Vite dev server mirrors the production `/api/feedback` function
(`server/coach.ts`), so the full loop runs locally.

## Deploy (Vercel)

1. Import the repo into Vercel — no framework config needed
   (`vercel.json` sets the build output and SPA rewrites).
2. Add the environment variable **`ANTHROPIC_API_KEY`** (server-side only;
   the browser never sees it). Optional: `ANTHROPIC_MODEL` to override the
   default `claude-opus-4-8`.
3. Deploy. `api/feedback.ts` runs on the edge runtime; everything else is
   static.

## Design

The visual language ("The Stage") is documented in `DESIGN.md`; product
strategy in `PRODUCT.md`. Near-black boards, velvet-curtain crimson for
action, spotlight gold for what's earned, Newsreader serif for the spoken
word, Instrument Sans for the tool.

## Browser support

Live transcription requires a browser with the Web Speech API (Chrome, Edge,
Safari). Other browsers get a typed practice fallback. Microphone permission
is requested on first recording.
