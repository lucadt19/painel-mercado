import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "noticias", label: "Notícias", href: "/noticias" },
  { id: "morning", label: "Morning calls", href: "/noticias/morning-calls" },
  { id: "videos", label: "Podcasts & vídeos", href: "/noticias/videos" },
] as const;

/** Abas da página Notícias: cada uma é uma página (dá para salvar nos favoritos). */
export function NewsTabs({ active }: { active: (typeof TABS)[number]["id"] }) {
  return (
    <nav aria-label="Seções de Notícias" className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={cn(
            "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
            active === t.id ? "border-accent font-medium text-text" : "border-transparent text-muted hover:text-text",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
