"use client";
import { useState, useEffect, useCallback } from "react";

const DM_KEY = "dtbasket-dark-mode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  /* Read persisted preference on mount and apply class */
  useEffect(() => {
    const enabled = localStorage.getItem(DM_KEY) === "true";
    setIsDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(DM_KEY, String(next));
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return { isDark, toggle };
}
