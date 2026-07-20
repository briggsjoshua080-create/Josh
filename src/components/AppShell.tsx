import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "./Icon";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { to: "/", icon: "stage", key: "navToday" as const },
  { to: "/scenarios", icon: "layers", key: "navScenarios" as const },
  { to: "/library", icon: "library", key: "navLibrary" as const },
  { to: "/progress", icon: "chart", key: "navProgress" as const },
];

/** Tab order for swipe navigation — matches the bottom bar left to right. */
const TAB_ORDER = ["/", "/scenarios", "/library", "/progress"];

/** A horizontal swipe must travel this far and stay flatter than 1:1.4. */
const SWIPE_MIN_PX = 56;
const SWIPE_AXIS_RATIO = 1.4;

/** Screens whose root scroller snaps per section (see html[data-snap] in theme.css). */
function isSnapRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/library" ||
    pathname === "/progress" ||
    pathname.startsWith("/feedback")
  );
}

/**
 * True when the touch began inside something that scrolls horizontally itself
 * (filter-pill rows, carousels) — those keep their native gesture and never
 * page between tabs.
 */
function insideHorizontalScroller(start: EventTarget | null, stop: HTMLElement): boolean {
  let node: Element | null = start instanceof Element ? start : null;
  for (; node && node !== stop; node = node.parentElement) {
    if (node.scrollWidth > node.clientWidth + 1) {
      const { overflowX } = getComputedStyle(node);
      if (overflowX === "auto" || overflowX === "scroll") return true;
    }
  }
  return false;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Direction of the current screen change: +1 slides in from the right
  // (moving to a later tab), -1 from the left, 0 for non-tab navigations.
  // Computed during render so the incoming screen animates on its first frame;
  // the ref keeps the result stable across StrictMode's double render.
  const histRef = useRef<{ path: string; dir: number }>({ path: pathname, dir: 0 });
  if (histRef.current.path !== pathname) {
    const from = TAB_ORDER.indexOf(histRef.current.path);
    const to = TAB_ORDER.indexOf(pathname);
    histRef.current = { path: pathname, dir: from !== -1 && to !== -1 ? Math.sign(to - from) : 0 };
  }
  const slideDir = histRef.current.dir;

  useEffect(() => {
    const root = document.documentElement;
    if (isSnapRoute(pathname)) root.setAttribute("data-snap", "");
    else root.removeAttribute("data-snap");
    return () => root.removeAttribute("data-snap");
  }, [pathname]);

  function onTouchStart(e: TouchEvent<HTMLElement>) {
    touchRef.current = null;
    if (e.touches.length !== 1) return;
    if (!TAB_ORDER.includes(pathname)) return;
    if (mainRef.current && insideHorizontalScroller(e.target, mainRef.current)) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * SWIPE_AXIS_RATIO) return;
    const i = TAB_ORDER.indexOf(pathname);
    const next = i + (dx < 0 ? 1 : -1); // swipe left → next tab
    if (next < 0 || next >= TAB_ORDER.length) return;
    navigate(TAB_ORDER[next]);
  }

  const navItems = NAV.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-(--radius-control) px-3 py-2 transition-colors duration-150 ` +
        `max-lg:flex-col max-lg:gap-1 max-lg:px-5 max-lg:py-1.5 max-lg:text-xs lg:text-base ` +
        (isActive ? "text-gold" : "text-muted hover:text-ink")
      }
    >
      <Icon name={item.icon} size={22} />
      <span className="font-medium">{t(item.key)}</span>
    </NavLink>
  ));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[220px_1fr]">
      {/* Desktop rail */}
      <aside className="hidden lg:flex flex-col gap-1 border-r hairline px-4 py-6 sticky top-0 h-dvh">
        <div className="mb-8 px-3">
          <Wordmark />
        </div>
        {navItems}
        <div className="mt-auto flex flex-col gap-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-(--radius-control) px-3 py-2 text-base transition-colors duration-150 ` +
              (isActive ? "text-gold" : "text-muted hover:text-ink")
            }
          >
            <Icon name="gear" size={22} />
            <span className="font-medium">{t("navSettings")}</span>
          </NavLink>
          <div className="px-3">
            <LangToggle lang={lang} setLang={setLang} label={t("languageToggle")} />
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
          <Wordmark />
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} label={t("languageToggle")} compact />
            <NavLink
              to="/settings"
              aria-label={t("navSettings")}
              className={({ isActive }) =>
                `transition-colors duration-150 ${isActive ? "text-gold" : "text-muted hover:text-ink"}`
              }
            >
              <Icon name="gear" size={20} />
            </NavLink>
          </div>
        </header>

        <main
          ref={mainRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="mx-auto w-full max-w-md flex-1 px-5 pb-28 lg:max-w-3xl lg:px-10 lg:py-10 lg:pb-10 overflow-x-clip"
        >
          {/* Screens slide in horizontally, matching the swipe direction */}
          <motion.div
            key={pathname}
            initial={slideDir !== 0 ? { x: slideDir * 72, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile tab bar */}
        <nav
          className="lg:hidden fixed inset-x-0 bottom-0 flex justify-around border-t hairline bg-bg/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] pt-1"
          style={{ zIndex: "var(--z-nav)" }}
        >
          {navItems}
        </nav>
      </div>
    </div>
  );
}

/** The orator mark — the same artwork as the home-screen icon and splash. */
function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/orato-icon.svg"
        alt=""
        width={30}
        height={30}
        draggable={false}
        className="h-[30px] w-[30px] shrink-0 select-none rounded-full border border-gold/50"
      />
      <span className="lectern text-xl font-semibold tracking-tight text-ink">
        Orato<span className="text-gold">.</span>
      </span>
    </span>
  );
}

function LangToggle({
  lang,
  setLang,
  label,
  compact,
}: {
  lang: "en" | "de";
  setLang: (l: "en" | "de") => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "de" : "en")}
      className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors duration-150"
      aria-label={label}
    >
      <Icon name="globe" size={16} />
      <span className="font-medium uppercase">{compact ? (lang === "en" ? "DE" : "EN") : label}</span>
    </button>
  );
}
