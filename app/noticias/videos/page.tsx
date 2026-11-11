import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { NewsTabs } from "@/components/news/news-tabs";
import { VideosView } from "@/components/videos/videos-views";

export const metadata: Metadata = { title: "Podcasts & vídeos" };

export default function VideosPage() {
  return (
    <>
      <PageHeader title="Notícias" description="Podcasts e vídeos de finanças publicados nos canais que você acompanha." />
      <NewsTabs active="videos" />
      <VideosView />
    </>
  );
}
