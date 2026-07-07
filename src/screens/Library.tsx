import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { allSessions } from "@/lib/db";
import { SCENARIOS } from "@/data/scenarios";
import { CATEGORIES } from "@/data/categories";
import { SKILLS, type SkillDimension } from "@/data/skills";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { CardDeck } from "@/components/CardDeck";
import type { StringKey } from "@/lib/strings";
import type { CategoryId, Scenario, Session } from "@/lib/types";

/** Feedback-report label key per recommendable score dimension. */
const DIMENSION_LABEL: Record<SkillDimension, StringKey> = {
  pace: "scorePace",
  volume: "scoreVolume",
  fillers: "scoreFillers",
  fluency: "scoreFluency",
  eloquence: "scoreEloquence",
  structure: "scoreStructure",
  stylistic: "scoreStyle",
  comprehensiveness: "scoreComprehensiveness",
  logic: "scoreLogic",
  phrasing: "scorePhrasing",
  professionalism: "scoreProfessionalism",
};

const DIFFICULTY_LABEL: Record<Scenario["difficulty"], StringKey> = {
  1: "difficultyBeginner",
  2: "difficultyIntermediate",
  3: "difficultyAdvanced",
};

/** Rounded-up rehearsal length in minutes from the scenario's target range. */
function estMinutes(s: Scenario): number {
  return Math.max(1, Math.round(s.targetSec[1] / 60));
}

