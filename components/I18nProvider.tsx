"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { th } from "../locales/th";
import { en } from "../locales/en";

type Language = "th" | "en";
type Translations = typeof th;

interface I18nContextType {
  lang: Language;
  t: (key: keyof Translations) => string;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preference from local storage
    const saved = localStorage.getItem("lang") as Language;
    if (saved === "th" || saved === "en") {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: keyof Translations): string => {
    const dict = lang === "en" ? en : th;
    return dict[key] || key;
  };

  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}
