import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type PointerEvent, type ReactNode, type TouchEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "./Icon";
import { HeaderStats } from "./HeaderStats";
import { useI18n } from "@/lib/i18n";
import { getHoldsUnsavedWork, subscribeUnsavedWork } from "@/lib/appUpdate";
import { ConfirmDialog } from "./ConfirmDialog";

const NAV = [
  { to: "/", icon: "stage", key: "navToday" as const },
  { to: "/scenarios", icon: "layers", key: "navScenarios" as const },
  { to: "/library", icon: "library", key: "navLibrary" as const },
  { to: "/progress", icon: "chart", key: "navProgress" as const },
];

/** Tab order for swipe navigation — matches the bottom bar left to right. */
const TAB_ORDER = ["/", "/scenarios", "/library", "/progress"];

/** What each route is called, for the navigation announcement. */
function routeNameKey(pathname: string) {
  if (pathname === "/") return "navToday" as const;
  if (pathname === "/scenarios") return "navScenarios" as const;
  if (pathname === "/library") return "navLibrary" as const;
  if (pathname === "/progress") return "navProgress" as const;
  if (pathname === "/settings") return "navSettings" as const;
  if (pathname === "/session") return "routeSession" as const;
  if (pathname.startsWith("/feedback")) return "routeFeedback" as const;
  return null;
}

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

  // While a take exists only in memory, every in-app link is a way to lose it
  // with one stray tap. The tab bar is hidden (it also frees room for the
  // recording controls) and any other link asks first.
  const recording = useSyncExternalStore(subscribeUnsavedWork, getHoldsUnsavedWork, () => false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  function guardLinks(e: MouseEvent<HTMLDivElement>) {
    if (!getHoldsUnsavedWork()) return;
    const link = (e.target as HTMLElement).closest("a[href]");
    if (!link || link.getAttribute("target") === "_blank") return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return;
    e.preventDefault();
    e.stopPropagation();
    setPendingHref(href);
  }

  useEffect(() => {
    const root = document.documentElement;
    // Library cards and the Feedback report (with its details open) run taller
    // than the screen; mandatory snapping there can yank the page back or skip
    // past content, notably in iOS Safari. Those get the gentle flavour.
    const soft = pathname === "/library" || pathname.startsWith("/feedback");
    if (isSnapRoute(pathname)) root.setAttribute("data-snap", soft ? "soft" : "");
    else root.removeAttribute("data-snap");
    return () => root.removeAttribute("data-snap");
  }, [pathname]);

  // A client-side route change moves nothing a screen reader can feel: the URL
  // changes, the DOM swaps, and the user is left reading the old page's tail.
  // Say where they are, and park the cursor at the top of the new screen so
  // the next Tab or swipe starts there rather than back in the tab bar.
  const [routeMessage, setRouteMessage] = useState("");
  const firstRoute = useRef<string | null>(null);
  useEffect(() => {
    // Keyed on the path rather than a boolean: StrictMode runs this effect
    // twice on mount, and a boolean flag let the second run treat the very
    // first screen as a navigation.
    if (firstRoute.current === null || firstRoute.current === pathname) {
      firstRoute.current = pathname;
      return; // the initial load already announces itself
    }
    firstRoute.current = "";
    const key = routeNameKey(pathname);
    setRouteMessage(key ? t("routeAnnouncement", { name: t(key) }) : "");
    // A new screen starts at its top. Without this the previous screen's scroll
    // offset carried over, and a plain focus() then scrolled <main> flush with
    // the viewport top — underneath the sticky mobile header, hiding the title.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
    // `t` changes identity every render; the pathname is what this reacts to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const navItems = () =>
    NAV.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        data-nav={item.to}
        className={({ isActive }) =>
          `relative flex items-center gap-3 rounded-(--radius-control) px-3 py-2 transition-colors duration-150 ` +
          `max-lg:min-w-0 max-lg:flex-1 max-lg:flex-col max-lg:gap-1 max-lg:px-2 max-lg:py-1.5 max-lg:text-xs lg:text-base ` +
          (isActive ? (item.to === "/progress" ? "text-patina-light" : "text-gold") : "text-muted hover:text-ink")
        }
      >
        {({ isActive }) => (
          <>
            <span
              className="transition-transform duration-150"
              style={{ transform: isActive ? "scale(1.06)" : "scale(1)" }}
            >
              <Icon name={item.icon} size={22} />
            </span>
            <span className="max-w-full truncate font-medium">{t(item.key)}</span>
          </>
        )}
      </NavLink>
    ));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[220px_1fr]" onClickCapture={guardLinks}>
      {/* Desktop rail */}
      <aside onPointerDown={(e) => glideMarkerOnPress(e, "rail")} className="hidden lg:flex flex-col gap-1 border-r hairline px-4 py-6 sticky top-0 h-dvh">
        <div className="mb-8 flex flex-col items-center gap-3 px-3">
          <Logo size={52} />
          <HeaderStats />
        </div>
        {navItems()}
        <NavMarker pathname={pathname} surface="rail" />
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
        {/* Mobile header — the logo centred, controls docked to the corners,
            streak and XP on a slim second row underneath. Sits outside <main>,
            so it is not part of the swipe container hierarchy. */}
        {/* Sticky: the streak it now carries used to be a fixed pin, and the
            snap scroller would otherwise park it off-screen on the first flick. */}
        <header
          className="lg:hidden sticky top-0 bg-bg/95 backdrop-blur-sm px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-2.5"
          style={{ zIndex: "var(--z-nav)" }}
        >
          {/* Three equal columns keep the mark optically centred no matter how
              wide the language toggle gets in German. */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="justify-self-start">
              <LangToggle lang={lang} setLang={setLang} label={t("languageToggle")} compact />
            </div>
            <Logo size={44} />
            <NavLink
              to="/settings"
              aria-label={t("navSettings")}
              className={({ isActive }) =>
                // 44px hit area around the 20px glyph; the negative margin keeps
                // the glyph exactly where it sat.
                `-mr-3 inline-flex h-11 w-11 items-center justify-center justify-self-end transition-colors duration-150 ${isActive ? "text-gold" : "text-muted hover:text-ink"}`
              }
            >
              <Icon name="gear" size={20} />
            </NavLink>
          </div>
          <div className="mt-2">
            <HeaderStats />
          </div>
        </header>

        {/* Navigation announcement. Outside <main> so replacing its contents
            can never take the live region down with it mid-announcement. */}
        <span role="status" aria-live="polite" className="sr-only">
          {routeMessage}
        </span>

        <main
          ref={mainRef}
          tabIndex={-1}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="mx-auto w-full max-w-md flex-1 px-5 pb-28 focus:outline-none lg:max-w-3xl lg:px-10 lg:py-10 lg:pb-10 overflow-x-clip"
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

        {/* Mobile tab bar — hidden while a take is being recorded */}
        {!recording && (
          <nav
            onPointerDown={(e) => glideMarkerOnPress(e, "tabs")}
            className="lg:hidden fixed inset-x-0 bottom-0 flex justify-around border-t hairline bg-bg/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] pt-1"
            style={{ zIndex: "var(--z-nav)" }}
          >
            {navItems()}
            <NavMarker pathname={pathname} surface="tabs" />
          </nav>
        )}
      </div>

      <ConfirmDialog
        open={pendingHref !== null}
        title={t("discardConfirmTitle")}
        confirmLabel={t("discardConfirmYes")}
        cancelLabel={t("discardConfirmCancel")}
        onCancel={() => setPendingHref(null)}
        onConfirm={() => {
          const to = pendingHref;
          setPendingHref(null);
          // Leaving unmounts the recorder, whose cleanup stops the microphone.
          if (to) navigate(to);
        }}
      >
        {t("discardConfirmBody")}
      </ConfirmDialog>
    </div>
  );
}

