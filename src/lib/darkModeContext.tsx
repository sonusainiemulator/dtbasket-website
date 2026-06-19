"use client";
import { createContext, useContext } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface DarkModeCtx { isDark: boolean; toggle: () => void; }

const DarkModeContext = createContext<DarkModeCtx>({ isDark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const dm = useDarkMode();
  return <DarkModeContext.Provider value={dm}>{children}</DarkModeContext.Provider>;
}

export const useDarkModeContext = () => useContext(DarkModeContext);
