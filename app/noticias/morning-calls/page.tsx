import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { NewsTabs } from "@/components/news/news-tabs";
import { MorningCallsView } from "@/components/videos/videos-views";

export const metadata: Metadata = { title: "Morning calls" };

export default function MorningCallsPage() {
  return (
    <>
      <PageHeader title="Notícias" description="Morning calls dos bancos, em vídeo, antes da abertura do pregão." />
      <NewsTabs active="morning" />
      <MorningCallsView />
    </>
  );
}
