import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthStateProvider } from "@/components/auth/AuthStateProvider";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sinea - A new streaming space for Visual Storytellers",
  description: "Nonton film favorit kapan saja, di mana saja. Sinea.id",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("antialiased", oswald.variable)} suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=sentient@200,300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthStateProvider>
            {children}
          </AuthStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

