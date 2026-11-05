"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { Pencil, X } from "lucide-react";
import { shortNames } from "@/config/watchlist";
import { useQuotes, useWatchlist } from "@/hooks/use-market-data";
import type { WatchlistResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { AssetSearch } from "@/components/market/asset-search";
import { periodLabelFor, QuoteTable } from "@/components/market/quote-table";

const btn =
  "inline-flex items-center gap-1 rounded-md border border-border-strong px-2 py-1 text-xs text-text transition-colors duration-150 hover:bg-surface-hover";

async function sendJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `Erro ${res.status}`);
  return json;
}

function LoginForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await sendJson("/api/watchlist/login", "POST", { password });
          setPassword("");
          onDone();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="min-w-48 flex-1">
        <label htmlFor="watchlist-senha" className="mb-1 block text-xs text-muted">
          Senha para editar a watchlist
        </label>
        <input
          id="watchlist-senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:border-accent"
        />
      </div>
      <button type="submit" disabled={busy || !password} className={`${btn} py-2 disabled:opacity-50`}>
        {busy ? "Entrando…" : "Entrar"}
      </button>
      <button type="button" onClick={onCancel} className="px-2 py-2 text-xs text-muted hover:text-text">
        Cancelar
      </button>
      {error && (
        <p role="alert" className="w-full text-xs text-down">
          {error}
        </p>
      )}
    </form>
  );
}

function Editor({ list, onDone }: { list: WatchlistResponse; onDone: () => void }) {
  const { mutate } = useSWRConfig();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const full = list.symbols.length >= list.max;

  const save = async (symbols: string[]) => {
    setSaving(true);
    setError(null);
    const previous = list;
    // Mostra a mudança na hora; volta atrás se o servidor recusar.
    await mutate("/api/watchlist", { ...list, symbols, source: "banco" }, { revalidate: false });
    try {
      await sendJson("/api/watchlist", "PUT", { symbols });
      // As cotações dos ativos novos chegam quando o servidor renova o cache.
      mutate("/api/quotes");
      setTimeout(() => mutate("/api/quotes"), 15_000);
    } catch (err) {
      await mutate("/api/watchlist", previous, { revalidate: false });
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {list.symbols.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface py-0.5 pl-2 pr-1 text-xs">
            <span className="font-medium">{s}</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(list.symbols.filter((x) => x !== s))}
              aria-label={`Tirar ${s} da watchlist`}
              className="rounded p-0.5 text-muted hover:bg-surface-hover hover:text-text disabled:opacity-50"
            >
              <X aria-hidden className="size-3" />
            </button>
          </span>
        ))}
      </div>
      {full ? (
        <p className="text-xs text-muted">
          A watchlist está cheia ({list.max} ativos, limite da cota da brapi). Tire um ativo para adicionar outro.
        </p>
      ) : (
        <AssetSearch
          onlyB3
          placeholder="Adicionar ativo: ticker ou nome (ex.: Sabesp, BOVA11)"
          onSelect={(item) => {
            if (!list.symbols.includes(item.symbol)) save([...list.symbols, item.symbol]);
          }}
        />
      )}
      {error && (
        <p role="alert" className="text-xs text-down">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>
          {list.symbols.length} de {list.max} ativos · salvo para todos os seus aparelhos
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              await sendJson("/api/watchlist/logout", "POST").catch(() => {});
              await mutate("/api/watchlist");
              onDone();
            }}
            className="hover:text-text"
          >
            Sair deste aparelho
          </button>
          <button type="button" onClick={onDone} className={btn}>
            Concluir
          </button>
        </span>
      </div>
    </div>
  );
}

export function WatchlistTable() {
  const { data, error } = useQuotes();
  const watchlist = useWatchlist();
  const { mutate } = useSWRConfig();
  const [mode, setMode] = useState<"view" | "login" | "edit">("view");
  const periodLabel = periodLabelFor(data?.historyRange);

  const list = watchlist.data;
  // Ordem: a lista salva; enquanto ela carrega, a das cotações.
  const symbols = list?.symbols ?? data?.watchlist.map((i) => i.symbol) ?? [];
  const quoted = new Set(data?.watchlist.map((i) => i.symbol));
  const pending = symbols.filter((s) => !quoted.has(s));

  const editButton = list?.canEdit && mode === "view" && (
    <button type="button" onClick={() => setMode(list.loggedIn ? "edit" : "login")} className={btn}>
      <Pencil aria-hidden className="size-3" /> Editar
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <QuoteTable
        title="Minha watchlist"
        aside={
          <span className="flex items-center gap-3">
            {data && <span>Variação no período: {periodLabel}</span>}
            {editButton}
          </span>
        }
        symbols={symbols}
        items={data?.watchlist}
        names={shortNames}
        periodLabel={periodLabel}
        loading={!data && !error}
        failed={!data && !!error}
        pending={pending}
      />
      {mode !== "view" && list && (
        <Card className="p-3">
          {mode === "login" ? (
            <LoginForm
              onCancel={() => setMode("view")}
              onDone={async () => {
                await mutate("/api/watchlist");
                setMode("edit");
              }}
            />
          ) : (
            <Editor list={list} onDone={() => setMode("view")} />
          )}
        </Card>
      )}
    </div>
  );
}
