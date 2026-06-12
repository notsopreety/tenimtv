import { fetchStreamData, findMatchDetails } from "@/app/utils/fetchData";
import StreamViewer from "./StreamViewer";
import { Tv } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MatchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const tenimtv = resolvedSearchParams.tenimtv;

  if (!tenimtv || typeof tenimtv !== "string") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-4xl mx-auto">
        <Tv className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Invalid Match Request</h1>
        <p className="text-zinc-500 text-sm mt-1">Please select a match from the Cricket or Football fixtures to stream.</p>
      </div>
    );
  }

  // Fetch both stream links and match metadata concurrently
  const [streamData, matchDetails] = await Promise.all([
    fetchStreamData(tenimtv).catch(() => ({ events: [] })),
    findMatchDetails(tenimtv).catch(() => null),
  ]);

  const hasEvents = streamData.events && streamData.events.length > 0;

  return (
    <div className="w-full">
      {!hasEvents && !matchDetails ? (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-4xl mx-auto">
          <Tv className="h-12 w-12 text-zinc-400 dark:text-zinc-650 mb-4" />
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Stream Offline</h1>
          <p className="text-zinc-500 text-sm mt-1">Failed to load stream. The match might be over or scheduling details have expired.</p>
        </div>
      ) : (
        <StreamViewer
          events={streamData.events || []}
          id={tenimtv}
          matchDetails={matchDetails}
        />
      )}
    </div>
  );
}