/**
 * "Where you are": one gold marker per navigation surface that slides to the
 * active tab.
 *
 * It used to be a Motion shared-layout animation (layoutId). That measures
 * positions in page coordinates, scroll included — but the tab bar is fixed
 * and the rail sticky, so after scrolling a screen the marker flew in from
 * far off-screen, and with the page transition running alongside it could
 * stall and then jump. Here the position is the active link's offset inside
 * its own bar, which scrolling never changes, animated with a plain CSS
 * transform (the global reduced-motion rule turns it into a jump).
 */
function NavMarker({ pathname, surface }: { pathname: string; surface: "rail" | "tabs" }) {
  // The bar is read through the marker's own parent rather than a ref passed
  // down: a child's layout effect runs before its parent's ref is attached, so
  // on first paint a passed-in ref was still null and the marker never showed.
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; on: boolean; glide: boolean }>({
    x: 0,
    y: 0,
    on: false,
    glide: false,
  });

  useLayoutEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;
    const place = (glide: boolean) => {
      const link = container.querySelector<HTMLElement>(`[data-nav="${CSS.escape(pathname)}"]`);
      if (!link) {
        setPos((p) => ({ ...p, on: false, glide: false }));
        return;
      }
      const { x, y } = markerOffset(link, surface);
      // Glide only from one tab to another: appearing (first paint, coming
      // back from Settings or a recording) snaps into place instead. An
      // unchanged position is left alone — ResizeObserver reports once as soon
      // as it starts observing, and replacing the state there switched the
      // transition off mid-glide, which made the marker jump.
      setPos((p) => (p.on && p.x === x && p.y === y ? p : { x, y, on: true, glide: glide && p.on }));
    };
    place(true);
    const ro = new ResizeObserver(() => place(false));
    ro.observe(container);
    return () => ro.disconnect();
  }, [pathname, surface]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-tab-marker=""
      className={
        "pointer-events-none absolute left-0 top-0 rounded-full " +
        (surface === "tabs" ? "h-[2px] " : "w-[3px] ") +
        (pathname === "/progress" ? "bg-patina" : "bg-accent")
      }
      style={{
        width: surface === "tabs" ? TAB_MARKER_W : undefined,
        height: surface === "rail" ? RAIL_MARKER_H : undefined,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        // Own compositor layer: the glide keeps running while the main thread
        // is busy rendering the incoming screen (Scenarios builds 248 cards),
        // instead of freezing and then jumping to the end.
        willChange: "transform",
        opacity: pos.on ? 1 : 0,
        transition: pos.glide ? MARKER_GLIDE : "opacity 180ms ease-out",
      }}
    />
  );
}

