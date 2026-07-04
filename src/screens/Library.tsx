import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { SCENARIOS } from "@/data/scenarios";
import { CATEGORIES } from "@/data/categories";
import { Icon } from "@/components/Icon";
import type { CategoryId } from "@/lib/types";

export function Library() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CategoryId | null>(null);

  const list = useMemo(
    () => (filter ? SCENARIOS.filter((s) => s.category === filter) : SCENARIOS),
    [filter],
  );

  function surprise() {
    const pick = list[Math.floor(Math.random() * list.length)];
    if (pick) navigate(`/session?kind=scenario&id=${pick.id}`);
  }

  return (
    <div className="pt-2 lg:pt-0">
      <h1 className="text-2xl font-semibold text-ink">{t("libraryTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("librarySub", { n: SCENARIOS.length })}</p>

      {/* Category filter */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 lg:flex-wrap">
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
        <Icon name="dice" size={18} className="text-accent" />
        {t("surpriseMe")}
      </button>

      {/* Scenario list */}
      <ul className="mt-6 flex flex-col">
        {list.map((s) => {
          const cat = CATEGORIES.find((c) => c.id === s.category)!;
          return (
            <li key={s.id} className="border-b hairline">
              <button
                onClick={() => navigate(`/session?kind=scenario&id=${s.id}`)}
                className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-surface/50 -mx-2 px-2 rounded-lg"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent-dim">
                  <Icon name={cat.icon} size={19} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-ink">{s.title[lang]}</span>
                  <span className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                    {cat.label[lang]}
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-1 w-1 rounded-full ${i < s.difficulty ? "bg-accent-dim" : "bg-surface-2"}`}
                        />
                      ))}
                    </span>
                  </span>
                </span>
                <Icon name="arrowRight" size={18} className="shrink-0 text-faint transition-colors group-hover:text-accent" />
              </button>
            </li>
          );
        })}
      </ul>
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
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "bg-accent text-accent-ink" : "bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
