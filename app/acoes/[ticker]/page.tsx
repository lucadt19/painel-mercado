import { Suspense } from "react";
import type { Metadata } from "next";
import { AssetSkeleton, AssetView } from "@/components/asset/asset-view";

const tickerOf = (raw: string) => decodeURIComponent(raw).toUpperCase();

export async function generateMetadata({ params }: PageProps<"/acoes/[ticker]">): Promise<Metadata> {
  return { title: tickerOf((await params).ticker) };
}

/** O ticker vem da URL (só conhecido na hora do acesso), por isso o Suspense. */
async function AssetLoader({ params }: { params: PageProps<"/acoes/[ticker]">["params"] }) {
  const { ticker } = await params;
  return <AssetView ticker={tickerOf(ticker)} />;
}

export default function AssetPage({ params }: PageProps<"/acoes/[ticker]">) {
  return (
    <Suspense fallback={<AssetSkeleton />}>
      <AssetLoader params={params} />
    </Suspense>
  );
}