export function Library() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [view, setView] = useState<"deck" | "list">("deck");
  const [query, setQuery] = useState("");
  /** null while IndexedDB is still answering — drives the skeleton state. */
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let alive = true;
    allSessions().then((s) => alive && setSessions(s));
    return () => {
      alive = false;
    };
  }, []);

  /** Best overall score per practiced scenario — the card's mastery %. */
  const masteryById = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions ?? []) {
      if (s.kind !== "scenario") continue;
      map.set(s.refId, Math.max(map.get(s.refId) ?? 0, s.progress?.overallScore ?? s.scores.overall));
    }
    return map;
  }, [sessions]);

  /**
   * "Recommended next": the weakest dimension of the latest feedback report
   * picks the categories that train it; prefer the easiest unpracticed
   * scenario among them. Without history, fall back to the easiest
   * unpracticed scenario overall.
   */
  const recommended = useMemo(() => {
    if (!sessions) return null;
    const latest = [...sessions].sort((a, b) => b.startedAt - a.startedAt)[0];
    let weakest: SkillDimension | null = null;
    if (latest) {
      let min = Infinity;
      for (const dim of Object.keys(DIMENSION_LABEL) as SkillDimension[]) {
        const v = latest.scores[dim];
        if (v !== null && v < min) {
          min = v;
          weakest = dim;
        }
      }
    }
    const cats = weakest
      ? (Object.keys(SKILLS) as CategoryId[]).filter((c) => SKILLS[c].dimensions.includes(weakest))
      : [];
    const pool = cats.length ? SCENARIOS.filter((s) => cats.includes(s.category)) : SCENARIOS;
    const byEase = (a: Scenario, b: Scenario) => a.difficulty - b.difficulty;
    const scenario =
      pool.filter((s) => !masteryById.has(s.id)).sort(byEase)[0] ?? [...pool].sort(byEase)[0];
    return scenario ? { scenario, weakest } : null;
  }, [sessions, masteryById]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCENARIOS.filter(
      (s) =>
        (!filter || s.category === filter) &&
        (!q || s.title[lang].toLowerCase().includes(q) || s.prompt[lang].toLowerCase().includes(q)),
    );
  }, [filter, query, lang]);

  /** List view groups by category only in the unfiltered, unsearched state. */
  const groups = useMemo(() => {
    if (filter || query.trim()) return null;
    return CATEGORIES.map((c) => ({ cat: c, items: list.filter((s) => s.category === c.id) })).filter(
      (g) => g.items.length > 0,
    );
  }, [filter, query, list]);

  function surprise() {
    const pick = list[Math.floor(Math.random() * list.length)];
    if (pick) navigate(`/session?kind=scenario&id=${pick.id}`);
  }

  const start = (s: Scenario) => navigate(`/session?kind=scenario&id=${s.id}`);
  const catOf = (s: Scenario) => CATEGORIES.find((c) => c.id === s.category)!;

  if (sessions === null) return <LibrarySkeleton title={t("libraryTitle")} />;

  return (
    <div className="pt-2 lg:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("libraryTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{t("librarySub", { n: SCENARIOS.length })}</p>
        </div>
        <div className="flex shrink-0 rounded-full border border-line p-0.5" role="tablist">
          {(["deck", "list"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                view === v ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {v === "deck" ? t("viewDeck") : t("viewList")}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended next / first-run empty state */}
      {recommended &&
        (masteryById.size === 0 ? (
          <section className="mt-6 rounded-(--radius-card) border border-accent/40 bg-accent/5 p-5">
            <h2 className="font-medium text-ink">{t("emptyLibraryTitle")}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("emptyLibraryBody")}</p>
            <p className="lectern mt-2 text-lg text-ink">{recommended.scenario.title[lang]}</p>
            <Button variant="gold" className="mt-4" onClick={() => start(recommended.scenario)}>
              <Icon name="mic" size={17} />
              {t("startExercise")}
            </Button>
          </section>
        ) : (
          <section
            className="mt-6 rounded-(--radius-card) border border-accent/40 bg-accent/5 p-5"
            data-testid="recommended-next"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-muted">{t("recommendedNext")}</h2>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
                {t("recommendedBadge")}
              </span>
            </div>
            <h3 className="lectern mt-3 text-xl text-ink">{recommended.scenario.title[lang]}</h3>
            {recommended.weakest && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {t("recommendedReason", { dim: t(DIMENSION_LABEL[recommended.weakest]) })}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span>{SKILLS[recommended.scenario.category].trains[lang]}</span>
              <span className="flex items-center gap-1">
                <Icon name="clock" size={13} />
                {t("timeApprox", { n: estMinutes(recommended.scenario) })}
              </span>
              <span>{t(DIFFICULTY_LABEL[recommended.scenario.difficulty])}</span>
            </div>
            <Button variant="gold" className="mt-4 w-full sm:w-auto" onClick={() => start(recommended.scenario)}>
              <Icon name="mic" size={17} />
              {t("startExercise")}
            </Button>
          </section>
        ))}

      {/* Search + skill filter */}
      <div className="relative mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchScenarios")}
          aria-label={t("searchScenarios")}
          className="h-11 w-full rounded-(--radius-control) border border-line bg-surface px-4 text-base text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 lg:flex-wrap">
        <FilterPill active={filter === null} onClick={() => setFilter(null)}>
          {t("allCategories")}
        </FilterPill>
        {CATEGORIES.map((c) => (
          <FilterPill key={c.id} active={filter === c.id} onClick={() => setFilter(filter === c.id ? null : c.id)}>
            <Icon name={c.icon} size={15} />
            {c.label[lang]}
          </FilterPill>
        ))}
      </div>

      <button
        onClick={surprise}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-(--radius-control) border border-line py-3 text-base font-medium text-ink transition-colors hover:bg-surface"
      >
        <Icon name="dice" size={18} className="text-muted" />
        {t("surpriseMe")}
      </button>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">{t("noResults")}</p>
      ) : view === "deck" ? (
        <div className="mt-6 lg:mx-auto lg:max-w-md" data-testid="scenario-deck">
          <CardDeck
            key={`${filter ?? "all"}:${query}`}
            items={list}
            keyOf={(s) => s.id}
            renderCard={(s) => {
              const cat = catOf(s);
              const skill = SKILLS[s.category];
              const mastery = masteryById.get(s.id);
              return (
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Icon name={cat.icon} size={15} />
                    {cat.label[lang]}
                    <span className="ml-auto rounded-full border border-line px-2 py-0.5 font-medium">
                      {t(DIFFICULTY_LABEL[s.difficulty])}
                    </span>
                  </div>
                  <h3 className="lectern mt-4 text-2xl text-ink">{s.title[lang]}</h3>
                  <p className="lectern mt-3 text-base leading-relaxed text-ink/85 line-clamp-3">{s.prompt[lang]}</p>
                  <p className="mt-3 text-sm font-medium text-ink">{skill.trains[lang]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">{skill.why[lang]}</p>
                  <div className="mt-auto pt-3">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" size={13} />
                        {t("timeApprox", { n: estMinutes(s) })}
                      </span>
                      <span className="tnum">
                        {mastery !== undefined ? t("masteryPct", { n: mastery }) : t("notPracticed")}
                      </span>
                    </div>
                    <MasteryBar pct={mastery ?? 0} />
                  </div>
                </div>
              );
            }}
            renderAction={(s) => (
              <Button variant="gold" className="mt-4 w-full" onClick={() => start(s)}>
                <Icon name="mic" size={18} />
                {t("startExercise")}
              </Button>
            )}
          />
        </div>
      ) : (
        <div className="mt-6" data-testid="scenario-list">
          {(groups ?? [{ cat: null, items: list }]).map((g, gi) => (
            <section key={g.cat?.id ?? `flat-${gi}`}>
              {g.cat && (
                <h2 className="mt-6 mb-1 flex items-center gap-2 text-sm font-medium text-muted first:mt-0">
                  <Icon name={g.cat.icon} size={15} />
                  {g.cat.label[lang]}
                </h2>
              )}
              <ul className="flex flex-col">
                {g.items.map((s) => {
                  const mastery = masteryById.get(s.id);
                  return (
                    <li key={s.id} className="border-b hairline">
                      <button
                        onClick={() => start(s)}
                        className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-surface/50 -mx-2 px-2 rounded-lg"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block truncate font-medium text-ink">{s.title[lang]}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {SKILLS[s.category].trains[lang]}
                          </span>
                          <span className="mt-1 flex items-center gap-3 text-xs text-muted">
                            <span className="rounded-full border border-line px-2 py-px font-medium">
                              {t(DIFFICULTY_LABEL[s.difficulty])}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="clock" size={12} />
                              {t("timeApprox", { n: estMinutes(s) })}
                            </span>
                            <span className="tnum">
                              {mastery !== undefined ? t("masteryPct", { n: mastery }) : t("notPracticed")}
                            </span>
                          </span>
                          <span className="mt-2 block max-w-56">
                            <MasteryBar pct={mastery ?? 0} />
                          </span>
                        </span>
                        <Icon
                          name="arrowRight"
                          size={18}
                          className="shrink-0 text-faint transition-colors group-hover:text-ink"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Thin completion bar: neutral track, success-green fill (gold stays on CTAs). */
function MasteryBar({ pct }: { pct: number }) {
  return (
    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-2">
      <span className="block h-full rounded-full bg-ok" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </span>
  );
}

/** Card-shaped placeholders on the dark theme while IndexedDB loads history. */
function LibrarySkeleton({ title }: { title: string }) {
  return (
    <div className="pt-2 lg:pt-0" aria-busy="true">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <div className="mt-1 h-4 w-52 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 h-40 animate-pulse rounded-(--radius-card) bg-surface" />
      <div className="mt-6 h-11 animate-pulse rounded-(--radius-control) bg-surface" />
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-surface" />
        ))}
      </div>
      <div className="mt-6 lg:mx-auto lg:max-w-md">
        <div className="h-[420px] animate-pulse rounded-(--radius-card) border border-line bg-surface" />
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "border-line bg-surface-2 text-ink" : "border-transparent bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
