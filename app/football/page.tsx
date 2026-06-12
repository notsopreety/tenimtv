import { fetchDetailedFootballMatches, FootballMatch } from "@/app/utils/fetchData";
import FootballMatchCard from "@/app/components/FootballMatchCard";
import { Calendar } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function FootballPage() {
  let matchesData: FootballMatch[] = [];
  let errorMsg = "";

  try {
    const data = await fetchDetailedFootballMatches();
    matchesData = data.matches || [];
  } catch (err) {
    console.error("Error loading football page data:", err);
    errorMsg = "Failed to load football matches. Please refresh the page.";
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Football Matches
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Live coverage and stream directories for global football matches.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      {matchesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
          <Calendar className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">No live football events scheduled</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Check back later for active match broadcasts.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          {matchesData.map((match, idx) => (
            <FootballMatchCard key={`football-match-${idx}`} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
