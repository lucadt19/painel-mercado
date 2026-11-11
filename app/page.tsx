import { IndexStrip } from "@/components/overview/index-strip";
import { WatchlistTable } from "@/components/overview/watchlist-table";
import { FixedIncomeCards } from "@/components/overview/fixed-income-cards";
import { Headlines } from "@/components/overview/headlines";
import { StatusFooter } from "@/components/overview/status-footer";
import { MorningCallsCard } from "@/components/videos/videos-views";

export default function VisaoGeralPage() {
  return (
    <>
      <h1 className="sr-only">Visão Geral</h1>
      <IndexStrip />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WatchlistTable />
        </div>
        <div className="flex flex-col gap-8">
          <FixedIncomeCards />
          <MorningCallsCard />
          <Headlines />
        </div>
      </div>
      <StatusFooter />
    </>
  );
}
