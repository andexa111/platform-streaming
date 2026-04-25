import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sinea — Platform Streaming Video",
  description: "Nonton film favorit kapan saja, di mana saja. Sinea.id",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("antialiased", oswald.variable)}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=sentient@200,300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-neutral-950 text-white">
        {children}
      </body>
    </html>
  );
}

