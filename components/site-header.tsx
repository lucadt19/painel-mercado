import Link from "next/link";
import { siteName } from "@/config/site";
import { TopNav } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarketStatus } from "@/components/market-status";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto grid h-12 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="justify-self-start text-base font-semibold tracking-tight">
          {siteName}
        </Link>

        <TopNav />

        <div className="flex items-center gap-3 justify-self-end">
          <MarketStatus />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
