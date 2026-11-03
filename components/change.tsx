import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Variação em %: cor + sinal + seta, para não depender só da cor.
 * Null vira "—".
 */
export function Change({ value, className }: { value: number | null; className?: string }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cn("text-muted tabular-nums", className)}>—</span>;
  }
  const rounded = Math.round(value * 100) / 100;
  const dir = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  return (
    <span
      className={cn(
        "whitespace-nowrap tabular-nums",
        dir === "up" && "text-up",
        dir === "down" && "text-down",
        dir === "flat" && "text-muted",
        className,
      )}
    >
      <span aria-hidden className="mr-0.5 text-[0.7em]">
        {dir === "up" ? "▲" : dir === "down" ? "▼" : "■"}
      </span>
      {formatPercent(value)}
    </span>
  );
}
