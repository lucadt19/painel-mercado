import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RfTabs } from "@/components/fixed-income/rf-tabs";
import { Comparator } from "@/components/fixed-income/comparator";

export const metadata: Metadata = { title: "Comparador de Renda Fixa" };

export default function ComparadorPage() {
  return (
    <>
      <PageHeader title="Renda Fixa" />
      <RfTabs active="comparador" />
      <Comparator />
    </>
  );
}
