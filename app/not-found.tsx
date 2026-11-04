import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <Card className="mx-auto mt-8 flex max-w-md flex-col items-start gap-3 p-6">
      <h1 className="text-lg font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted">O endereço não existe ou mudou.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Ir para a Visão Geral
      </Link>
    </Card>
  );
}
