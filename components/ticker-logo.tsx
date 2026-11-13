"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Logo da empresa ao lado do ticker, do serviço de ícones da brapi
 * (icons.brapi.dev, o mesmo endereço que a API devolve em `logourl`).
 *
 * As iniciais do ticker aparecem desde o início e o logo surge por cima
 * quando termina de carregar: nunca fica um quadrado vazio (em conexão lenta
 * ou se o ticker não tiver logo, 404).
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
  // Guarda para qual ticker o logo carregou ou falhou: se a linha passar a
  // mostrar outro ticker, começa de novo.
  const [state, setState] = useState<{ symbol: string; status: "ok" | "erro" } | null>(null);
  const status = state?.symbol === symbol ? state.status : "carregando";

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-hover text-[0.6rem] font-semibold text-muted",
        className,
      )}
    >
      {symbol.replace(/[^A-Z0-9]/gi, "").slice(0, 2)}
      {status !== "erro" && (
        // Fundo claro fixo: muitos logos são escuros com fundo transparente e
        // sumiriam no tema escuro. <img> simples: SVGs pequenos de outro domínio.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://icons.brapi.dev/icons/${encodeURIComponent(symbol)}.svg`}
          alt=""
          width={size}
          height={size}
          decoding="async"
          onLoad={() => setState({ symbol, status: "ok" })}
          onError={() => setState({ symbol, status: "erro" })}
          className={cn(
            "absolute inset-0 size-full bg-logo-bg object-contain transition-opacity duration-150",
            status === "ok" ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </span>
  );
}
