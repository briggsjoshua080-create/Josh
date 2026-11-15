# Orato review

**Date:** 2026-11-15 · **Scope:** the whole app, reviewed as it is (no code changed yet) · **Status:** Phase 1 (review) is done. Fixing waits for "weiter".

Skills used: impeccable (audit), ui-ux-pro-max (accessibility and touch rules), design-taste-frontend (looking for "AI-made" visual patterns; most of this skill is about landing pages, so only its general rules were applied to this app).

---

## 1. How the review was done

| Check | Result |
|---|---|
| Type check (`tsc -b`) | ✅ 0 errors |
| Linter | ⚠️ **None set up** (no ESLint/Biome in the project). See M-10 |
| Unit tests (`vitest`) | ✅ 16 files, 178 tests, all pass |
| Production build (`vite build`) | ✅ Builds. ⚠️ 1 warning: the app is one 929 KB JavaScript file (308 KB compressed). See M-9 |
| Browser run-through | Every screen at phone size (390×844) and desktop size (1440×900): splash, Today, word card, Scenarios, Library, Progress, Settings, recording, Feedback (offline) |
| Console / network | **No JavaScript errors on any screen.** The only failed request was `POST /api/feedback → 503`, which is expected: there is no Anthropic key on this test machine. The app correctly showed its "couldn't reach your coach" card |
| Security | The API key is **never** in browser code (searched the source and the built bundle: 0 hits) |
| Logic probes | Two bugs were proven with a throwaway test (deleted afterwards): H-2 and H-3 |

**One correction to the brief:** Orato is built with **Vite + React + TypeScript**, not Next.js. The only server part is a single Vercel function (`api/feedback.ts` → `server/coach.ts`). User data is stored in **IndexedDB** (through Dexie). `localStorage` holds only small settings.

### Project map

**Screens (routes in `src/App.tsx`)**
- `/` Today (`src/screens/Today.tsx`): hero, day label, word of the day (flip card with IPA), daily challenge, tips
- `/scenarios` Scenarios (`Scenarios.tsx`): 248 scenarios, card deck or list, filters, search, "surprise me"
- `/library` Library (`Library.tsx`): 29 technique cards with filters
- `/progress` Progress (`Progress.tsx`): radar, trend chart, history
- `/settings` Settings (`Settings.tsx`): language, storage status, reset
- `/session` recording (`Session.tsx`): mic, live transcript, pause/discard/finish, typed fallback
- `/feedback/:id` Feedback (`Feedback.tsx`): score ring, XP, radar, one win and two fixes, details

**Main components:** AppShell (header, side rail, tab bar, swipe navigation), HeaderStats (streak and XP pills), FlipCard, CardDeck, RecordRing, Waveform, ScoreRing, MetricRadar, TrendChart, ConfirmDialog, ErrorBoundary, LoadError, OratoSplash.

**Logic:** `lib/db.ts` (storage, streak, daily picks), `lib/progression.ts` (XP, ranks, scores), `lib/daily.ts`, `lib/speech.ts`, `lib/metrics.ts`, `lib/feedback.ts`, `lib/appUpdate.ts` (service-worker reload guard).

**API:** `POST /api/feedback` (`api/feedback.ts` + `server/coach.ts`).

### Overall impression

The code is unusually careful. Most edge cases (midnight recordings, iOS storage eviction, a reload during a recording, rate limits, timeouts, refusals, a broken database) are already handled and commented. The theme is consistent and distinctive, it does **not** look AI-generated, and reduced motion is respected everywhere. The problems below are mostly **real-life bugs in the daily loop** and **small tap targets and contrast** on phone.

### Audit health score (impeccable)

| # | Area | Score | Main finding |
|---|---|---|---|
| 1 | Accessibility | 3/4 | Filter pills and some labels are below AA contrast; small tap targets |
| 2 | Performance | 3/4 | One 929 KB bundle; the XP pill re-reads all transcripts after every save |
| 3 | Responsive | 2/4 | The main buttons sit below the fold on phone; several tap targets under 44 px; titles hidden after a tab switch |
| 4 | Theming | 4/4 | Tokens used everywhere, contrast checked by a test |
| 5 | Anti-patterns | 4/4 | No AI-template look; the wine-label theme is applied consistently |
| **Total** | | **16/20** | **Good**: fix the phone-specific problems |

---

## 2. Findings

Severity: **Critical** = data loss, a security hole or the app is unusable · **High** = a core feature is wrong, or a clear accessibility failure on the main flow · **Medium** = it hurts but there is a workaround · **Low** = polish.

### Critical

**None found.** No key leak, no injection hole, nothing that makes the app unusable.

---

### High

