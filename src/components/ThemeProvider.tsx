"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="dark">{children}</div>;
  }

  return <>{children}</>;
}
