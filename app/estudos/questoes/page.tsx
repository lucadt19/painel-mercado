import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { StudyTabs } from "@/components/study/question-parts";
import { QuizPractice } from "@/components/study/quiz-practice";

export const metadata: Metadata = { title: "Questões" };

export default function QuestoesPage() {
  return (
    <>
      <PageHeader title="Estudos" description="Questões de múltipla escolha de mercado financeiro e GMAT, com gabarito comentado." />
      <StudyTabs active="questoes" />
      <QuizPractice />
    </>
  );
}
