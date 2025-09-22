"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      const root = document.documentElement;
      const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
      if(primaryColor) {
        // HSL values are space-separated, we need to wrap them for CSS
        metaThemeColor.setAttribute("content", `hsl(${primaryColor})`);
      }
    }
  }, [resolvedTheme]);

  return null;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorUpdater />
      {children}
    </NextThemesProvider>
  );
}
