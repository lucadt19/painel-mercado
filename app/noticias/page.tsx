import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { NewsView } from "@/components/news/news-view";
import { NewsTabs } from "@/components/news/news-tabs";

export const metadata: Metadata = { title: "Notícias" };

export default function NoticiasPage() {
  return (
    <>
      <PageHeader title="Notícias" description="Manchetes de economia e negócios, com link para a matéria original." />
      <NewsTabs active="noticias" />
      <NewsView />
    </>
  );
}
