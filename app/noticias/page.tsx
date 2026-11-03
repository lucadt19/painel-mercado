import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Notícias" };

export default function NoticiasPage() {
  return (
    <PageHeader
      title="Notícias"
      description="Manchetes de veículos de economia e negócios, com link para a matéria original."
    />
  );
}
