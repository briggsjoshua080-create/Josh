import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { wordAtIndex } from "@/lib/daily";
import { tipsForToday } from "@/data/tips";
import { dailyPathState, dailyWordIndex, dailyScenarioId, db } from "@/lib/db";
import { SCENARIOS } from "@/data/scenarios";
import { DIFFICULTY_LABEL } from "@/data/categories";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { SnapSection } from "@/components/SnapSection";
import { TodayHero } from "@/components/TodayHero";
import { FlipCard } from "@/components/kokonut/FlipCard";
import type { Scenario, Session, WordEntry } from "@/lib/types";

export function Today() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  // wordIndex is the randomly drawn slot for today's calendar date, persisted
  // in IndexedDB — independent of `day`, so a progress reset can't rewind it.
  // `scenario` is today's random daily-challenge pick, resolved the same way.
  const [state, setState] = useState<{
    day: number;
    doneToday: boolean;
    wordIndex: number;
    scenario: Scenario;
  } | null>(null);
  const [todaySession, setTodaySession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const { day, doneToday } = await dailyPathState();
      const [wordIndex, scenarioId] = await Promise.all([dailyWordIndex(), dailyScenarioId(day)]);
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
      setState({ day, doneToday, wordIndex, scenario });
      if (doneToday) {
        const sessions = await db.sessions.where("day").equals(day).toArray();
        setTodaySession(sessions[sessions.length - 1] ?? null);
      }
    })();
  }, []);

  if (!state) return <ScreenSkeleton />;

  const { scenario: challenge } = state;
  const word = wordAtIndex(state.wordIndex, lang);
  const mins = (s: number) => (s >= 60 ? `${Math.round(s / 60)} ${t("minutes")}` : `${s} ${t("seconds")}`);

  return (
    <div className="pt-2 lg:pt-0">
      {/* The streak now lives in the shared header (see HeaderStats), next to XP */}

      {/* Hero collage + day heading */}
      <SnapSection>
        <TodayHero />
        <h1 className="mt-4 text-2xl font-semibold text-ink">{t("dayLabel", { n: state.day })}</h1>
        <p className="mt-1 text-sm text-muted">{t("dayOfPath", { n: state.day })}</p>
      </SnapSection>

      {/* Word of the day — definition hidden until tapped */}
      <SnapSection className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("wordOfDay")}
        </h2>
        <WordOfDay key={`${state.wordIndex}:${lang}`} word={word} />
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
          <>
            <div className="box box-raised mt-3 p-5">
              <h3 className="lectern text-2xl lg:text-3xl text-ink">{challenge.title[lang]}</h3>
              <p className="lectern mt-4 text-lg leading-relaxed text-ink/90">{challenge.prompt[lang]}</p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={15} />
                {t("targetLength", { a: mins(challenge.targetSec[0]), b: mins(challenge.targetSec[1]) })}
              </span>
              <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium">
                {t(DIFFICULTY_LABEL[challenge.difficulty])}
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

/**
 * The daily word card. Collapsed it shows only the word; tapping flips it in
 * place to reveal the pronunciation, definition and an example sentence.
 * Purely informational — using the word during a recording still earns its
 * own bonus (see wordOfDayUsed / WORD_OF_DAY_BONUS), tracked separately.
 */
function WordOfDay({ word }: { word: WordEntry }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

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
