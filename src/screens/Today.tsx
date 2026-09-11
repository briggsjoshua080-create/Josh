import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { wordAtIndex, isBeyondCore } from "@/lib/daily";
import { tipsForToday } from "@/data/tips";
import {
  dailyChallenge,
  dailyPathState,
  dailyWordIndex,
  db,
  todayISO,
  getWordBonus,
  awardWordUseBonus,
  rerollDailyChallenge,
} from "@/lib/db";
import { requestWordCheck, type WordCheckResult } from "@/lib/feedback";
import { WORD_USE_BONUS } from "@/lib/progression";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { SnapSection } from "@/components/SnapSection";
import { TodayHero } from "@/components/TodayHero";
import { FlipCard } from "@/components/kokonut/FlipCard";
import type { Challenge, Session, WordEntry } from "@/lib/types";

export function Today() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  // wordIndex is the randomly drawn slot for today's calendar date, persisted
  // in IndexedDB — independent of `day`, so a progress reset can't rewind it.
  const [state, setState] = useState<{
    day: number;
    doneToday: boolean;
    wordIndex: number;
    challenge: Challenge;
  } | null>(null);
  const [todaySession, setTodaySession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const [{ day, doneToday }, wordIndex] = await Promise.all([dailyPathState(), dailyWordIndex()]);
      // Not challengeForDay: the user may have swapped today's prompt for
      // another one, and the recording screen resolves the same way.
      const challenge = await dailyChallenge(day);
      setState({ day, doneToday, wordIndex, challenge });
      if (doneToday) {
        const sessions = await db.sessions.where("day").equals(day).toArray();
        setTodaySession(sessions[sessions.length - 1] ?? null);
      }
    })();
  }, []);

  if (!state) return <ScreenSkeleton />;

  const word = wordAtIndex(state.wordIndex, lang);
  const mins = (s: number) => (s >= 60 ? `${Math.round(s / 60)} ${t("minutes")}` : `${s} ${t("seconds")}`);

  return (
    <div className="pt-2 lg:pt-0">
      {/* The streak now lives in the shared header (see HeaderStats), next to XP */}

      {/* Hero collage + day heading */}
      <SnapSection>
        <TodayHero />
        <h1 className="mt-4 text-2xl font-semibold text-ink">{t("dayLabel", { n: state.day })}</h1>
        <p className="mt-1 text-sm text-muted">
          {isBeyondCore(state.day) ? t("dayBeyondCore") : t("dayOfPath", { n: state.day })}
        </p>
      </SnapSection>

      {/* Word of the day — definition hidden until tapped */}
      <SnapSection className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("wordOfDay")}
        </h2>
        <WordOfDay key={`${state.wordIndex}:${lang}`} word={word} day={state.day} />
      </SnapSection>

      {/* Challenge */}
      <SnapSection className="mt-10">
        <h2 className="text-sm font-medium text-muted">{t("todayChallenge")}</h2>
        {state.doneToday ? (
          <div className="mt-3">
            <div className="box flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ok/15 text-ok">
                <Icon name="check" size={22} />
              </span>
              <div>
                <p className="font-medium text-ink">{t("doneToday", { n: state.day })}</p>
                <p className="mt-0.5 text-sm text-muted">{t("doneTodaySub")}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {todaySession?.id && (
                <Button variant="gold" onClick={() => navigate(`/feedback/${todaySession.id}`)}>
                  {t("reviewFeedback")}
                </Button>
              )}
              <Link to="/scenarios" className="text-center text-sm text-muted hover:text-ink underline underline-offset-4">
                {t("practiceScenario")}
              </Link>
            </div>
          </div>
        ) : (
          <ChallengeCard
            day={state.day}
            initial={state.challenge}
            mins={mins}
            onBegin={() => navigate(`/session?kind=daily&day=${state.day}`)}
          />
        )}
      </SnapSection>

      {/* Daily communication tips — three rotate with the calendar */}
      <SnapSection className="mt-10 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("dailyTipsTitle")}
        </h2>
        <div className="box mt-3 p-5" data-testid="daily-tips">
          <ul className="flex flex-col gap-4">
            {tipsForToday().map((tip) => (
              <li key={tip.title.en}>
                <p className="text-sm font-medium text-accent-dim">{tip.title[lang]}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/85">{tip.body[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
      </SnapSection>
    </div>
  );
}

/** Matches FlipCard's 500ms turn: long enough that a double-tap can't strand it. */
const FLIP_MS = 520;
/** The card is edge-on early under ease-out-expo, so the row below swaps early too. */
const META_SWAP_MS = 150;

/**
 * Today's challenge, with an escape hatch. The card itself is inert scenery;
 * "New challenge" turns it over to a different prompt drawn from the whole
 * catalogue. The swap is persisted per calendar date, so a reload — and the
 * recording screen — show the same prompt the user settled on. It never moves
 * the day number: the path counts days completed, not prompts refused.
 *
 * Two faces alternate by flip parity, so the card can be turned again and
 * again. The next challenge is written into whichever face is hidden, then the
 * card turns, which is why the new prompt is never glimpsed before the turn.
 */
function ChallengeCard({
  day,
  initial,
  mins,
  onBegin,
}: {
  day: number;
  initial: Challenge;
  mins: (s: number) => string;
  onBegin: () => void;
}) {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [faces, setFaces] = useState<[Challenge, Challenge]>([initial, initial]);
  const [busy, setBusy] = useState(false);
  /* The meta row sits outside the card so the layout is unchanged; it crosses
     over on its own rather than riding the 3D transform. */
  const [meta, setMeta] = useState(initial);
  const [metaOut, setMetaOut] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  async function reroll() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await rerollDailyChallenge(day);
      setFaces((f) => (flipped ? [next, f[1]] : [f[0], next]));
      setFlipped((v) => !v);
      if (reduced) {
        setMeta(next);
      } else {
        setMetaOut(true);
        timers.current.push(
          window.setTimeout(() => {
            setMeta(next);
            setMetaOut(false);
          }, META_SWAP_MS),
        );
      }
      timers.current.push(window.setTimeout(() => setBusy(false), reduced ? 0 : FLIP_MS));
    } catch {
      // The draw is local-only; if IndexedDB refuses, leave the card as it is.
      setBusy(false);
    }
  }

  const face = (c: Challenge) => (
    <>
      <h3 className="lectern text-2xl lg:text-3xl text-ink">{c.title[lang]}</h3>
      <p className="lectern mt-4 text-lg leading-relaxed text-ink/90">{c.prompt[lang]}</p>
      <p className="mt-5 text-sm text-muted">
        <span className="text-accent-dim">{t("coachFocus")}:</span> {c.focus[lang]}
      </p>
    </>
  );

  return (
    <>
      <div className="mt-3">
        <FlipCard
          flipped={flipped}
          front={face(faces[0])}
          back={face(faces[1])}
          faceClassName="bg-surface-2"
          testId="challenge-card"
        />
      </div>

      {/* gap-y lets the control drop to its own line on a narrow phone rather
          than squeezing the target length into a mid-phrase wrap. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <div
          className="flex items-center gap-3"
          style={{ opacity: metaOut ? 0 : 1, transition: `opacity ${META_SWAP_MS}ms ease-out` }}
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="clock" size={15} />
            {t("targetLength", { a: mins(meta.targetSec[0]), b: mins(meta.targetSec[1]) })}
          </span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i < meta.difficulty ? "bg-accent-dim" : "bg-surface-2"}`}
              />
            ))}
          </span>
        </div>

        <button
          type="button"
          onClick={reroll}
          disabled={busy}
          data-testid="new-challenge"
          className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--radius-pill) px-2 py-1 text-sm text-muted transition-colors hover:text-ink disabled:opacity-50"
        >
          <Icon name="refresh" size={15} className="text-gold/70" />
          {t("newChallenge")}
        </button>
      </div>

      <Button size="lg" className="mt-6 w-full" onClick={onBegin}>
        <Icon name="mic" size={20} />
        {t("beginSession")}
      </Button>
    </>
  );
}

/**
 * The daily word card. Collapsed it shows only the word; tapping expands it
 * in place to reveal the definition plus the "use it in a sentence" bonus:
 * the sentence goes to the same coach backend as speech feedback, and a
 * confirmed correct use earns +100 XP — once per daily word (persisted, so
 * resubmitting or reloading can't farm it).
 */
function WordOfDay({ word, day }: { word: WordEntry; day: number }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  /** null while IndexedDB answers whether today's bonus was already earned. */
  const [done, setDone] = useState<boolean | null>(null);
  const [sentence, setSentence] = useState("");
  const [checking, setChecking] = useState(false);
  const [verdict, setVerdict] = useState<WordCheckResult | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    getWordBonus(todayISO()).then((b) => setDone(b !== undefined));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const s = sentence.trim();
    if (!s || checking || done !== false) return;
    setOffline(false);
    setVerdict(null);
    setChecking(true);
    try {
      const result = await requestWordCheck({ lang, word: word.word, definition: word.definition, sentence: s });
      if (result.correct) {
        await awardWordUseBonus(day, word.word);
        setDone(true);
      }
      setVerdict(result);
    } catch {
      setOffline(true);
    }
    setChecking(false);
  }

  return (
    <div className="mt-3">
      <FlipCard
        flipped={open}
        onFlip={() => setOpen(!open)}
        testId="word-of-day-toggle"
        label={word.word}
        front={
          <span className="flex w-full items-center gap-3">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
              <span className="lectern text-2xl text-ink" style={{ overflowWrap: "break-word" }}>
                {word.word}
              </span>
              {/* Dictionary-style IPA, always visible next to the word */}
              <span className="text-sm text-muted">{word.pronunciation}</span>
            </span>
            {done && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
                <Icon name="check" size={13} />
              </span>
            )}
            <span className="ml-auto shrink-0 text-xs text-faint">{t("wordRevealHint")}</span>
          </span>
        }
        back={
          <span className="block">
            <span className="flex items-baseline gap-2.5">
              <span className="lectern text-xl text-ink" style={{ overflowWrap: "break-word" }}>
                {word.word}
              </span>
              <span className="text-sm text-muted italic">{word.pos}</span>
            </span>
            <span className="mt-2 block text-base text-ink/90" style={{ overflowWrap: "break-word" }}>
              {word.definition}
            </span>
            <span className="lectern mt-3 block text-base italic text-muted" style={{ overflowWrap: "break-word" }}>
              “{word.example}”
            </span>
            <span className="mt-3 block text-sm text-accent-dim">{t("wordOfDayHint")}</span>
          </span>
        }
      />

      {open && (
        <div className="mt-3">
          {done === false && (
            <form onSubmit={submit} className="box box-border p-5">
              <label htmlFor="word-use-sentence" className="block text-sm font-medium text-ink">
                {t("wordUsePrompt")}
              </label>
              <p className="mt-1 text-xs text-muted">{t("wordUseBonusHint", { n: WORD_USE_BONUS })}</p>
              <textarea
                id="word-use-sentence"
                rows={2}
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={t("wordUsePlaceholder")}
                maxLength={500}
                className="mt-3 w-full resize-none rounded-(--radius-control) border border-line bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
              <Button
                type="submit"
                className="mt-3 w-full"
                disabled={checking || sentence.trim().length === 0}
              >
                {checking ? t("wordUseChecking") : t("wordUseSubmit")}
              </Button>
              {verdict && !verdict.correct && (
                <p className="mt-3 text-sm leading-relaxed text-warn" role="status">
                  {verdict.feedback} {t("wordUseTryAgain")}
                </p>
              )}
              {offline && (
                <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                  {t("wordUseOffline")}
                </p>
              )}
            </form>
          )}

          {done && (
            <div className="flex items-start gap-3 rounded-(--radius-card) border border-ok/40 bg-ok/10 p-4" role="status">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok/20 text-ok">
                <Icon name="check" size={13} />
              </span>
              <span>
                <span className="tnum block text-sm font-semibold text-ok">
                  {t("wordUseEarned", { n: WORD_USE_BONUS })}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink/85">
                  {verdict?.correct ? verdict.feedback : t("wordUseDone")}
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScreenSkeleton() {
  return (
    <div className="animate-pulse pt-2">
      <div className="h-8 w-32 rounded bg-surface" />
      <div className="mt-8 h-40 rounded-(--radius-card) bg-surface" />
      <div className="mt-10 h-64 rounded-(--radius-card) bg-surface" />
    </div>
  );
}
