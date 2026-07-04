# Design — "The Stage"

Orato is an empty stage ten minutes before curtain: dark boards, velvet crimson, one warm
spotlight. The user's words are the performance; the chrome is the theater around them.
Register: **product** — the tool disappears into the rehearsal.

## Scene sentence

A solo speaker rehearsing at night — phone in hand, lamp off, saying the words out loud.
Dark UI is forced by the scene: the room is dim, the app is the stage light.

## Color

OKLCH throughout. Strategy: **Restrained on task surfaces, Committed at performance moments**
(recording and score reveal let crimson/gold carry the screen).

| Token          | Value                     | Role |
|----------------|---------------------------|------|
| `--bg`         | `oklch(0.13 0.01 25)`     | Body — near-black boards, whisper-warm (environmental tint: the theater IS the brand) |
| `--surface`    | `oklch(0.175 0.012 30)`   | Cards, panels |
| `--surface-2`  | `oklch(0.22 0.014 32)`    | Raised elements, inputs |
| `--line`       | `oklch(0.30 0.015 35)`    | Hairline borders |
| `--ink`        | `oklch(0.95 0.01 75)`     | Body text (≈14:1 vs bg) |
| `--muted`      | `oklch(0.70 0.02 50)`     | Secondary text (≈6:1 vs bg) |
| `--primary`    | `oklch(0.52 0.19 15)`     | Velvet-curtain crimson — record button, primary actions. White text only. |
| `--primary-deep` | `oklch(0.36 0.13 12)`   | Pressed states, crimson-tinted surfaces |
| `--accent`     | `oklch(0.82 0.13 80)`     | Spotlight gold — scores, streaks, word of the day. Dark text on fills. |
| `--accent-dim` | `oklch(0.70 0.10 78)`     | Chart strokes, subdued gold |
| `--ok`         | `oklch(0.72 0.13 155)`    | Success states |
| `--warn`       | `oklch(0.78 0.13 85)`     | Caution |
| `--bad`        | `oklch(0.62 0.19 25)`     | Errors, flagged language |

Rule: gold marks **earned** things (scores, streaks, vocabulary); crimson marks **action**
(record, submit, primary CTA). Neither is decoration. Inactive states are neutral.

## Typography

Pairing on a contrast axis: editorial serif for the spoken word, grotesque sans for the tool.

- **Display / prompts**: Newsreader (variable, opsz; italics for quoted user phrases).
  Speaking prompts render like a lectern card: serif, generous size, `text-wrap: balance`.
- **UI**: Instrument Sans (variable) for nav, labels, buttons, body, data.
- **Data**: Instrument Sans with `font-variant-numeric: tabular-nums` everywhere numbers align.
- Fixed rem scale, ratio ≈1.2: 0.75 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25rem.
  Prompt display tops out at 2rem mobile / 2.5rem desktop. Letter-spacing floor −0.02em.
- Serif never appears in buttons, labels, or data. Sans never renders the prompt headline.

## Shape & depth

- Radii: 16px cards, 12px buttons/inputs, full-pill tags, perfect circle record button.
- Depth via surface steps and 1px `--line` hairlines — no drop-shadow + border ghost-cards.
  One shadow allowed: the record button's spotlight glow while armed (state, not decoration).

## Motion

Motion conveys state; nothing idles. `ease-out` quint/expo, 150–250ms for product
transitions. Three sanctioned set pieces:

1. **Score reveal** — count-up + ring sweep (≈700ms, once, on feedback arrival).
2. **Card swipe** — spring physics (Motion.dev), velocity-aware, for scenario/day browsing.
3. **Recording state** — the spotlight glow breathes with detected speech (input-driven, not a loop).

Every animation has a `prefers-reduced-motion` alternative (instant or crossfade).
Bans: pulsing dots, hover-scale-everything, uniform section fade-ins, orchestrated page loads.

## Components

Consistent vocabulary across screens: one button shape, one form vocabulary, one icon style
(1.5px stroke, rounded caps). Every interactive element ships default/hover/focus/active/
disabled/loading/error. Skeletons for loading, teaching empty states, visible focus rings
(`outline: 2px solid var(--accent); outline-offset: 2px`).

## Layout

Mobile-first, max-w-md center column on phones; content widens to a two-column rehearsal/
history layout ≥1024px. Bottom tab bar on mobile (Today / Library / Progress), left rail on
desktop. Semantic z-scale: nav 10 · sheet-backdrop 40 · sheet 50 · toast 60.
