import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card padrão: borda de 1px, cantos de 8px, sem sombra. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-card border border-border bg-surface", className)} {...props} />
  );
}

/** Título de seção: pequeno, peso médio, com espaço à direita para um link ou nota. */
export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-sm font-medium">{children}</h2>
      {aside && <div className="text-xs text-muted">{aside}</div>}
    </div>
  );
}
