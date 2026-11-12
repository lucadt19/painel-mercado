import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { StudyTabs } from "@/components/study/question-parts";
import { QuizSimulado } from "@/components/study/quiz-simulado";

export const metadata: Metadata = { title: "Simulado" };

export default function SimuladoPage() {
  return (
    <>
      <PageHeader title="Estudos" description="Preparação para provas: simulados de 1 hora com cronômetro, nota por tema e revisão comentada." />
      <StudyTabs active="simulado" />
      <QuizSimulado />
    </>
  );
}
