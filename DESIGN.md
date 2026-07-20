# Design — "The Cellar Label"

Orato reads like a fine wine label: near-black paper, Dutch White ink, deep Wine accents.
The user's words are the vintage; the chrome is the label around them.
Register: **product** — the tool disappears into the rehearsal.

## Scene sentence

A solo speaker rehearsing at night — phone in hand, lamp off, saying the words out loud.
Dark UI is forced by the scene: the room is dim, the app is the stage light.

## Color

OKLCH throughout (source hexes: bg `#0D0B0A`, ink `#EFDFBB` Dutch White, wine `#722F37`).
Everything on screen is a tint or shade of those three — no colors outside the family.

| Token          | Value                       | Role |
|----------------|-----------------------------|------|
| `--bg`         | `oklch(0.145 0.006 40)`     | Body — near-black with a hint of warmth, never pure #000 |
| `--surface`    | `oklch(0.175 0.012 25)`     | Inputs, skeletons (content boxes are outlined, not filled) |
| `--surface-2`  | `oklch(0.215 0.018 22)`     | Raised elements |
| `--line`       | `oklch(0.42 0.105 17 / .32)`| Wine at ~30% — the thin 1px outline on every content box |
| `--ink`        | `oklch(0.905 0.048 92)`     | Dutch White — body text, highlights, streak |
| `--muted`      | `oklch(0.72 0.035 85)`      | Secondary text |
| `--primary`    | `oklch(0.40 0.105 17)`      | Wine — CTAs, record button. Dutch White text. |
| `--primary-deep` | `oklch(0.32 0.088 15)`    | Pressed states, wine-tinted surfaces |
| `--accent`     | `oklch(0.64 0.13 17)`       | Lifted rose-wine — scores, section labels, earned things |
| `--accent-dim` | `oklch(0.56 0.105 17)`      | Subdued wine accents |
| `--ok`         | `oklch(0.83 0.085 88)`      | Success — cream-gold |
| `--warn`       | `oklch(0.70 0.095 55)`      | Caution |
| `--bad`        | `oklch(0.56 0.155 20)`      | Errors, flagged language |

Rule: Dutch White marks **content and earned things**; wine marks **action and structure**
(CTAs, box outlines). Neither is decoration. Inactive states are neutral.

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
