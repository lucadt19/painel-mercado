"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
  /** Explicação (ex.: por que está desativado). */
  title?: string;
};

/**
 * Seletor de uma opção entre poucas (período, tema, tipo de ativo).
 *
 * Acessível pelo padrão "radio group": Tab entra no grupo pela opção
 * escolhida, as setas trocam a opção, Home/End vão para a primeira/última.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  /** Nome do grupo para leitores de tela (ex.: "Período do gráfico"). */
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex rounded-md border border-border-strong p-0.5", className)}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={o.disabled}
            title={o.title}
            // Só a opção escolhida entra na ordem do Tab; as setas cuidam do resto.
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "rounded px-2.5 py-1 text-xs tabular-nums transition-colors",
              checked ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-text",
              o.disabled && "cursor-not-allowed opacity-40 hover:text-muted",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
