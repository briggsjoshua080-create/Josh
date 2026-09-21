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
import type { Lang } from "@/lib/types";

/**
 * The Library: a scrollable list of expandable technique cards, fed entirely
 * by the bundled JSON in data/library.json. Fully offline, nothing gated —
 * every card is readable from first launch.
 */
export function Library() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [contextTag, setContextTag] = useState<string | null>(null);
  const [effectTag, setEffectTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () => searchLibrary(query, contextTag, effectTag, lang),
    [query, contextTag, effectTag, lang],
  );

  // Typing into the search box silently rewrites the list below it. Announce
  // how many cards are left — but on a delay, because a region that fires on
  // every keystroke talks over the letters the user is still typing.
  const [countMessage, setCountMessage] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      setCountMessage(
        list.length === 0
          ? t("noResults")
          : list.length === 1
            ? t("resultCountOne")
            : t("resultCount", { n: list.length }),
      );
    }, 600);
    return () => clearTimeout(id);
    // `t` is re-created each render; the result count is the real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, lang]);

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
        lang={lang}
      />
      <FilterRow
        label={t("tipsEffectFilter")}
        tags={EFFECT_TAGS}
        active={effectTag}
        onPick={(tag) => setEffectTag(effectTag === tag ? null : tag)}
        lang={lang}
      />
      </section>

      <span role="status" aria-live="polite" className="sr-only">
        {countMessage}
      </span>

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
              lang={lang}
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
  lang,
}: {
  label: string;
  tags: string[];
  active: string | null;
  onPick: (tag: string) => void;
  lang: Lang;
}) {
  return (
    <div className="mt-3">
      <span className="label-caps">{label}</span>
      <div className="mt-1.5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 lg:flex-wrap">
        {tags.map((tag) => (
          <FilterPill key={tag} active={active === tag} onClick={() => onPick(tag)}>
            {tagLabel(tag, lang)}
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
  lang,
}: {
  card: LibraryCard;
  open: boolean;
  onToggle: () => void;
  sourceLabel: string;
  caveatLabel: string;
  lang: Lang;
}) {
  const ref = useRef<HTMLLIElement>(null);

  // Opening a card snaps it flush to the top so its full text is on screen.
  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [open]);

  const regionId = `technique-${card.id}`;

  /*
   * A disclosure, not a button wrapping a document.
   *
   * The whole card used to be one <button> containing <h3> and <p> elements.
   * That is an invalid content model (a button takes phrasing content only),
   * browsers recover from it inconsistently, and the heading disappeared from
   * the outline — on a screen that is a list of 29 headed cards, so a screen
   * reader user could not navigate the Library by heading at all. The button
   * also had no label of its own, so its accessible name was computed from
   * every descendant: title plus the full technique, every tag, the caveat and
   * the citation, re-announced on each focus.
   *
   * Now the trigger holds only the heading and the chevron, and the body is a
   * sibling region it points at with aria-controls.
   */
  return (
    <li ref={ref} className="snap-section box">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={regionId}
          className="flex w-full items-start justify-between gap-3 p-5 text-left text-base font-medium text-ink transition-colors hover:bg-surface-2/40"
        >
          {card.title[lang]}
          <Icon
            name="chevronDown"
            size={16}
            className={`mt-1 shrink-0 text-faint transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>

      <div id={regionId} className="px-5 pb-5">
        {open ? (
          <>
            <p className="text-sm leading-relaxed text-ink/85">{card.technique[lang]}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.context_tags.map((tag) => (
                <TagChip key={tag} tag={tag} lang={lang} />
              ))}
              {card.effect_tags.map((tag) => (
                <TagChip key={tag} tag={tag} effect lang={lang} />
              ))}
            </div>
            {card.caveat && (
              <p className="mt-3 text-xs leading-relaxed text-warn">
                {caveatLabel}: {card.caveat[lang]}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-faint">
              {sourceLabel}: {card.source}
            </p>
          </>
        ) : (
          <>
            <p className="truncate text-sm text-muted">{card.technique[lang]}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {card.context_tags.map((tag) => (
                <TagChip key={tag} tag={tag} lang={lang} />
              ))}
              {card.effect_tags.map((tag) => (
                <TagChip key={tag} tag={tag} effect lang={lang} />
              ))}
            </div>
          </>
        )}
      </div>
    </li>
  );
}

/** Small tag pill: context tags in neutral, effect tags in dim gold. */
function TagChip({ tag, effect, lang }: { tag: string; effect?: boolean; lang: Lang }) {
  return (
    <span
      className={`rounded-full border border-line px-2 py-0.5 text-xs ${effect ? "text-accent-dim" : "text-muted"}`}
    >
      {tagLabel(tag, lang)}
    </span>
  );
}
