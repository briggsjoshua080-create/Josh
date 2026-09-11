# Design — "The Cellar Label", Orato edition

Orato reads like a fine wine label: obsidian paper, vellum ink, wine structure, gold light.
The user's words are the vintage; the chrome is the label around them.
Register: **product** — the tool disappears into the rehearsal.

## Scene sentence

A solo speaker rehearsing at night — phone in hand, lamp off, saying the words out loud.
Dark UI is forced by the scene: the room is dim, the app is the stage light.

## Color — two tiers, one file

All raw colour values live in `src/styles/tokens.css` and nowhere else. Two tiers:

**Foundation ramp** (`--orato-*`) — the palette itself. Wine: obsidian `#170609` ·
deep-wine `#2E0B12` · wine-shadow `#3E1119` · wine `#4A1420` · claret `#722F37` ·
claret-light `#8E4750`. Metals: bronze `#7A5A31` · gold `#C9A876` · champagne `#E0C795` ·
vellum `#EFDFBB`. Semantic: verdigris `#6FA88C` · ochre `#D9954A` · bole `#C05553` ·
lapis `#5C87A8`.

**Roles** — what components actually use (directly or through the Tailwind names wired in
`theme.css`):

| Role | Value | Use |
|---|---|---|
| `--bg-page` | obsidian | the page itself |
| `--bg-surface` | deep-wine | cards, inputs, skeletons |
| `--bg-surface-raised` | wine | emphasis cards (Today hero, active challenge) |
| `--bg-chip` | claret | streak / XP / language pills |
| `--border-hairline` | wine | the 0.5px line every card wears |
| `--border-emphasis` | bronze | the line on raised cards |
| `--text-primary` | vellum | body text, content |
| `--text-secondary` | gold | secondary text, earned things |
| `--text-muted` | claret-light | tertiary, placeholders, non-essential |
| `--accent` | gold | the one warm spotlight |

**Score bands** — every score-driven colour in the app comes from one function,
`scoreColorVar()` in `src/lib/scoreColor.ts`: ≥90 verdigris (`--score-excellent`) ·
≥75 gold (`--score-good`) · ≥60 ochre (`--score-fair`) · else bole (`--score-weak`).
No arbitrary bar colours anywhere. Letter grades are a separate system with the same
input: `letterGrade()` in `src/lib/grade.ts` (front-loaded 13-band scale, A+ only at 100);
grade colour still comes from the score band — the two systems never fork.

Rule: vellum marks **content**; gold marks **earned things and the spotlight**; wine marks
**structure**; claret marks **action**. The semantic trio (verdigris/ochre/bole) is meaning,
never decoration. Hex values outside tokens.css exist only where CSS variables cannot reach:
the PWA manifest and the `theme-color` meta tag (both obsidian).

## Typography

Pairing on a contrast axis: editorial serif for the spoken word, grotesque sans for the tool.

- **Display / prompts**: Newsreader (variable, opsz; italics for quoted user phrases).
  Speaking prompts render like a lectern card: serif, generous size, `text-wrap: balance`.
- **UI**: Instrument Sans (variable) for nav, labels, buttons, body, data.
- **Logotype, and nowhere else**: Bodoni Moda (variable), on the launch wordmark only
  (`--font-logotype`). The pairing above is still two fonts; this is a third face used as
  artwork, the way a logo is. A Didone earns its place there because thick/thin contrast is
  what makes ORATO read as a mark rather than as a heading — Newsreader's moderate contrast
  reads as a title. It falls back to Newsreader, so the splash can never render invisible
  while it loads. If it ever appears in a label, button, or heading, that is a bug.
- **Data**: Instrument Sans with `font-variant-numeric: tabular-nums` everywhere numbers align.
  Exception, deliberate: the two hero numbers (overall score, recording timer) render in the
  serif — they are the performance, not the chrome.
- Fixed rem scale, ratio ≈1.2: 0.75 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25rem.
- Sentence case on labels and buttons. Section headers keep the wide-tracked uppercase
  treatment (`.label-caps`) as a styling transform over sentence-case strings.

## Shape & depth

- Radii: **14px cards** (`--radius-card`), **10px controls** (`--radius-control`),
  **999px pills** (`--radius-pill`). Nothing else.
