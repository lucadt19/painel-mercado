import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteName } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/nav-links";
import { themeInitScript } from "@/components/theme-toggle";
import { AutoRefreshProvider } from "@/components/auto-refresh-provider";
import { serverEnv } from "@/lib/server/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: siteName, template: `%s · ${siteName}` },
  description: "Painel pessoal de mercado: bolsa, renda fixa e notícias.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <AutoRefreshProvider delayMinutes={Math.round(serverEnv.quotesRefreshSeconds / 60)}>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 pt-8 pb-24 md:pb-12">{children}</main>
          <BottomNav />
        </AutoRefreshProvider>
      </body>
    </html>
  );
}
