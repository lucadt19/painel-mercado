"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Flag, Timer } from "lucide-react";
import {
  EXAM_LABEL,
  LETTERS,
  questionTopics,
  SIMULADO_MINUTES,
  SIMULADO_SIZE,
  type Question,
  type TopicId,
} from "@/config/questoes";
import { questions } from "@/data/questoes";
import { useQuizProgress } from "@/hooks/use-quiz-progress";
import { buildSimulado, recordAnswer, score, type SimuladoKind, type SimuladoResult } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Explanation, Options, QuestionBody } from "@/components/study/question-parts";

const byId = new Map(questions.map((q) => [q.id, q]));
const topicLabel = Object.fromEntries(questionTopics.map((t) => [t.id, t.label])) as Record<TopicId, string>;
const KIND_LABEL: Record<SimuladoKind, string> = { mercado: EXAM_LABEL.mercado, gmat: EXAM_LABEL.gmat, misto: "Misto" };
const ACTIVE_KEY = "painel:simulado-ativo:v1";
const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 py-2 text-sm transition-colors duration-150 hover:bg-surface-hover disabled:opacity-50";
const primary =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-accent bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:opacity-90";

/** Simulado em andamento: salvo no aparelho, para sobreviver a recarregar a página. */
type Active = {
  id: string;
  kind: SimuladoKind;
  qids: string[];
  chosen: (number | null)[];
  flagged: boolean[];
  startedAt: number;
  endsAt: number;
  current: number;
};

