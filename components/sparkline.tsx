import { cn } from "@/lib/utils";

/**
 * Mini-gráfico de linha, sem eixos. A cor segue a direção do período:
 * verde se terminou acima do início, vermelho se abaixo.
 */
export function Sparkline({
  values,
  className,
  width = 96,
  height = 28,
}: {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return <div aria-hidden className={className} style={{ width, height }} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2; // espaço para a linha não encostar na borda
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const color = last > first ? "text-up" : last < first ? "text-down" : "text-muted";

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={cn("overflow-visible", color, className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
