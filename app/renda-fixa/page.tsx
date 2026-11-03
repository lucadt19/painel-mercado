import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Renda Fixa" };

export default function RendaFixaPage() {
  return (
    <PageHeader
      title="Renda Fixa"
      description="Selic, CDI, IPCA, Tesouro Direto e curva de juros."
    />
  );
}