#### H-1 · Switching tabs hides the page title under the header and keeps the old scroll position
- **Where:** `src/components/AppShell.tsx:99` (`mainRef.current?.focus()`)
- **What's wrong:** After every screen change the app moves keyboard focus to the content area (good for screen readers). The browser then also scrolls that area to the top of the window, so it slides 96 px up **under the sticky header**. On Scenarios, Library and Settings the title ("Scenario library", "Library", …) is hidden. The scroll position from the previous screen is also kept. For example, scroll down on Today, tap "Scenarios", and you land halfway down the list.
- **Reproduce:** Phone size → Today → scroll down → tap *Scenarios*. Measured scroll position: 169 px instead of 0. Opening `/scenarios` directly in dev: 96 px.
- **Planned fix:** Use `focus({ preventScroll: true })` and scroll the window to the top on each route change.

#### H-2 · Typed speeches (the fallback for Firefox and other browsers without speech recognition) never get an overall score or XP
- **Where:** `src/lib/progression.ts:155` (pace = null for typed) together with `overallFromEight()` line 188 and `Feedback.tsx:126`
- **What's wrong:** A typed transcript has no pace, which is correct. But the overall score is only calculated when **all 8** metrics exist, so it is always empty. XP becomes `xpForScore(null) = 0`. Anyone on a browser without speech recognition can practise forever and never earn XP. The score ring shows "—".
- **Reproduce (proven):** A typed session with a full AI report gives `overall = null`, `xp = 0`.
- **Planned fix:** Calculate the overall score from the metrics that were actually scored (7 of 8 for typed speeches) and give the XP as normal. Keep the behaviour "no overall score before the AI report arrives".

#### H-3 · The streak looks alive after a missed day, then drops when you practise
- **Where:** `src/lib/db.ts:612–649` (`currentStreak`, 44-hour grace)
- **What's wrong:** The 44-hour grace is meant for flying across time zones. In everyday use it also hides a missed day. Practise Sunday 22:00, skip Monday, open the app Tuesday at 09:00: the pill still shows **2**. Record your speech and it drops to **1**. Practising makes the number go down, which is the opposite of motivating.
- **Reproduce (proven):** Sat 21:00 + Sun 22:00 sessions, clock set to Tue 09:00 → streak 2. Add Tuesday's session → streak 1.
- **Planned fix:** Only apply the grace when the time zone really changed. Store the time-zone offset with each new session and compare it with the current one. Without a time-zone change, the normal "today or yesterday" rule applies. Add a test for both cases.

#### H-4 · The daily screen doesn't update when the date changes while the app stays open
- **Where:** `src/screens/Today.tsx:33–54` (data is loaded once on mount); also `HeaderStats` and the date in `Session.tsx`
- **What's wrong:** A home-screen app often stays open in the background for days, especially on iPhone. Next morning Today still shows **yesterday's** word, challenge and "done today ✓". The streak pill also stays stale until something is saved. The "Begin" link carries yesterday's day number into the session (`?day=N`).
- **Reproduce:** Open Today, leave the app in the background past midnight (or change the device clock), return: nothing updates until you fully reload. *(Found by reading the code; the clock change was not simulated in the browser.)*
- **Planned fix:** Reload Today's data when the app comes back to the foreground (`visibilitychange`) and the date has changed. Re-read the streak the same way. In `Session.tsx`, take the day number from `dailyPathState()` instead of trusting the URL.

#### H-5 · During a recording, one tap on the bottom tab bar silently throws the take away
- **Where:** `src/components/AppShell.tsx:261` (tab bar always shown) and `Session.tsx` (no leave guard)
- **What's wrong:** The tab bar, the logo link and the settings icon all stay active while recording or paused. A stray tap navigates away and the recording is gone, with no "Are you sure?". The app already blocks automatic update reloads during a take; manual navigation should be protected the same way.
- **Reproduce:** Phone → start a recording → tap *Library*. The take is lost.
- **Planned fix:** While recording or paused, hide the tab bar on the recording screen (it also frees space, see H-6). Block in-app navigation and ask with the existing discard dialog, and warn on page close (`beforeunload`).

#### H-6 · On phone, the recording controls are tiny and "Finish" is below the screen edge
- **Where:** `src/screens/Session.tsx:451–485` (recording) and `498–514` (paused)
- **What's wrong:** Measured tap areas: **Pause 54×16 px, Discard 62×16 px, Type instead 90×16 px** (the minimum is 24 px, the recommendation is 44 px). On a 390×844 phone the big **Finish** button is below the fold, under the tab bar, while you are speaking. On the paused screen, "Finish" is only a 16 px tall text link.
- **Reproduce:** Phone → start recording → screenshot `phone-session-recording.png`: no Finish button visible.
- **Planned fix:** Give Pause, Discard and Type instead at least 44 px tall tap areas (padding only, same look). Hiding the tab bar (H-5) and a slightly smaller transcript strip bring Finish into view. On the paused screen, make Finish a proper secondary button.

