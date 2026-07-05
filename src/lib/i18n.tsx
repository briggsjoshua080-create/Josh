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
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "de" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  };

  const t: LangCtx["t"] = (key, vars) => {
    let s: string = strings[key][lang];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n outside LanguageProvider");
  return ctx;
}
