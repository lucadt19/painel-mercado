"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatchlist } from "@/hooks/use-market-data";
import { emptyProgress, mergeQuiz, type QuizProgress } from "@/lib/quiz";

/**
 * Progresso das questões e dos simulados: fica no navegador e, com login
 * (senha da watchlist), é sincronizado entre aparelhos. Use só em
 * componentes montados no navegador (lê o localStorage na criação).
 */
const STORAGE_KEY = "painel:questoes:v1";

function loadLocal(): QuizProgress {
  try {
    const p = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as QuizProgress | null;
    return p && p.answers && Array.isArray(p.simulados) ? p : emptyProgress();
  } catch {
    return emptyProgress();
  }
}
function saveLocal(p: QuizProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Armazenamento bloqueado: fica só nesta sessão.
  }
}

export function useQuizProgress() {
  const watchlist = useWatchlist();
  const loggedIn = !!watchlist.data?.loggedIn;
  const canLogin = !!watchlist.data?.canEdit;
  const [progress, setProgress] = useState<QuizProgress>(loadLocal);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  // Com login: junta com o que está no banco.
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    fetch("/api/estudos/questoes", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok: boolean; progress?: QuizProgress }) => {
        if (cancelled || !j.ok || !j.progress) return;
        setProgress((cur) => {
          const merged = mergeQuiz(cur, j.progress!);
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

  // Envio ao banco com atraso (junta várias mudanças numa requisição).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const push = useCallback(
    (p: QuizProgress) => {
      if (!loggedIn) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        fetch("/api/estudos/questoes", { method: "PUT", body: JSON.stringify(p) }).catch(() => {});
      }, 2500);
    },
    [loggedIn],
  );

  /** Atualiza o progresso (salva no aparelho e, com login, no banco). */
  const update = useCallback(
    (fn: (p: QuizProgress) => QuizProgress) => {
      setProgress((cur) => {
        const next = fn(cur);
        saveLocal(next);
        push(next);
        return next;
      });
    },
    [push],
  );

  return { progress, update, loggedIn, canLogin, syncNote };
}
