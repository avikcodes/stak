"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui";

const storageKey = "stak-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="h-10 w-10 p-0"
    >
      <MoonStar className="h-4 w-4 dark:hidden" />
      <SunMedium className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
