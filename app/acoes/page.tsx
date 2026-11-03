import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Ações & ETFs" };

export default function AcoesPage() {
  return (
    <PageHeader
      title="Ações & ETFs"
      description="Busca de ativos, detalhes, indicadores e ETFs acompanhados."
    />
  );
}
