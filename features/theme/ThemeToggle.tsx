"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex size-9 items-center justify-center rounded-full border border-[#eef0f3] bg-white text-[#6f7784] transition hover:border-brand-red hover:text-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-brand-red dark:hover:text-white"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
