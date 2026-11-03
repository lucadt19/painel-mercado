import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { MacroSection } from "@/components/fixed-income/macro-section";
import { TreasurySection } from "@/components/fixed-income/treasury-section";

export const metadata: Metadata = { title: "Renda Fixa" };

function ReadingNote() {
  const items = [
    { title: "Tesouro Selic", text: "a taxa é um spread sobre a Selic: “Selic + 0,06%” rende a Selic do período mais 0,06% ao ano." },
    { title: "Prefixado", text: "a taxa é nominal: você sabe hoje quanto recebe no vencimento, sem correção pela inflação." },
    { title: "IPCA+", text: "a taxa é real: rende a inflação (IPCA) do período mais a taxa contratada." },
  ];
  return (
    <Card className="p-4">
      <h2 className="mb-2 text-sm font-medium">Como ler as taxas</h2>
      <ul className="flex flex-col gap-1.5 text-sm text-muted">
        {items.map((i) => (
          <li key={i.title}>
            <span className="font-medium text-text">{i.title}:</span> {i.text}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Taxa de compra é a que vale para quem investe; taxa de resgate, para quem vende antes do vencimento.
      </p>
    </Card>
  );
}

export default function RendaFixaPage() {
  return (
    <>
      <PageHeader title="Renda Fixa" />
      <div className="flex flex-col gap-10">
        <MacroSection />
        <ReadingNote />
        <TreasurySection />
      </div>
    </>
  );
}
