"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import { useMounted } from "@/hooks/use-mounted"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const mounted = useMounted()

  if (!mounted) {
    // Return a placeholder that matches the server-side render
    return <div suppressHydrationWarning>{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
