import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./types";
import { strings, type StringKey } from "./strings";

const LANG_KEY = "orato.lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx | null>(null);

function detectLang(): Lang {
  // localStorage THROWS (not returns null) where site data is blocked —
  // third-party-cookie blocking, some WebViews, strict privacy modes. This
  // runs during the provider's first render, above every route, so an
  // unguarded read blanks the whole app on launch.
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "de" || stored === "en") return stored;
  } catch {
    /* storage unavailable — fall through to the browser's language */
  }
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* can't persist the choice, but it still applies for this session */
    }
    setLangState(l);
  };

  const t: LangCtx["t"] = (key, vars) => {
    // A key missing at runtime (one indexed from a Record rather than a
    // literal) would otherwise throw and blank the screen. A visibly wrong
    // label is a far better failure than no app.
    let s: string = strings[key]?.[lang] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

/**
 * Wrap text in the quotation marks the active language actually uses.
 *
 * German sets „low-high“ where English sets “high-high”. The app quotes the
 * user's own sentences back to them — the "say it better" module is the
 * report's showpiece — so using English marks around German text is exactly
 * the translated-afterthought texture the product spec rules out.
 */
export function quoted(text: string, lang: Lang): string {
  return lang === "de" ? `„${text}“` : `“${text}”`;
}

export function useI18n(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n outside LanguageProvider");
  return ctx;
}