function loadActive(): Active | null {
  try {
    const a = JSON.parse(window.localStorage.getItem(ACTIVE_KEY) ?? "null") as Active | null;
    return a && Array.isArray(a.qids) && a.qids.every((id) => byId.has(id)) ? a : null;
  } catch {
    return null;
  }
}
function saveActive(a: Active | null) {
  try {
    if (a) window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Sem armazenamento: o simulado só não sobrevive a recarregar a página.
  }
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(h > 0 ? 2 : 1, "0")}:${String(sec).padStart(2, "0")}`;
};
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const dateTime = (ms: number) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(ms);

const noop = () => () => {};

export function QuizSimulado() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return <Simulado />;
}

function Simulado() {
  const { progress, update } = useQuizProgress();
  const [active, setActiveState] = useState<Active | null>(loadActive);
  const [resultId, setResultId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);

  const setActive = (a: Active | null) => {
    setActiveState(a);
    saveActive(a);
  };

  const finish = (a: Active) => {
    const result: SimuladoResult = {
      id: a.id,
      kind: a.kind,
      startedAt: a.startedAt,
      finishedAt: Math.min(Date.now(), a.endsAt),
      limitMs: a.endsAt - a.startedAt,
      qids: a.qids,
      chosen: a.chosen,
      correct: score(a.qids, a.chosen, byId),
    };
    update((p) => {
      const answers = { ...p.answers };
      a.qids.forEach((id, i) => {
        const c = a.chosen[i];
        if (c !== null) answers[id] = recordAnswer(answers[id], c === byId.get(id)!.answer, result.finishedAt);
      });
      return { answers, simulados: [result, ...p.simulados.filter((s) => s.id !== result.id)] };
    });
    setActive(null);
    setConfirming(false);
    setResultId(result.id);
  };

  // Cronômetro: atualiza a cada segundo e entrega sozinho quando o tempo acaba.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= active.endsAt) finish(active);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish usa o estado atual de `active`
  }, [active]);

  const start = (kind: SimuladoKind) => {
    const qids = buildSimulado(kind, questions, progress.answers, SIMULADO_SIZE);
    const t = Date.now();
    setNow(t);
    setResultId(null);
    setActive({
      id: `sim-${t}`,
      kind,
      qids,
      chosen: qids.map(() => null),
      flagged: qids.map(() => false),
      startedAt: t,
      endsAt: t + SIMULADO_MINUTES * 60_000,
      current: 0,
    });
  };

  if (active) {
    return (
      <Running
        active={active}
        now={now}
        confirming={confirming}
        setConfirming={setConfirming}
        onChange={setActive}
        onFinish={() => finish(active)}
      />
    );
  }

  const result = resultId ? progress.simulados.find((s) => s.id === resultId) : undefined;
  if (result) return <Result result={result} onBack={() => setResultId(null)} onRestart={() => start(result.kind)} />;

  return <Start onStart={start} history={progress.simulados} onOpen={setResultId} />;
}

// ---------- Início ----------

function Start({
  onStart,
  history,
  onOpen,
}: {
  onStart: (k: SimuladoKind) => void;
  history: SimuladoResult[];
  onOpen: (id: string) => void;
}) {
  const options: { kind: SimuladoKind; desc: string }[] = [
    { kind: "mercado", desc: "Contabilidade, valuation, DCF, M&A, crédito, renda fixa, macro e atualidades." },
    { kind: "gmat", desc: "Quantitative, Data Insights, Critical Reasoning e Reading Comprehension (em inglês)." },
    { kind: "misto", desc: "Metade mercado financeiro, metade GMAT." },
  ];
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle aside={`${SIMULADO_SIZE} questões · ${SIMULADO_MINUTES} minutos`}>Novo simulado</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {options.map((o) => (
            <Card key={o.kind} className="flex flex-col gap-3 p-4">
              <h3 className="text-base font-semibold">{KIND_LABEL[o.kind]}</h3>
              <p className="flex-1 text-sm text-muted">{o.desc}</p>
              <button type="button" onClick={() => onStart(o.kind)} className={cn(primary, "self-start")}>
                <Timer aria-hidden className="size-4" /> Iniciar (1 h)
              </button>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          O cronômetro começa ao iniciar. Sem gabarito durante a prova; ao fim do tempo, ela é entregue sozinha. Se fechar
          ou recarregar a página, o simulado continua de onde parou (o tempo segue correndo). Prefere as questões que você
          ainda não fez.
        </p>
      </section>

      <section>
        <SectionTitle>Seus simulados</SectionTitle>
        {history.length === 0 ? (
          <Card className="p-4 text-sm text-muted">Nenhum simulado feito ainda.</Card>
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {history.slice(0, 20).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpen(s.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface-hover"
              >
                <span>
                  <span className="font-medium">{KIND_LABEL[s.kind]}</span>{" "}
                  <span className="text-xs text-muted">{dateTime(s.finishedAt)}</span>
                </span>
                <span className="tabular-nums">
                  {s.correct}/{s.qids.length} <span className="text-muted">({pct(s.correct, s.qids.length)}%)</span>
                </span>
              </button>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

// ---------- Prova em andamento ----------

function Running({
  active,
  now,
  confirming,
  setConfirming,
  onChange,
  onFinish,
}: {
  active: Active;
  now: number;
  confirming: boolean;
  setConfirming: (v: boolean) => void;
  onChange: (a: Active) => void;
  onFinish: () => void;
}) {
  const q = byId.get(active.qids[active.current])!;
  const left = active.endsAt - now;
  const answered = active.chosen.filter((c) => c !== null).length;
  const go = (i: number) => onChange({ ...active, current: Math.max(0, Math.min(active.qids.length - 1, i)) });

  return (
    <div className="flex flex-col gap-4">
      {/* Barra fixa com o tempo restante */}
      <div className="sticky top-12 z-30 -mx-4 flex items-center justify-between gap-3 border-b border-border bg-bg px-4 py-2">
        <span className="text-sm">
          Simulado {KIND_LABEL[active.kind]} · questão {active.current + 1} de {active.qids.length}
        </span>
        <span
          className={cn("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", left < 5 * 60_000 && "text-accent")}
          aria-live={left < 60_000 ? "polite" : "off"}
        >
          <Timer aria-hidden className="size-4" /> {mmss(left)}
        </span>
      </div>

      {/* Mapa das questões */}
      <div className="flex flex-wrap gap-1.5" aria-label="Questões">
        {active.qids.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => go(i)}
            aria-current={i === active.current ? "step" : undefined}
            aria-label={`Questão ${i + 1}${active.chosen[i] !== null ? ", respondida" : ""}${active.flagged[i] ? ", marcada para revisar" : ""}`}
            className={cn(
              "relative flex size-8 items-center justify-center rounded-md border text-xs tabular-nums transition-colors",
              i === active.current ? "border-accent font-semibold text-accent" : "border-border",
              active.chosen[i] !== null ? "bg-surface-hover" : "",
            )}
          >
            {i + 1}
            {active.flagged[i] && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-accent" aria-hidden />}
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <div className="text-xs text-muted">
          {EXAM_LABEL[q.exam]} · {topicLabel[q.topic]}
        </div>
        <QuestionBody text={q.q} />
        <Options
          question={q}
          chosen={active.chosen[active.current]}
          reveal={false}
          onChoose={(i) => {
            const chosen = [...active.chosen];
            chosen[active.current] = chosen[active.current] === i ? null : i;
            onChange({ ...active, chosen });
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => go(active.current - 1)} disabled={active.current === 0} className={btn}>
            <ArrowLeft aria-hidden className="size-4" /> Anterior
          </button>
          <button
            type="button"
            onClick={() => go(active.current + 1)}
            disabled={active.current === active.qids.length - 1}
            className={btn}
          >
            Próxima <ArrowRight aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const flagged = [...active.flagged];
              flagged[active.current] = !flagged[active.current];
              onChange({ ...active, flagged });
            }}
            aria-pressed={active.flagged[active.current]}
            className={cn(btn, active.flagged[active.current] && "border-accent text-accent")}
          >
            <Flag aria-hidden className="size-4" /> {active.flagged[active.current] ? "Marcada" : "Marcar para revisar"}
          </button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-muted tabular-nums">
          {answered} de {active.qids.length} respondidas
          {active.flagged.some(Boolean) && ` · ${active.flagged.filter(Boolean).length} marcadas para revisar`}
        </span>
        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm">
              {answered < active.qids.length
                ? `${active.qids.length - answered} em branco. Entregar mesmo assim?`
                : "Entregar o simulado?"}
            </span>
            <button type="button" onClick={onFinish} className={primary}>
              Entregar
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={btn}>
              Continuar a prova
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className={primary}>
            Entregar simulado
          </button>
        )}
      </Card>
    </div>
  );
}

// ---------- Resultado ----------

function Result({ result, onBack, onRestart }: { result: SimuladoResult; onBack: () => void; onRestart: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = result.qids.map((id, i) => ({ q: byId.get(id) as Question | undefined, chosen: result.chosen[i] }));
  const topicMap = new Map<TopicId, { hit: number; total: number }>();
  for (const { q, chosen } of items) {
    if (!q) continue;
    const cur = topicMap.get(q.topic) ?? { hit: 0, total: 0 };
    cur.total++;
    if (chosen === q.answer) cur.hit++;
    topicMap.set(q.topic, cur);
  }
  const byTopic = [...topicMap].sort((a, b) => a[1].hit / a[1].total - b[1].hit / b[1].total);
  const blank = result.chosen.filter((c) => c === null).length;
  const used = result.finishedAt - result.startedAt;

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-1 text-xs text-muted hover:text-accent">
        <ArrowLeft aria-hidden className="size-3.5" /> Simulados
      </button>

      <Card className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <p className="text-xs text-muted">
            Simulado {KIND_LABEL[result.kind]} · {dateTime(result.finishedAt)}
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {result.correct}/{result.qids.length}{" "}
            <span className="text-lg font-normal text-muted">({pct(result.correct, result.qids.length)}%)</span>
          </p>
          <p className="text-sm text-muted tabular-nums">
            Tempo usado: {mmss(used)} de {mmss(result.limitMs)}
            {blank > 0 && ` · ${blank} em branco`}
          </p>
        </div>
        <button type="button" onClick={onRestart} className={primary}>
          <Timer aria-hidden className="size-4" /> Novo simulado {KIND_LABEL[result.kind]}
        </button>
      </Card>

      <section>
        <SectionTitle aside="do pior para o melhor">Por tema</SectionTitle>
        <Card className="divide-y divide-border overflow-hidden">
          {byTopic.map(([topic, s]) => (
            <div key={topic} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="flex-1">{topicLabel[topic]}</span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-hover" aria-hidden>
                <span className="block h-full bg-accent" style={{ width: `${pct(s.hit, s.total)}%` }} />
              </span>
              <span className="w-16 text-right tabular-nums">
                {s.hit}/{s.total}
              </span>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionTitle aside="toque numa questão para ver o gabarito comentado">Revisão</SectionTitle>
        <Card className="divide-y divide-border overflow-hidden">
          {items.map(({ q, chosen }, i) =>
            q ? (
              <div key={q.id}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-hover"
                >
                  <span className="w-6 text-xs text-muted tabular-nums">{i + 1}</span>
                  <span className="w-24 shrink-0 text-xs">
                    {chosen === null ? "em branco" : chosen === q.answer ? "acertou" : `errou (${LETTERS[chosen]})`}
                  </span>
                  <span className="line-clamp-1 flex-1 text-muted">{q.q.replace(/\s+/g, " ").slice(0, 140)}</span>
                </button>
                {open === i && (
                  <div className="flex flex-col gap-3 px-4 pb-4">
                    <QuestionBody text={q.q} />
                    <Options question={q} chosen={chosen} reveal disabled />
                    <Explanation question={q} />
                  </div>
                )}
              </div>
            ) : null,
          )}
        </Card>
      </section>
    </div>
  );
}
