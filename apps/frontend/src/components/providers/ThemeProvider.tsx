"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: any) {
  const Provider = NextThemesProvider as any
  return <Provider {...props}>{children}</Provider>
}
