"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { SWRConfig } from "swr";
import { getMarketStatus, shouldPollQuotes, type MarketStatus } from "@/lib/market-hours";

type AutoRefreshState = {
  /** null até o componente montar no navegador (o servidor não sabe a hora do usuário). */
  market: MarketStatus | null;
  tabVisible: boolean;
  /** Cotações devem ser atualizadas agora (aba visível + pregão aberto ou recém-fechado). */
  pollQuotes: boolean;
  delayMinutes: number;
};

const AutoRefreshContext = createContext<AutoRefreshState | null>(null);

// --- Aba visível? ---
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}
const getVisible = () => document.visibilityState === "visible";
const getVisibleServer = () => true;

// --- Relógio que avança a cada 30 s (para recalcular o status do pregão) ---
const TICK_MS = 30_000;
function subscribeClock(cb: () => void) {
  const id = setInterval(cb, TICK_MS);
  return () => clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getTickServer = () => null;

export function AutoRefreshProvider({
  delayMinutes,
  children,
}: {
  delayMinutes: number;
  children: ReactNode;
}) {
  const tabVisible = useSyncExternalStore(subscribeVisibility, getVisible, getVisibleServer);
  const tick = useSyncExternalStore(subscribeClock, getTick, getTickServer);

  const value = useMemo<AutoRefreshState>(() => {
    const market = tick === null ? null : getMarketStatus(new Date(tick * TICK_MS));
    const pollQuotes = tabVisible && market !== null && shouldPollQuotes(market, delayMinutes);
    return { market, tabVisible, pollQuotes, delayMinutes };
  }, [tick, tabVisible, delayMinutes]);

  return (
    <AutoRefreshContext.Provider value={value}>
      <SWRConfig
        value={{
          // Pausa com a aba em segundo plano e atualiza na hora ao voltar.
          refreshWhenHidden: false,
          revalidateOnFocus: true,
          // Mantém o último dado bom na tela se uma atualização falhar.
          keepPreviousData: true,
          errorRetryCount: 3,
          onError: (err, key) => console.warn(`[atualização] falha em ${key}:`, err),
        }}
      >
        {children}
      </SWRConfig>
    </AutoRefreshContext.Provider>
  );
}

export function useAutoRefresh(): AutoRefreshState {
  const ctx = useContext(AutoRefreshContext);
  if (!ctx) throw new Error("useAutoRefresh precisa estar dentro de <AutoRefreshProvider>.");
  return ctx;
}
