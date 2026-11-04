"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Logo da empresa ao lado do ticker, do serviço de ícones da brapi
 * (icons.brapi.dev, o mesmo endereço que a API devolve em `logourl`).
 * Sem logo (404), mostra as duas primeiras letras do ticker.
 *
 * Decorativo (alt vazio): o ticker já aparece em texto ao lado.
 */
export function TickerLogo({
  symbol,
  size = 28,
  className,
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  // Guarda qual ticker falhou: se a linha passar a mostrar outro, tenta de novo.
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const failed = failedFor === symbol;
  const box = cn("shrink-0 overflow-hidden rounded-md", className);
  const style = { width: size, height: size };

  if (failed) {
    return (
      <span
        aria-hidden
        style={style}
        className={cn(box, "flex items-center justify-center bg-surface-hover text-[0.6rem] font-semibold text-muted")}
      >
        {symbol.replace(/[^A-Z0-9]/gi, "").slice(0, 2)}
      </span>
    );
  }

  return (
    // Fundo claro fixo: muitos logos são escuros com fundo transparente e
    // sumiriam no tema escuro. <img> simples: são SVGs pequenos de outro domínio.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://icons.brapi.dev/icons/${encodeURIComponent(symbol)}.svg`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedFor(symbol)}
      style={style}
      className={cn(box, "bg-logo-bg object-contain")}
    />
  );
}
