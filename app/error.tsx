"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

/** Erro inesperado numa página: mensagem discreta e opção de tentar de novo. */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-8 flex max-w-md flex-col items-start gap-3 p-6">
      <h1 className="text-lg font-semibold">Algo deu errado nesta página</h1>
      <p className="text-sm text-muted">
        Os dados podem estar indisponíveis no momento. As outras páginas continuam funcionando.
      </p>
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md border border-border-strong px-3 py-1.5 transition-colors hover:bg-surface-hover"
        >
          Tentar de novo
        </button>
        <Link href="/" className="px-3 py-1.5 text-accent hover:underline">
          Ir para a Visão Geral
        </Link>
      </div>
    </Card>
  );
}
