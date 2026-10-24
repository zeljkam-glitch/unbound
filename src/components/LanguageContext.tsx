"use client";
import { createContext, useContext } from "react";

export type Locale = "hr" | "en";

const LanguageContext = createContext<{ locale: Locale }>({ locale: "hr" });

export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LanguageContext.Provider value={{ locale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
