import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { StudyView } from "@/components/study/study-view";
import { StudyTabs } from "@/components/study/question-parts";

export const metadata: Metadata = { title: "Estudos" };

export default function EstudosPage() {
  return (
    <>
      <PageHeader
        title="Estudos"
        description="Preparação para entrevistas: flashcards de perguntas técnicas e comportamentais. Pense na resposta, confira e marque como foi."
      />
      <StudyTabs active="entrevistas" />
      <StudyView />
    </>
  );
}
