"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Shuffle, RotateCcw } from "lucide-react";
import { EXAM_LABEL, questionTopics, type Exam, type Question, type TopicId } from "@/config/questoes";
import { questions } from "@/data/questoes";
import { useQuizProgress } from "@/hooks/use-quiz-progress";
import { afterPractice, practiceQueue, recordAnswer } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { Explanation, Options, QuestionBody } from "@/components/study/question-parts";

const byId = new Map(questions.map((q) => [q.id, q]));
const topicLabel = Object.fromEntries(questionTopics.map((t) => [t.id, t.label])) as Record<TopicId, string>;
const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 py-2 text-sm transition-colors duration-150 hover:bg-surface-hover disabled:opacity-50";

type ExamFilter = "todas" | Exam;
type LevelFilter = "todos" | Question["level"];

const poolFor = (exam: ExamFilter, topics: TopicId[], level: LevelFilter) =>
  questions.filter(
    (q) =>
      (exam === "todas" || q.exam === exam) &&
      (topics.length === 0 || topics.includes(q.topic)) &&
      (level === "todos" || q.level === level),
  );

const noop = () => () => {};

export function QuizPractice() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  return <Practice />;
}

function Practice() {
  const { progress, update, loggedIn, syncNote } = useQuizProgress();
  const [exam, setExam] = useState<ExamFilter>("todas");
  const [topics, setTopics] = useState<TopicId[]>([]);
  const [level, setLevel] = useState<LevelFilter>("todos");
  const [queue, setQueue] = useState<string[]>(() => practiceQueue(questions, progress.answers));
  const [chosen, setChosen] = useState<number | null>(null);
  const [session, setSession] = useState({ hits: 0, total: 0 });

  const pool = useMemo(() => poolFor(exam, topics, level), [exam, topics, level]);
  const current = queue[0] ? byId.get(queue[0]) : undefined;
  const revealed = chosen !== null;

  const restart = (mixAll = false, e = exam, t = topics, l = level) => {
    setQueue(practiceQueue(poolFor(e, t, l), progress.answers, { mixAll }));
    setChosen(null);
    setSession({ hits: 0, total: 0 });
  };

  const choose = (i: number) => {
    if (!current || revealed) return;
    const correct = i === current.answer;
    setChosen(i);
    setSession((s) => ({ hits: s.hits + (correct ? 1 : 0), total: s.total + 1 }));
    update((p) => ({
      ...p,
      answers: { ...p.answers, [current.id]: recordAnswer(p.answers[current.id], correct, Date.now()) },
    }));
  };

  const next = () => {
    if (!current || chosen === null) return;
    setQueue((q) => afterPractice(q, chosen === current.answer));
    setChosen(null);
  };

  const visibleTopics = questionTopics.filter((t) => exam === "todas" || t.exam === exam);
  const stats = (list: Question[]) => {
    const done = list.filter((q) => progress.answers[q.id]);
    return { total: list.length, done: done.length, right: done.filter((q) => progress.answers[q.id].last).length };
  };
  const s = stats(pool);

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Filtros" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Prova"
            value={exam}
            onChange={(e) => {
              setExam(e);
              setTopics([]);
              restart(false, e, [], level);
            }}
            options={[
              { value: "todas", label: "Todas" },
              { value: "mercado", label: EXAM_LABEL.mercado },
              { value: "gmat", label: EXAM_LABEL.gmat },
            ]}
          />
          <Segmented
            label="Nível"
            value={level}
            onChange={(l) => {
              setLevel(l);
              restart(false, exam, topics, l);
            }}
            options={[
              { value: "todos", label: "Todos os níveis" },
              { value: "basico", label: "Básico" },
              { value: "avancado", label: "Avançado" },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visibleTopics.map((t) => {
            const on = topics.includes(t.id);
            const ts = stats(questions.filter((q) => q.topic === t.id));
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const nextTopics = on ? topics.filter((x) => x !== t.id) : [...topics, t.id];
                  setTopics(nextTopics);
                  restart(false, exam, nextTopics, level);
                }}
                title={`${ts.done} de ${ts.total} feitas; ${ts.right} certas na última tentativa`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs tabular-nums transition-colors",
                  on ? "border-accent bg-accent-soft font-medium text-accent" : "border-border-strong text-muted hover:text-text",
                )}
              >
                {t.label} <span className="opacity-70">{ts.right}/{ts.total}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => restart(true)} className={btn} title="Nova ordem aleatória (ignora o histórico)">
            <Shuffle aria-hidden className="size-4" /> Embaralhar
          </button>
          <button type="button" onClick={() => restart(false)} className={btn} title="Primeiro as que você errou">
            <RotateCcw aria-hidden className="size-4" /> Nova rodada
          </button>
          <span className="text-xs text-muted tabular-nums">
            {s.total} questões na seleção · {s.done} feitas · {s.right} certas na última tentativa
            {session.total > 0 && ` · nesta rodada: ${session.hits}/${session.total}`}
          </span>
        </div>
      </section>

      {current ? (
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              {EXAM_LABEL[current.exam]} · {topicLabel[current.topic]} · {current.level === "basico" ? "Básico" : "Avançado"}
              {progress.answers[current.id] &&
                ` · última vez: ${progress.answers[current.id].last ? "acertou" : "errou"}`}
            </span>
            <span className="tabular-nums">{queue.length} na fila</span>
          </div>
          <QuestionBody text={current.q} />
          <Options question={current} chosen={chosen} reveal={revealed} onChoose={choose} disabled={revealed} />
          {revealed && (
            <>
              <p className="text-sm font-medium">
                {chosen === current.answer ? "Você acertou." : "Você errou. Esta questão volta daqui a 5 questões."}
              </p>
              <Explanation question={current} />
              <button type="button" onClick={next} className={cn(btn, "self-start")}>
                Próxima questão
              </button>
            </>
          )}
        </Card>
      ) : (
        <Card className="flex flex-col items-start gap-3 p-6">
          <h2 className="text-base font-semibold">Rodada completa</h2>
          <p className="text-sm text-muted tabular-nums">
            Nesta rodada: {session.hits} acertos em {session.total} respostas.
          </p>
          <button type="button" onClick={() => restart(false)} className={btn}>
            <RotateCcw aria-hidden className="size-4" /> Nova rodada
          </button>
        </Card>
      )}

      <p className="text-xs text-muted">
        {loggedIn ? (syncNote ?? "Progresso sincronizado entre seus aparelhos.") : "Progresso salvo neste aparelho. Entre com a senha (no fim da seção Entrevistas) para sincronizar."}{" "}
        Questões escritas para este painel; as de GMAT seguem o formato da prova, sem copiar questões oficiais.
      </p>
    </div>
  );
}
