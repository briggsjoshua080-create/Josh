import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { to: "/", icon: "stage", key: "navToday" as const },
  { to: "/scenarios", icon: "layers", key: "navScenarios" as const },
  { to: "/library", icon: "library", key: "navLibrary" as const },
  { to: "/progress", icon: "chart", key: "navProgress" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();

  const navItems = NAV.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-(--radius-control) px-3 py-2 transition-colors duration-150 ` +
        `max-lg:flex-col max-lg:gap-1 max-lg:px-5 max-lg:py-1.5 max-lg:text-xs lg:text-base ` +
        (isActive ? "text-accent" : "text-muted hover:text-ink")
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
              (isActive ? "text-accent" : "text-muted hover:text-ink")
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
                `transition-colors duration-150 ${isActive ? "text-accent" : "text-muted hover:text-ink"}`
              }
            >
              <Icon name="gear" size={20} />
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md flex-1 px-5 pb-28 lg:max-w-3xl lg:px-10 lg:py-10 lg:pb-10">
          {children}
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

function Wordmark() {
  return (
    <span className="lectern text-xl font-semibold tracking-tight text-ink">
      Orato<span className="text-accent">.</span>
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
