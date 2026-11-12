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
        description="Flashcards para entrevistas do mercado financeiro: pense na resposta, confira e marque como foi."
      />
      <StudyTabs active="flashcards" />
      <StudyView />
    </>
  );
}
