import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme/theme-context";
import type { Theme } from "@/components/theme/theme-context";

export type ResolvedTheme = "dark" | "light";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return getSystemTheme();
};

export function useResolvedTheme(): ResolvedTheme {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    () => resolveTheme(theme)
  );

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (event: MediaQueryListEvent) => {
        setResolvedTheme(event.matches ? "dark" : "light");
      };

      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    setResolvedTheme(resolveTheme(theme));
    return undefined;
  }, [theme]);

  return resolvedTheme;
}

