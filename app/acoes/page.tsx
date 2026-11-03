import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AcoesView } from "@/components/market/acoes-view";

export const metadata: Metadata = { title: "Ações & ETFs" };

export default function AcoesPage() {
  return (
    <>
      <PageHeader title="Ações & ETFs" />
      <AcoesView />
    </>
  );
}
