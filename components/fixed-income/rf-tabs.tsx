import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "mercado", label: "Mercado", href: "/renda-fixa" },
  { id: "comparador", label: "Comparador", href: "/renda-fixa/comparador" },
] as const;

/** Abas da Renda Fixa: cada uma é uma página (dá para salvar nos favoritos). */
export function RfTabs({ active }: { active: (typeof TABS)[number]["id"] }) {
  return (
    <nav aria-label="Seções da Renda Fixa" className="mb-8 flex gap-1 border-b border-border">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
            active === t.id ? "border-accent font-medium text-text" : "border-transparent text-muted hover:text-text",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
