"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSWRConfig } from "swr";
import { RotateCcw, Shuffle } from "lucide-react";
import { LEVEL_LABEL, studyAreas, type StudyAreaId, type StudyCard, type StudyLevel } from "@/config/estudos";
import { studyCards } from "@/data/estudos";
import { useWatchlist } from "@/hooks/use-market-data";
import {
  afterAnswer,
  buildQueue,
  mergeProgress,
  nextProgress,
  statsFor,
  type Grade,
  type Progress,
} from "@/lib/study";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { LoginForm } from "@/components/overview/watchlist-table";
import { Skeleton } from "@/components/ui/skeleton";

const STORAGE_KEY = "painel:estudos:v1";
const byId = new Map(studyCards.map((c) => [c.id, c]));
const areaLabel = Object.fromEntries(studyAreas.map((a) => [a.id, a.label])) as Record<StudyAreaId, string>;

function loadLocal(): Progress {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}
function saveLocal(p: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Armazenamento bloqueado: o progresso fica só nesta sessão.
  }
}

/** Resposta: linhas começando com "- " viram tópicos; o resto, parágrafos. */
function Answer({ text }: { text: string }) {
  const blocks: { kind: "p" | "ul"; lines: string[] }[] = [];
  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const bullet = line.startsWith("- ");
    const last = blocks.at(-1);
    if (bullet && last?.kind === "ul") last.lines.push(line.slice(2));
    else blocks.push({ kind: bullet ? "ul" : "p", lines: [bullet ? line.slice(2) : line] });
  }
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed">
      {blocks.map((b, i) =>
        b.kind === "ul" ? (
          <ul key={i} className="flex list-disc flex-col gap-1 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>{l}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.lines[0]}</p>
        ),
      )}
    </div>
  );
}

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 py-2 text-sm transition-colors duration-150 hover:bg-surface-hover disabled:opacity-50";

type LevelFilter = "todos" | StudyLevel;

const poolFor = (areas: StudyAreaId[], level: LevelFilter): StudyCard[] =>
  studyCards.filter((c) => (areas.length === 0 || areas.includes(c.area)) && (level === "todos" || c.level === level));

const noop = () => () => {};

/**
 * O progresso fica no navegador (localStorage), então o estudo só é montado
 * no navegador; no servidor aparece o esqueleto.
 */
export function StudyView() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  return <StudySession />;
}

