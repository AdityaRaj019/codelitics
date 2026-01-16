"use client";

import { useThemeStore } from "@/stores";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-300 border border-gray-200 dark:border-gray-700"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}
