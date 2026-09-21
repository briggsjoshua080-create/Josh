# Orato — Speech Training Studio

A bilingual (English/German) PWA that trains you like a future politician,
storyteller, and communication expert. Record yourself daily, get live
transcription in the browser, and receive candid speech coaching powered by
Claude — pace, eloquence, fillers, disfluencies, phrasing rewrites, and
professionalism, scored honestly.

## What's inside

- **Daily Challenge**, a random pick each day from the scenario library
  rather than a fixed sequence — different for every account. Tiered by how
  many daily-practice days the account has logged: impromptu/debate prompts
  only for the first three weeks (difficulty rising each week), then the
  full library is in play from day 21 on. Includes a bilingual
  **Word of the Day** (definition, pronunciation, example) to work into each
  recording.
- **248-scenario practice library** across 10 categories (pitches, interviews,
  toasts, difficult conversations, debate, crisis comms, TED-style, …) with
  category filters, "surprise me", and a swipeable card deck (spring physics).
  100 of them are impromptu prompts, every title tagged "Impromptu" /
  "Stegreif" so one search pulls the whole set.
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
vite-plugin-pwa · one Vercel Node function (`api/feedback.ts`) proxying the
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
   default `claude-sonnet-5`.
3. Deploy. `api/feedback.ts` runs on the **Node** runtime — it depends on it
   (`IncomingMessage`, `req.on("data")`, `req.socket`), so switching it to the
   edge runtime breaks the endpoint. Everything else is static.

### Protecting the API budget

`/api/feedback` is public and unauthenticated by design (the app has no
accounts), and it spends real money per request. The code caps request size,
rejects cross-origin calls, and rate-limits per IP — but that limiter lives in
one serverless instance's memory, so it cannot survive scale-out. Two controls
outside the code do the actual work, and both are worth setting before the app
takes public traffic:

1. **A spend cap on the API key.** Give Orato its own Anthropic workspace with a
   monthly budget. This is the only control that bounds the damage regardless of
   what gets past the code.
2. **A platform rate limit.** A Vercel WAF/firewall rule on `/api/feedback`
   runs at the edge before the function boots, with state shared across
   instances — the thing the in-memory limiter cannot be.

## Design

The visual language ("The Stage") is documented in `DESIGN.md`; product
strategy in `PRODUCT.md`. Near-black boards, velvet-curtain crimson for
action, spotlight gold for what's earned, Newsreader serif for the spoken
word, Instrument Sans for the tool.

## Browser support

Live transcription requires a browser with the Web Speech API (Chrome, Edge,
Safari). Other browsers get a typed practice fallback. Microphone permission
is requested on first recording.
