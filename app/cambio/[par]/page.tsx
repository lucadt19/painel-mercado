import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fxPairs } from "@/config/watchlist";
import { FxView } from "@/components/fx/fx-view";
import { Skeleton } from "@/components/ui/skeleton";

/** /cambio/usd-brl e /cambio/eur-brl, geradas na publicação. */
export function generateStaticParams() {
  return fxPairs.map((p) => ({ par: p.pair.toLowerCase() }));
}

const pairOf = (raw: string) => fxPairs.find((p) => p.pair === raw.toUpperCase());

export async function generateMetadata({ params }: PageProps<"/cambio/[par]">): Promise<Metadata> {
  return { title: pairOf((await params).par)?.label ?? "Câmbio" };
}

/** A moeda vem da URL, por isso o Suspense (a página abre na hora, com o esqueleto). */
async function FxLoader({ params }: { params: PageProps<"/cambio/[par]">["params"] }) {
  const pair = pairOf((await params).par);
  if (!pair) notFound();
  return <FxView pair={pair.pair} />;
}

function FxSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-14 w-56" />
      <Skeleton className="h-60 w-full md:h-80" />
    </div>
  );
}

export default function FxPage({ params }: PageProps<"/cambio/[par]">) {
  return (
    <Suspense fallback={<FxSkeleton />}>
      <FxLoader params={params} />
    </Suspense>
  );
}