#### H-7 · Text colours below the WCAG AA minimum on the filter pills and some labels
- **Where:** `src/components/FilterPill.tsx:17`, the view toggle in `src/screens/Scenarios.tsx:152`, the IPA text on the word card (`Today.tsx:230`), the recording ring label (`RecordRing.tsx:137`)
- **What's wrong (measured):**
  - Inactive filter pills (gold at 65 % on a half-transparent claret background): **3.6 : 1** (needs 4.5). These are 25+ buttons on Scenarios and Library.
  - "Cards / List" toggle: inactive **2.7 : 1**, active **3.2 : 1**
  - IPA pronunciation on the claret word card: **4.3 : 1**
  - Recording ring "Warming up": **3.0 : 1**; "Over time": **4.4 : 1**
  - The existing `contrast.test.ts` only checks the full-strength colours, not these transparent mixes, so it doesn't catch them.
- **Planned fix:** Use full-strength gold (or the lighter text tokens) for inactive pills and the toggle, keeping the "inactive" look through the border and background. Use the vellum tone for IPA on claret. Draw the ring zone labels with the lighter text tokens. Add these combinations to the contrast test.

---

### Medium

#### M-1 · The main daily action is 1½ screens down on phone
- **Where:** `src/screens/Today.tsx:77–81` + `src/components/TodayHero.tsx`
- **What's wrong:** The first phone screen is mostly the decorative emblem card. The challenge text and the **"Take the stage"** button start at about 1,065 px, below the fold even on desktop. The word card's front face is also about 185 px tall but holds only one word (it is sized to the back face).
- **Planned fix (design decision → I'll ask first in Phase 2):** For example a smaller hero, or the challenge card moved up, so the challenge and its button are visible without scrolling. The word card's front would shrink to fit its content.

#### M-2 · Target length shows "2 min–2 min"
- **Where:** `src/screens/Today.tsx:70` (`mins()` rounds to whole minutes)
- **What's wrong:** 34 scenarios (e.g. targets 90–120 s, 90–140 s, 100–140 s) show "Aim for **2 min–2 min**". 45–90 s shows "45 seconds–2 min", where 90 s is rounded up. The recording screen formats correctly ("1:30–2:00").
- **Planned fix:** Use the same `m:ss` format as the recording screen, or half-minute steps.

#### M-3 · Error and loading gaps
- `Today.tsx:162` "New challenge": no `catch`. A database error is silently swallowed, with no message.
- `Session.tsx:49` / `63`: if loading the daily scenario fails, the recording screen **stays on its skeleton forever**.
- `Session.tsx` with a bad or old scenario link (`/session?kind=scenario&id=xyz`): it shows "Ready when you are" with **no prompt** and lets you record. The session is then saved with an empty prompt and `refId: null`.
- Session error notices (mic denied, too short, recognition lost, save failed) are not announced to screen readers (no `role="alert"`).
- **Planned fix:** Add a catch and a short message; use the existing `LoadError` card for the endless skeleton; show a "scenario not found" card with a link back; add `role="alert"` to the notices.

#### M-4 · Other tap targets under 44 px on phone
- Settings gear icon in the header: **20×20 px**. Language toggle: 69×34. "New challenge": 131×28. Filter pills: 34 px tall. Deck arrows: 40×40. Settings language buttons: 40 px tall.
- **Planned fix:** Make the tap areas bigger with padding or a minimum height, keeping the same look (the icons stay the same size).

#### M-5 · Buttons nested inside links
- **Where:** `Feedback.tsx:493–502` (`<Link><Button/></Link>`)
- **What's wrong:** Invalid HTML. The keyboard stops twice on one control and screen readers announce it twice.
- **Planned fix:** Style the `Link` itself as a button (a shared class), with no nested `<button>`.

#### M-6 · Placeholder-only label on the typed-fallback input
- **Where:** `Session.tsx:437`
- **Planned fix:** Add an `aria-label` (or a visually hidden label) with the same text.

#### M-7 · Mandatory scroll snap on long phone sections
- **Where:** `src/styles/theme.css:558` (`scroll-snap-type: y mandatory` on phone)
- **What's wrong:** It works on the short screens. On Feedback with "More detail" open, or long Library cards, mandatory snapping can jump back or skip content, especially in iOS Safari. Chromium was fine in this test; iOS could not be tested here.
- **Planned fix:** Switch to `proximity` (as on desktop) on the screens with tall sections (Feedback, Library), or turn snapping off while the details panel is open. **Please check on your iPhone afterwards.**

#### M-8 · No security headers on the deployed site
- **Where:** `vercel.json`
- **What's wrong:** No `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, or frame protection (`frame-ancestors`). Another site could embed Orato in a frame.
- **Planned fix:** Add a `headers` block to `vercel.json` with a CSP that allows only Orato's own scripts, styles and fonts, plus the other headers.

#### M-9 · The whole app ships as one 929 KB JavaScript file
- **What's wrong:** The first visit downloads the chart library, all 248 scenarios, both word lists and the library data before anything shows (308 KB compressed). After that the service worker caches it.
- **Planned fix:** Load Progress (Chart.js) and the scenario data only when they are needed. **Caution:** `lib/appUpdate.ts` says reloading is safe *because* there is only one file. Splitting it needs that logic checked, so I'd do it carefully or skip it (your call).

#### M-10 · No linter
- **Planned fix:** Add ESLint with the React Hooks rules (the code already has `eslint-disable` comments that expect it), plus an `npm run lint` script. Fix only real errors.

#### M-11 · The API's abuse protection depends on two settings outside the code
- **Where:** `server/coach.ts:185–219`, README "Protecting the API budget"
- **What's wrong:** The code checks size, origin and JSON, and keeps a per-IP limit (20 requests per 10 minutes). That limit lives in one server instance's memory, and a script without an `Origin` header passes the origin check. The README already says the real protection is (1) a **spend cap on the Anthropic key** and (2) a **Vercel firewall rate-limit rule**. I can't see whether those are set.
- **Planned fix (needs you):** I'll give you step-by-step instructions to check both in the Anthropic Console and the Vercel dashboard. No code change.

---

### Low (only if you ask)

- **L-1** The offline Feedback card repeats itself: title "Couldn't reach your coach." and the body starts with the same sentence again (`strings.ts`, `coachFailed`).
- **L-2** Today shows "Day 1" and right below it "Day 1 of your speaking journey". The same fact appears twice.
- **L-3** The header settings icon reads like a sun or brightness symbol, and the streak flame reads like a drop at 13 px.
- **L-4** The language button's spoken name is "Sprache: Deutsch" while it shows "DE". On the desktop rail an English user sees "SPRACHE: DEUTSCH" in capitals over two lines.
- **L-5** The XP pill (`HeaderStats.tsx:305`) re-reads **every session including full transcripts** after each save. That's fine now, but it gets slower after hundreds of sessions.
- **L-6** README calls the design "The Stage"; DESIGN.md calls it "The Cellar Label". The README is out of date.
- **L-7** AI model: `claude-sonnet-5` is valid. A newer model with the same price, `claude-sonnet-5-5`, exists. A server-side refusal fallback could also be added. Model choice is yours, so no change without your OK.
- **L-8** The "rerolled away today" memory (`db.ts:202`) isn't reset when the date changes in a long-open app (minor, linked to H-4).

---

## 3. What works well (keep it)

- The API key never reaches the browser. Requests are size-capped, cross-site calls are blocked, there's a rate limit, timeouts, refusal and truncation handling, and the client checks the AI's answer before trusting it.
- XP is recalculated from the saved sessions, so it can never be double-counted. A recording that crosses midnight counts for the day it started.
- Recordings are protected from automatic app-update reloads. Pause, resume and "too short" keep the words already spoken.
- Persistent storage is requested after the first save, and Settings shows the storage status.
- Reduced motion is respected in three layers. Focus rings are visible. Screen changes are announced to screen readers.
- The colour tokens are disciplined (one file, a contrast test), and the wine-label theme is consistent on every screen.
- 178 tests cover the data layer, the date logic, scores and validation.

---

## 4. Plan for Phase 2 (after "weiter")

Branch `orato-review-fixes`. Each group gets its own commit, then build + type check + tests + phone and desktop browser check:

1. **Navigation and scroll:** H-1
2. **Daily loop correctness:** H-2, H-3, H-4 (+ new tests)
3. **Recording safety and controls:** H-5, H-6, M-3 (session parts), M-6
4. **Contrast and tap targets:** H-7, M-4
5. **Today polish:** M-2, M-3 (reroll), and M-1 *only after you choose a layout*
6. **Feedback and markup:** M-5, M-7
7. **Hardening:** M-8, M-10, (M-9 only if you agree)
8. M-11: written instructions for you, no code

### Two things to clear up before Phase 2

1. **Push and Base44:** your `CLAUDE.md` says finished work should go straight to `main` and also be copied to the Base44 "Orato" app and published there. For this review you said **don't push and don't deploy**, so I'll follow that: commits stay local on `orato-review-fixes`, and Base44 and Vercel are not touched. If you also want the fixes mirrored into Base44 later, tell me after you've checked them.
2. **M-1 (Today layout):** this is a visible design change, so I'll describe two options in one or two sentences and wait for your pick.
