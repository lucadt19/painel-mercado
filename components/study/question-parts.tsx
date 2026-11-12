"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { LETTERS, type Question } from "@/config/questoes";
import { cn } from "@/lib/utils";

/** Texto com **negrito**. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/**
 * Enunciado: parágrafos, linhas soltas e tabelas (linhas que começam com "|";
 * a primeira é o cabeçalho).
 */
export function QuestionBody({ text }: { text: string }) {
  const blocks: { kind: "p" | "table"; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const isRow = line.startsWith("|");
    const last = blocks.at(-1);
    if (!line) {
      blocks.push({ kind: "p", lines: [] });
    } else if (isRow) {
      if (last?.kind === "table") last.lines.push(line);
      else blocks.push({ kind: "table", lines: [line] });
    } else if (last?.kind === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  const cells = (row: string) =>
    row
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());

  return (
    <div className="flex flex-col gap-3 text-[0.95rem] leading-relaxed">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, i) =>
          b.kind === "table" ? (
            <div key={i} className="overflow-x-auto">
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-border-strong">
                    {cells(b.lines[0]).map((c, j) => (
                      <th key={j} className="px-2 py-1.5 text-left font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.lines.slice(1).map((row, r) => (
                    <tr key={r} className="border-b border-border">
                      {cells(row).map((c, j) => (
                        <td key={j} className="px-2 py-1.5">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p key={i}>
              {b.lines.map((l, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  <Inline text={l} />
                </span>
              ))}
            </p>
          ),
        )}
    </div>
  );
}

/**
 * Alternativas A–E. Antes de mostrar o gabarito, só marca a escolhida; depois,
 * destaca a certa (ícone e cor de destaque) e a escolhida errada (ícone X).
 */
export function Options({
  question,
  chosen,
  reveal,
  onChoose,
  disabled,
}: {
  question: Question;
  chosen: number | null;
  reveal: boolean;
  onChoose?: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Alternativas">
      {question.options.map((opt, i) => {
        const isAnswer = reveal && i === question.answer;
        const isWrongPick = reveal && chosen === i && i !== question.answer;
        const isChosen = chosen === i;
        return (
          <li key={i}>
            <button
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={disabled}
              onClick={() => onChoose?.(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors duration-150",
                isAnswer
                  ? "border-accent bg-accent-soft"
                  : isWrongPick
                    ? "border-border-strong bg-surface-hover"
                    : isChosen
                      ? "border-accent"
                      : "border-border hover:bg-surface-hover",
                disabled && !reveal && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isAnswer || (isChosen && !reveal) ? "border-accent text-accent" : "border-border-strong text-muted",
                )}
              >
                {isAnswer ? <Check aria-hidden className="size-3.5" /> : isWrongPick ? <X aria-hidden className="size-3.5" /> : LETTERS[i]}
              </span>
              <span className={cn("pt-0.5", isWrongPick && "text-muted line-through")}>{opt}</span>
              {isAnswer && <span className="sr-only">(resposta correta)</span>}
              {isWrongPick && <span className="sr-only">(sua resposta, incorreta)</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Gabarito comentado: a primeira linha diz a letra certa. */
export function Explanation({ question }: { question: Question }) {
  return (
    <div className="rounded-md bg-surface-hover p-4 text-sm leading-relaxed">
      <p className="mb-2 font-medium">Gabarito: {LETTERS[question.answer]}</p>
      {question.explanation.split("\n").map((l, i) => (
        <p key={i} className={cn(i > 0 && "mt-1.5")}>
          {l}
        </p>
      ))}
    </div>
  );
}

const SECTIONS = [
  { id: "entrevistas", label: "Entrevistas", href: "/estudos" },
  { id: "provas", label: "Provas (GMAT e mercado)", href: "/estudos/provas" },
] as const;

const EXAM_TABS = [
  { id: "questoes", label: "Questões", href: "/estudos/provas" },
  { id: "simulado", label: "Simulado (1 h)", href: "/estudos/provas/simulado" },
] as const;

function TabLinks<T extends { id: string; label: string; href: string }>({
  tabs,
  active,
  label,
  small,
}: {
  tabs: readonly T[];
  active: T["id"];
  label: string;
  small?: boolean;
}) {
  return (
    <nav aria-label={label} className={cn("flex gap-1 overflow-x-auto border-b border-border", small ? "mb-5" : "mb-4")}>
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={cn(
            "-mb-px shrink-0 border-b-2 px-3 transition-colors",
            small ? "py-1.5 text-xs" : "py-2 text-sm",
            active === t.id ? "border-accent font-medium text-text" : "border-transparent text-muted hover:text-text",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Navegação da página Estudos: duas seções separadas.
 * - Entrevistas: flashcards de perguntas de entrevista.
 * - Provas: questões de múltipla escolha e simulados (GMAT e mercado).
 */
export function StudyTabs({ active }: { active: "entrevistas" | (typeof EXAM_TABS)[number]["id"] }) {
  const section = active === "entrevistas" ? "entrevistas" : "provas";
  return (
    <>
      <TabLinks tabs={SECTIONS} active={section} label="Seções de Estudos" />
      {active !== "entrevistas" && <TabLinks tabs={EXAM_TABS} active={active} label="Provas" small />}
    </>
  );
}
