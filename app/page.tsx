import { fetchCricketData, fetchFootballData, ApiResponse } from "@/app/utils/fetchData";
import MatchCard from "@/app/components/MatchCard";
import { Trophy, Calendar } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  let cricketData: ApiResponse = { title: "All Events", matches: [] };
  let footballData: ApiResponse = { title: "All Football Events", matches: [] };
  let errorMsg = "";

  try {
    const [cricket, football] = await Promise.all([
      fetchCricketData(),
      fetchFootballData(),
    ]);
    cricketData = cricket;
    footballData = football;
  } catch (err) {
    console.error("Error loading homepage data:", err);
    errorMsg = "Failed to load live matches. Please refresh the page.";
  }

  return (
    <div className="space-y-12">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Cricket Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {cricketData.title}
              </h2>
              <p className="text-sm text-zinc-500">Live Cricket Events & Streams</p>
            </div>
          </div>
        </div>

        {cricketData.matches.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center bg-zinc-900/10 rounded-xl border border-dashed border-white/5">
            No live cricket matches found.
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            {cricketData.matches.map((match, idx) => (
              <MatchCard key={`cricket-${idx}`} match={match} sportType="cricket" />
            ))}
          </div>
        )}
      </section>

      {/* Football Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {footballData.title}
              </h2>
              <p className="text-sm text-zinc-500">Live Football Matches & Tournaments</p>
            </div>
          </div>
        </div>

        {footballData.matches.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center bg-zinc-900/10 rounded-xl border border-dashed border-white/5">
            No live football matches found.
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            {footballData.matches.map((match, idx) => (
              <MatchCard key={`football-${idx}`} match={match} sportType="football" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
