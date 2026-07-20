import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { challengeForDay, wordForDay, isBeyondCore } from "@/lib/daily";
import { tipsForToday } from "@/data/tips";
import { dailyPathState, currentStreak, db, todayISO, getWordBonus, awardWordUseBonus } from "@/lib/db";
import { requestWordCheck, type WordCheckResult } from "@/lib/feedback";
import { WORD_USE_BONUS } from "@/lib/progression";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { Session, WordEntry } from "@/lib/types";

export function Today() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<{ day: number; doneToday: boolean; streak: number } | null>(null);
  const [todaySession, setTodaySession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const [{ day, doneToday }, streak] = await Promise.all([dailyPathState(), currentStreak()]);
      setState({ day, doneToday, streak });
      if (doneToday) {
        const sessions = await db.sessions.where("day").equals(day).toArray();
        setTodaySession(sessions[sessions.length - 1] ?? null);
      }
    })();
  }, []);

  if (!state) return <ScreenSkeleton />;

  const challenge = challengeForDay(state.day);
  const word = wordForDay(state.day, lang);
  const mins = (s: number) => (s >= 60 ? `${Math.round(s / 60)} ${t("minutes")}` : `${s} ${t("seconds")}`);

  return (
    <div className="pt-2 lg:pt-0">
      {/* Day + streak line */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t("dayLabel", { n: state.day })}</h1>
        <span className={`flex items-center gap-1.5 text-sm ${state.streak > 0 ? "text-accent" : "text-muted"}`}>
          <Icon name="flame" size={16} />
          {state.streak === 1
            ? t("streakOneDay")
            : state.streak > 0
              ? t("streakDays", { n: state.streak })
              : t("streakNone")}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {isBeyondCore(state.day) ? t("dayBeyondCore") : t("dayOfPath", { n: state.day })}
      </p>

      {/* Word of the day — definition hidden until tapped */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("wordOfDay")}
        </h2>
        <WordOfDay key={`${state.day}:${lang}`} word={word} day={state.day} />
      </section>

      {/* Challenge */}
      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted">{t("todayChallenge")}</h2>
        {state.doneToday ? (
          <div className="mt-3">
            <div className="flex items-center gap-3 rounded-(--radius-card) border border-line bg-surface p-5">
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
          <>
            <div className="mt-3 rounded-(--radius-card) border border-line p-5">
              <h3 className="lectern text-2xl lg:text-3xl text-ink">{challenge.title[lang]}</h3>
              <p className="lectern mt-4 text-lg leading-relaxed text-ink/90">{challenge.prompt[lang]}</p>
              <p className="mt-5 text-sm text-muted">
                <span className="text-accent-dim">{t("coachFocus")}:</span> {challenge.focus[lang]}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={15} />
                {t("targetLength", { a: mins(challenge.targetSec[0]), b: mins(challenge.targetSec[1]) })}
              </span>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i < challenge.difficulty ? "bg-accent-dim" : "bg-surface-2"}`}
                  />
                ))}
              </span>
            </div>
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => navigate(`/session?kind=daily&day=${state.day}`)}
            >
              <Icon name="mic" size={20} />
              {t("beginSession")}
            </Button>
          </>
        )}
      </section>

      {/* Daily communication tips — three rotate with the calendar */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("dailyTipsTitle")}
        </h2>
        <div className="mt-3 rounded-(--radius-card) border border-line bg-surface p-5" data-testid="daily-tips">
          <ul className="flex flex-col gap-4">
            {tipsForToday().map((tip) => (
              <li key={tip.title.en}>
                <p className="text-sm font-medium text-accent-dim">{tip.title[lang]}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/85">{tip.body[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
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
    <div className="mt-3 rounded-(--radius-card) border border-line bg-surface">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-5 text-left"
        data-testid="word-of-day-toggle"
      >
        <span className="lectern text-2xl text-ink">{word.word}</span>
        {done && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
            <Icon name="check" size={13} />
          </span>
        )}
        {!open && <span className="ml-auto text-xs text-faint">{t("wordRevealHint")}</span>}
        <Icon
          name="chevronDown"
          size={16}
          className={`shrink-0 text-faint transition-transform duration-150 ${open ? "ml-auto rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t hairline p-5 pt-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted italic">{word.pos}</span>
            <span className="tnum ml-auto text-sm text-muted">{word.pronunciation}</span>
          </div>
          <p className="mt-2 text-base text-ink/90">{word.definition}</p>
          <p className="lectern mt-3 text-base italic text-muted">“{word.example}”</p>
          <p className="mt-3 text-sm text-accent-dim">{t("wordOfDayHint")}</p>

          {done === false && (
            <form onSubmit={submit} className="mt-5 border-t hairline pt-4">
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
            <div className="mt-5 flex items-start gap-3 rounded-(--radius-card) border border-ok/40 bg-ok/10 p-4" role="status">
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