function StudySession() {
  const watchlist = useWatchlist();
  const { mutate } = useSWRConfig();
  const loggedIn = !!watchlist.data?.loggedIn;
  const canLogin = !!watchlist.data?.canEdit;

  const [progress, setProgress] = useState<Progress>(loadLocal);
  const [areas, setAreas] = useState<StudyAreaId[]>([]); // vazio = todas (variadas)
  const [level, setLevel] = useState<LevelFilter>("todos");
  const [queue, setQueue] = useState<string[]>(() => buildQueue(studyCards, loadLocal()));
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ acertei: 0, parcial: 0, errei: 0 });
  const [showLogin, setShowLogin] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const pool = useMemo(() => poolFor(areas, level), [areas, level]);

  /** Nova rodada com o filtro dado (mixAll: ordem aleatória, ignorando o histórico). */
  const restart = (mixAll = false, nextAreas = areas, nextLevel = level) => {
    setQueue(buildQueue(poolFor(nextAreas, nextLevel), progress, { mixAll }));
    setRevealed(false);
    setSession({ acertei: 0, parcial: 0, errei: 0 });
  };
  const changeAreas = (next: StudyAreaId[]) => {
    setAreas(next);
    restart(false, next, level);
  };
  const changeLevel = (next: LevelFilter) => {
    setLevel(next);
    restart(false, areas, next);
  };

  // Com login: junta com o progresso salvo no banco (vale o mais recente por cartão).
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    fetch("/api/estudos/progresso", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok: boolean; progress?: Progress }) => {
        if (cancelled || !j.ok || !j.progress) return;
        setProgress((cur) => {
          const merged = mergeProgress(cur, j.progress!);
          saveLocal(merged);
          return merged;
        });
        setSyncNote("Progresso sincronizado entre seus aparelhos.");
      })
      .catch(() => setSyncNote("Não foi possível sincronizar agora; o progresso está salvo neste aparelho."));
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  // Envio ao banco com atraso (junta várias respostas numa requisição).
  const pending = useRef<Progress>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushRemote = useCallback(
    (delta: Progress) => {
      if (!loggedIn) return;
      Object.assign(pending.current, delta);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const body = pending.current;
        pending.current = {};
        fetch("/api/estudos/progresso", { method: "PUT", body: JSON.stringify(body) }).catch(() => {
          Object.assign(pending.current, body);
        });
      }, 2500);
    },
    [loggedIn],
  );

  const current = queue[0] ? byId.get(queue[0]) : undefined;

  const answer = useCallback(
    (grade: Grade) => {
      if (!current) return;
      const p = nextProgress(progress[current.id], grade, Date.now());
      const updated = { ...progress, [current.id]: p };
      setProgress(updated);
      saveLocal(updated);
      pushRemote({ [current.id]: p });
      setSession((s) => ({ ...s, [grade]: s[grade] + 1 }));
      setQueue((q) => afterAnswer(q, grade));
      setRevealed(false);
    },
    [current, progress, pushRemote],
  );

  // Atalhos: espaço mostra a resposta; 1 errei, 2 mais ou menos, 3 acertei.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (!current) return;
      if (e.key === " " && !revealed) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && e.key === "1") answer("errei");
      else if (revealed && e.key === "2") answer("parcial");
      else if (revealed && e.key === "3") answer("acertei");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, revealed, answer]);

  const total = statsFor(pool, progress);
  const toggleArea = (id: StudyAreaId) =>
    changeAreas(areas.includes(id) ? areas.filter((a) => a !== id) : [...areas, id]);

  return (
    <div className="flex flex-col gap-6">
      {/* Áreas */}
      <section aria-label="Áreas" className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => changeAreas([])}
            aria-pressed={areas.length === 0}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              areas.length === 0 ? "border-accent bg-accent-soft font-medium text-accent" : "border-border-strong text-muted hover:text-text",
            )}
          >
            Variadas (todas as áreas)
          </button>
          {studyAreas.map((a) => {
            const cards = studyCards.filter((c) => c.area === a.id);
            const s = statsFor(cards, progress);
            const on = areas.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleArea(a.id)}
                aria-pressed={on}
                title={`${a.label}: ${s.dominadas} acertadas, ${s.revisar} para revisar, ${s.novas} novas`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs tabular-nums transition-colors",
                  on ? "border-accent bg-accent-soft font-medium text-accent" : "border-border-strong text-muted hover:text-text",
                )}
              >
                {a.short} <span className="opacity-70">{s.dominadas}/{s.total}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Nível"
            value={level}
            onChange={changeLevel}
            options={[
              { value: "todos", label: "Todos os níveis" },
              { value: "basico", label: LEVEL_LABEL.basico },
              { value: "avancado", label: LEVEL_LABEL.avancado },
            ]}
          />
          <button type="button" onClick={() => restart(true)} className={btn} title="Sorteia uma nova ordem (ignora o histórico)">
            <Shuffle aria-hidden className="size-4" /> Embaralhar
          </button>
          <button type="button" onClick={() => restart(false)} className={btn} title="Nova rodada: primeiro as que você errou">
            <RotateCcw aria-hidden className="size-4" /> Nova rodada
          </button>
        </div>
        <p className="text-xs text-muted tabular-nums">
          {total.total} perguntas na seleção · {total.dominadas} acertadas · {total.revisar} para revisar · {total.novas} novas
        </p>
      </section>

      {/* Cartão */}
      {current ? (
        <Card className="flex min-h-72 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              {areaLabel[current.area]} · {LEVEL_LABEL[current.level]}
              {progress[current.id] && ` · última vez: ${{ errei: "errou", parcial: "mais ou menos", acertei: "acertou" }[progress[current.id].last]}`}
            </span>
            <span className="tabular-nums">{queue.length} na fila</span>
          </div>
          <h2 className="text-lg leading-snug font-semibold">{current.q}</h2>

          {!revealed ? (
            <button type="button" onClick={() => setRevealed(true)} className={cn(btn, "mt-auto self-start")}>
              Mostrar resposta <span className="text-xs text-muted">(espaço)</span>
            </button>
          ) : (
            <>
              <div className="rounded-md bg-surface-hover p-4">
                <Answer text={current.a} />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Como foi?</span>
                <button type="button" onClick={() => answer("errei")} className={btn}>
                  Errei <span className="text-xs text-muted">1</span>
                </button>
                <button type="button" onClick={() => answer("parcial")} className={btn}>
                  Mais ou menos <span className="text-xs text-muted">2</span>
                </button>
                <button type="button" onClick={() => answer("acertei")} className={btn}>
                  Acertei <span className="text-xs text-muted">3</span>
                </button>
              </div>
              <p className="text-xs text-muted">
                &quot;Errei&quot; volta daqui a 3 cartões; &quot;Mais ou menos&quot;, daqui a 8; &quot;Acertei&quot; sai desta rodada.
              </p>
            </>
          )}
        </Card>
      ) : (
        <Card className="flex flex-col items-start gap-3 p-6">
          <h2 className="text-base font-semibold">Rodada completa</h2>
          <p className="text-sm text-muted tabular-nums">
            Nesta rodada: {session.acertei} acertos, {session.parcial} mais ou menos, {session.errei} erros.
          </p>
          <button type="button" onClick={() => restart(false)} className={btn}>
            <RotateCcw aria-hidden className="size-4" /> Nova rodada
          </button>
        </Card>
      )}

      {/* Progresso salvo */}
      <div className="flex flex-col gap-2 text-xs text-muted">
        {loggedIn ? (
          <p>{syncNote ?? "Progresso salvo e sincronizado entre seus aparelhos."}</p>
        ) : (
          <p>
            Progresso salvo neste aparelho.{" "}
            {canLogin && !showLogin && (
              <button type="button" onClick={() => setShowLogin(true)} className="underline hover:text-text">
                Entrar para sincronizar com o celular
              </button>
            )}
          </p>
        )}
        {showLogin && !loggedIn && (
          <Card className="p-3">
            <LoginForm
              label="Sua senha do painel (a mesma da watchlist)"
              onCancel={() => setShowLogin(false)}
              onDone={async () => {
                await mutate("/api/watchlist");
                setShowLogin(false);
              }}
            />
          </Card>
        )}
        <p>
          Perguntas e respostas escritas para este painel, cobrindo os temas que caem em entrevistas (inclusive os do guia
          &quot;400 IB Questions&quot;, usado só como referência de temas). Revise com outras fontes.
        </p>
      </div>
    </div>
  );
}
