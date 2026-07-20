import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  CONTEXT_TAGS,
  EFFECT_TAGS,
  LIBRARY_CARDS,
  searchLibrary,
  tagLabel,
  type LibraryCard,
} from "@/data/library";
import { Icon } from "@/components/Icon";
import { FilterPill } from "@/components/FilterPill";

/**
 * The Library: a scrollable list of expandable technique cards, fed entirely
 * by the bundled JSON in data/library.json. Fully offline, nothing gated —
 * every card is readable from first launch.
 */
export function Library() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [contextTag, setContextTag] = useState<string | null>(null);
  const [effectTag, setEffectTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () => searchLibrary(query, contextTag, effectTag),
    [query, contextTag, effectTag],
  );

  return (
    <div className="pt-2 lg:pt-0">
      <section className="snap-section">
      <h1 className="text-2xl font-semibold text-ink">{t("tipsTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("tipsSub", { n: LIBRARY_CARDS.length })}</p>

      {/* Search — on-device, against the local JSON only */}
      <div className="relative mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchTips")}
          aria-label={t("searchTips")}
          className="box-control h-11 w-full px-4 text-base"
        />
      </div>

      {/* Filter chips: context + effect, straight from the data's tags */}
      <FilterRow
        label={t("tipsContextFilter")}
        tags={CONTEXT_TAGS}
        active={contextTag}
        onPick={(tag) => setContextTag(contextTag === tag ? null : tag)}
      />
      <FilterRow
        label={t("tipsEffectFilter")}
        tags={EFFECT_TAGS}
        active={effectTag}
        onPick={(tag) => setEffectTag(effectTag === tag ? null : tag)}
      />
      </section>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3" data-testid="library-list">
          {list.map((card) => (
            <TechniqueCard
              key={card.id}
              card={card}
              open={openId === card.id}
              onToggle={() => setOpenId(openId === card.id ? null : card.id)}
              sourceLabel={t("tipsSourceLabel")}
              caveatLabel={t("tipsCaveatLabel")}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  tags,
  active,
  onPick,
}: {
  label: string;
  tags: string[];
  active: string | null;
  onPick: (tag: string) => void;
}) {
  return (
    <div className="mt-3">
      <span className="label-caps">{label}</span>
      <div className="mt-1.5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 lg:flex-wrap">
        {tags.map((tag) => (
          <FilterPill key={tag} active={active === tag} onClick={() => onPick(tag)}>
            {tagLabel(tag)}
          </FilterPill>
        ))}
      </div>
    </div>
  );
}

function TechniqueCard({
  card,
  open,
  onToggle,
  sourceLabel,
  caveatLabel,
}: {
  card: LibraryCard;
  open: boolean;
  onToggle: () => void;
  sourceLabel: string;
  caveatLabel: string;
}) {
  const ref = useRef<HTMLLIElement>(null);

  // Opening a card snaps it flush to the top so its full text is on screen.
  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [open]);

  return (
    <li ref={ref} className="snap-section box">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full p-5 text-left transition-colors hover:bg-surface-2/40"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium text-ink">{card.title}</h3>
          <Icon
            name="chevronDown"
            size={16}
            className={`mt-1 shrink-0 text-faint transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </div>

        {open ? (
          <>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/85">{card.technique}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.context_tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
              {card.effect_tags.map((tag) => (
                <TagChip key={tag} tag={tag} effect />
              ))}
            </div>
            {card.caveat && (
              <p className="mt-3 text-xs leading-relaxed text-warn">
                {caveatLabel}: {card.caveat}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-faint">
              {sourceLabel}: {card.source}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 truncate text-sm text-muted">{card.technique}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {card.context_tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
              {card.effect_tags.map((tag) => (
                <TagChip key={tag} tag={tag} effect />
              ))}
            </div>
          </>
        )}
      </button>
    </li>
  );
}

/** Small tag pill: context tags in neutral, effect tags in dim gold. */
function TagChip({ tag, effect }: { tag: string; effect?: boolean }) {
  return (
    <span
      className={`rounded-full border border-line px-2 py-0.5 text-xs ${effect ? "text-accent-dim" : "text-muted"}`}
    >
      {tagLabel(tag)}
    </span>
  );
}
