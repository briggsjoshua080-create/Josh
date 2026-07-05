import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { challengeForDay, wordForDay, isBeyondCore } from "@/lib/daily";
import { dailyPathState, currentStreak, db } from "@/lib/db";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { Session } from "@/lib/types";

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

      {/* Word of the day */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon name="sparkle" size={16} />
          {t("wordOfDay")}
        </h2>
        <div className="mt-3 rounded-(--radius-card) bg-surface p-5">
          <div className="flex items-baseline gap-3">
            <span className="lectern text-2xl text-ink">{word.word}</span>
            <span className="text-sm text-muted italic">{word.pos}</span>
            <span className="tnum ml-auto text-sm text-muted">{word.pronunciation}</span>
          </div>
          <p className="mt-2 text-base text-ink/90">{word.definition}</p>
          <p className="lectern mt-3 text-base italic text-muted">“{word.example}”</p>
          <p className="mt-3 text-sm text-accent-dim">{t("wordOfDayHint")}</p>
        </div>
      </section>

      {/* Challenge */}
      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted">{t("todayChallenge")}</h2>
        {state.doneToday ? (
          <div className="mt-3">
            <div className="flex items-center gap-3 rounded-(--radius-card) bg-surface p-5">
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
              <Link to="/library" className="text-center text-sm text-muted hover:text-ink underline underline-offset-4">
                {t("practiceScenario")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 border-t border-b hairline py-6">
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
