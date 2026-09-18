"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";
const STORAGE_KEY = "cybermushroom-theme";
const THEME_EVENT = "cybermushroom-theme-change";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

export function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
    const sync = (event: Event) => setTheme((event as CustomEvent<Theme>).detail ?? readTheme());
    const storage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Chuy\u1ec3n sang giao di\u1ec7n s\u00e1ng" : "Chuy\u1ec3n sang giao di\u1ec7n t\u1ed1i";
  return (
    <button type="button" onClick={() => applyTheme(next)} aria-label={label} title={label}
      className={cn("flex min-h-11 min-w-11 items-center justify-center gap-3 border border-transparent font-mono text-[10px] font-bold uppercase tracking-wider text-text-dark transition-colors hover:border-primary-neon/25 hover:bg-primary-neon/[0.06] hover:text-primary-neon focus-visible:bio-focus motion-reduce:transition-none", className)}>
      {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4 shrink-0" /> : <Moon aria-hidden="true" className="h-4 w-4 shrink-0" />}
      {!compact && <span>{theme === "dark" ? "Ch\u1ebf \u0111\u1ed9 s\u00e1ng" : "Ch\u1ebf \u0111\u1ed9 t\u1ed1i"}</span>}
    </button>
  );
}
