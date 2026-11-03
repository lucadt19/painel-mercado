import Link from "next/link";
import { siteName } from "@/config/site";
import { TopNav } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto grid h-12 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="justify-self-start text-base font-semibold tracking-tight">
          {siteName}
        </Link>

        <TopNav />

        <div className="flex items-center gap-3 justify-self-end">
          {/* Status do pregão: entra na etapa 2 (calendário da B3). */}
          <span
            className="flex items-center gap-2 text-xs text-muted"
            title="Status do pregão disponível a partir da etapa 2"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-muted" />
            Pregão —
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
