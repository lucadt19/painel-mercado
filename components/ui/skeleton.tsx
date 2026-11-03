import { cn } from "@/lib/utils";

/** Bloco cinza pulsando, usado enquanto os dados carregam. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded bg-surface-hover", className)} />;
}
