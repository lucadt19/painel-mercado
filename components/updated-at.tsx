import { formatUpdatedAt } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Quando o dado foi atualizado na fonte. Se o item falhou nesta rodada e
 * estamos mostrando o valor anterior, avisa ("último dado de ...").
 */
export function UpdatedAt({
  iso,
  prefix,
  staleError,
  className,
}: {
  iso: string;
  prefix?: string;
  staleError?: string;
  className?: string;
}) {
  const time = formatUpdatedAt(iso);
  return (
    <time
      dateTime={iso}
      title={staleError ? `Falha na última atualização: ${staleError}` : undefined}
      className={cn("text-xs text-muted tabular-nums", staleError && "text-down", className)}
    >
      {staleError ? `último dado de ${time}` : prefix ? `${prefix} ${time}` : time}
    </time>
  );
}