- Borders are **0.5px** everywhere (`--default-border-width` makes the Tailwind `border`
  utility hairline by default).
- Depth comes from the surface ramp (page → surface → raised), never from shadows.
  Three sanctioned glows survive because they are functional light, not depth: focus rings,
  the mic-level spotlight glow (input-driven), and the Today-hero emblem wash. Heuristic:
  a shadow with a y-offset is banned; a centred `0 0 X` token-based glow can be justified.

## Motion

Motion conveys state; nothing idles. `ease-out` expo (`cubic-bezier(0.16,1,0.30,1)`),
durations from `--dur-fast/base/slow` (180/420/900ms). The sanctioned set pieces:

1. **Score reveal** — the overall score sits inside a ring that sweeps 0 → score on one
   spring; the arc's colour and the count-up's colour walk the score bands together, off
   the same spring, so they can never disagree mid-flight. One particle burst on the XP pill.
2. **Card flip** — the word of the day turns over in 500ms (cross-fade under reduced motion).
3. **Recording state** — the spotlight glow breathes with detected speech; the gauge arc
   steps zone colours over 600ms; the recording dot pulses 2s (state, not decoration).
4. **Earned-state flourishes** — one champagne sheen across the XP pill per gain (never a
   loop); one champagne shimmer pass per 6s on a streak of 3+.
5. **Charts** — radar expands from centre 900ms; the trend draws on left-to-right 900ms.
6. **Coach reviewing the audio** — a still waveform of the recording with a gold read-head
   crossing it on a 2.4s loop; bars warm bronze → gold as the head reaches them. Shown while
   analysis is in flight, on the recording screen and the feedback screen alike. Transform
   and colour only, never width.
7. **Where you are** — a gold marker slides between tabs on route change (spring 380/32),
   shared-layout, one namespace per surface so the rail and the tab bar never animate into
   each other.
8. **The launch sequence** — the one orchestrated load in the app, and the only place the
   "no page-load choreography" rule is deliberately spent. Two steps over 3.4s: the mark
   draws itself stroke by stroke (20 paths, 10 groups, 85ms apart), then shrinks and rises
   to a crest while ORATO lands letter by letter out of a champagne spark and one sheen
   travels across it, and `speak · review · improve` follows in wide gold. The app boots
   underneath the whole time, so the sequence costs no time the user would otherwise spend
   in the product. Colour is token-only: the ground is deep-wine → obsidian, never the
   neutral black of the references it was drawn from.

Every animation short-circuits to its end state under `prefers-reduced-motion` — three
layers enforce it: `<MotionConfig reducedMotion="user">`, per-component `useReducedMotion`
guards, and the global CSS kill switch in theme.css.

## Components

Consistent vocabulary across screens: one button shape, one form vocabulary, one icon style
(1.5px stroke, rounded caps). Every interactive element ships default/hover/focus/active/
disabled/loading/error. Skeletons for loading, teaching empty states, visible focus rings
(`outline: 2px solid var(--accent); outline-offset: 2px`). Charts are Chart.js with tokens
resolved through `src/lib/cssTokens.ts` (canvas cannot read `var()`).

One radar serves both screens (`MetricRadar`), which is why its props name the drawing role
rather than the data: `primary` is the solid polygon, `overlay` the dashed ghost. Feedback
draws this session over the previous one; Progress draws the running average over the latest
session. Its canvas is square and centred — a free aspect ratio lets unequal point-label
widths drag the polygon's optical centre sideways.

The feedback report is short on purpose: score, profile, one thing that worked, two things to
work on. Everything else lives behind one disclosure. The cut is made in the coach prompt
(`server/coach.ts`), not just hidden in the UI, and old reports are trimmed on render so
history reads the same way.

Text containment is a standing rule, not polish: text boxes use `border-box` +
`overflow-wrap`; dynamic-text containers use `min-height`, never `height`; the flip card
stacks both faces on one grid cell so it is always as tall as its tallest face.

## Layout

Mobile-first, max-w-md center column on phones; content widens to a two-column rehearsal/
history layout ≥1024px. Bottom tab bar on mobile (Today / Scenarios / Library / Progress),
left rail on desktop. Semantic z-scale: nav 10 · sheet-backdrop 40 · sheet 50 · toast 60.