const TAB_MARKER_W = 32;
const RAIL_MARKER_H = 20;
const MARKER_GLIDE = "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 320ms ease-out, opacity 180ms ease-out";

/** Where the marker sits for `link`, in its bar's own coordinates (scroll-proof). */
function markerOffset(link: HTMLElement, surface: "rail" | "tabs") {
  return surface === "tabs"
    ? { x: link.offsetLeft + link.offsetWidth / 2 - TAB_MARKER_W / 2, y: link.offsetTop }
    : { x: link.offsetLeft, y: link.offsetTop + (link.offsetHeight - RAIL_MARKER_H) / 2 };
}

/**
 * Start the glide the moment a finger lands on a tab. Left to React, it began
 * only once the next screen had rendered, which on a heavy screen (Scenarios)
 * meant a visible pause before the marker moved. The render that follows
 * computes the same transform, so it doesn't restart the glide.
 */
function glideMarkerOnPress(e: PointerEvent<HTMLElement>, surface: "rail" | "tabs") {
  const link = (e.target as HTMLElement).closest<HTMLElement>("[data-nav]");
  const marker = e.currentTarget.querySelector<HTMLElement>("[data-tab-marker]");
  if (!link || !marker || marker.style.opacity === "0") return;
  const { x, y } = markerOffset(link, surface);
  marker.style.transition = MARKER_GLIDE;
  marker.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/**
 * The orator mark — the same artwork as the home-screen icon and the splash,
 * generated from public/icons/orato-logo-source.png.
 */
function Logo({ size }: { size: number }) {
  return (
    <Link to="/" aria-label="Orato" className="block shrink-0 leading-none">
      <img
        src="/icons/icon-192.png"
        alt="Orato"
        width={size}
        height={size}
        draggable={false}
        style={{ width: size, height: size }}
        className="select-none rounded-full border border-gold/50"
      />
    </Link>
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
      className="relative after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors duration-150"
      aria-label={label}
    >
      <Icon name="globe" size={16} />
      <span className="font-medium uppercase">{compact ? (lang === "en" ? "DE" : "EN") : label}</span>
    </button>
  );
}
