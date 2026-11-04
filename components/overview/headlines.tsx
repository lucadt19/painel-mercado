"use client";

import Link from "next/link";
import { useNews } from "@/hooks/use-market-data";
import { Card, SectionTitle } from "@/components/ui/card";
import { NewsList } from "@/components/news/news-list";

/** As 5 manchetes mais recentes, com link para a página Notícias. */
export function Headlines() {
  const { data, error } = useNews();

  return (
    <section aria-labelledby="manchetes-title">
      <SectionTitle
        aside={
          <Link href="/noticias" className="hover:text-accent">
            Ver todas
          </Link>
        }
      >
        <span id="manchetes-title">Manchetes</span>
      </SectionTitle>
      <Card className="overflow-hidden">
        {!data && error ? (
          <p className="p-4 text-sm text-muted">Dados indisponíveis no momento</p>
        ) : (
          <NewsList items={data?.items.slice(0, 5)} loading={!error} showTheme={false} withImages />
        )}
      </Card>
    </section>
  );
}
