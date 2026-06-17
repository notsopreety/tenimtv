"use client";

import { useState } from "react";
import { StreamEvent, FootballMatch, Server2Stream } from "@/app/utils/fetchData";
import { Tv, User, ShieldAlert, Award, AlignJustify } from "lucide-react";
import dynamic from "next/dynamic";

const StreamPlayer = dynamic(() => import("../components/StreamPlayer"), { ssr: false });

interface StreamViewerProps {
  events: StreamEvent[];
  server2Streams: Server2Stream[];
  id: string;
  matchDetails: FootballMatch | null;
}

interface StreamSource {
  name: string;
  url: string;
}

export default function StreamViewer({ events, server2Streams, id, matchDetails }: StreamViewerProps) {
  const [activeServer, setActiveServer] = useState<1 | 2>(server2Streams && server2Streams.length > 0 ? 2 : 1);
  const [activeInsightTab, setActiveInsightTab] = useState<"event-info" | "h2h" | "lineups" | "pregame">("event-info");
  const [team1Error, setTeam1Error] = useState(false);
  const [team2Error, setTeam2Error] = useState(false);

  const [activeServer2Index, setActiveServer2Index] = useState(0);

  const getChannelId = (url: string) => {
    let channelId: string | null = null;
    try {
      const parsedUrl = new URL(url);
      channelId = parsedUrl.searchParams.get("id");
    } catch {
      const match = url.match(/[?&]id=([^&]+)/);
      if (match) {
        channelId = match[1];
      }
    }
    return channelId;
  };

  const isAd = (url: string) => {
    const l = url.toLowerCase();
    return l.includes("/api/ads") || l.includes("yosintv-api.pages.dev");
  };

  const streamSources: StreamSource[] = [];
  events.forEach((event) => {
    if (event.link && event.link.includes("t.me")) return;
    if (event.link && !isAd(event.link)) {
      streamSources.push({ name: event.name.trim(), url: event.link.trim() });
    }
    if (event.links && event.links.length > 0) {
      event.links.forEach((link, idx) => {
        if (!isAd(link)) {
          streamSources.push({
            name: `${event.name.trim()} - Server ${idx + 1}`,
            url: link.trim(),
          });
        }
      });
    }
  });

  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  const getCleanLink = (url: string) => {
    try {
      if (url.includes("?url=")) {
        const parts = url.split("?url=");
        if (parts.length > 1) {
          return decodeURIComponent(parts[1]);
        }
      } else if (url.includes("&url=")) {
        const parts = url.split("&url=");
        if (parts.length > 1) {
          return decodeURIComponent(parts[1]);
        }
      }
    } catch {}
    return url;
  };

  const currentStream = streamSources[activeSourceIndex];
  const currentStreamUrl = currentStream ? getCleanLink(currentStream.url) : "";

  const getCleanServerName = (name: string) => {
    let clean = name.trim();
    if (matchDetails) {
      const t1 = matchDetails.team1.toLowerCase();
      const t2 = matchDetails.team2.toLowerCase();
      const teamRegex = new RegExp(`\\s*-\\s*(?:${t1}\\s*vs\\s*${t2}|${t2}\\s*vs\\s*${t1})`, "gi");
      clean = clean.replace(teamRegex, "");
    }
    clean = clean.replace(/\s*-\s*[A-Z]{2,4}\s*vs\s*[A-Z]{2,4}/gi, "");
    return clean;
  };

  const getFallbackLogo = (teamName: string) => {
    const initial = teamName ? teamName.charAt(0).toUpperCase() : "?";
    return `https://placehold.co/64x64/d1d5db/374151?text=${initial}`;
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const getStatus = (startStr: string, durationHours: number) => {
    try {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      if (now < start) {
        return "UPCOMING";
      } else if (now > end) {
        return "END";
      } else {
        return "LIVE";
      }
    } catch {
      return "END";
    }
  };

  // Helper to compute countdown time
  const getStartsIn = (startStr: string, durationHours: number = 2) => {
    try {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      if (now > end) {
        return "Ended";
      }
      const diffMs = start.getTime() - now.getTime();
      if (diffMs <= 0) {
        return "Started / Live Now";
      }
      const diffMins = Math.floor(diffMs / 1000 / 60);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    } catch {
      return "N/A";
    }
  };

  const displayTitle = matchDetails
    ? `${matchDetails.team1} vs ${matchDetails.team2}`
    : currentStream
    ? getCleanServerName(currentStream.name)
    : "Live Match Stream";

  const footballData = matchDetails?.football_data;
  const eventInfo = footballData?.event;
  const h2h = footballData?.h2h;
  const lineups = footballData?.lineups;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Match Header Face-off Card */}
      {matchDetails ? (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#1e2530] p-6 text-center shadow-xs">
          <div className="flex items-center justify-between w-full">
            {/* Team 1 */}
            <div className="flex items-center justify-end gap-4 w-[42%] text-right">
              <span className="font-black text-base sm:text-2xl text-zinc-800 dark:text-zinc-100 line-clamp-1 tracking-tight">
                {matchDetails.team1}
              </span>
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a1f26] border border-zinc-200 dark:border-zinc-800 p-1.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team1Error ? getFallbackLogo(matchDetails.team1) : matchDetails.team1_logo}
                  alt={matchDetails.team1}
                  loading="lazy"
                  className="h-full w-full object-contain rounded-full"
                  onError={() => setTeam1Error(true)}
                />
              </div>
            </div>

            {/* Time / Status */}
            <div className="flex flex-col items-center justify-center gap-1.5 w-[16%] text-center shrink-0">
              <span className="text-xs sm:text-sm font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {formatTime(matchDetails.start)}
              </span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-4 py-0.5 text-[10px] font-black tracking-widest ${
                  getStatus(matchDetails.start, matchDetails.duration || 2) === "LIVE"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : getStatus(matchDetails.start, matchDetails.duration || 2) === "UPCOMING"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-350 border border-zinc-300 dark:border-zinc-700/50"
                }`}
              >
                {getStatus(matchDetails.start, matchDetails.duration || 2)}
              </span>
              {getStatus(matchDetails.start, matchDetails.duration || 2) === "UPCOMING" && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 whitespace-nowrap">
                  Starts in: {getStartsIn(matchDetails.start, matchDetails.duration || 2)}
                </span>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-start gap-4 w-[42%] text-left">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a1f26] border border-zinc-200 dark:border-zinc-800 p-1.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team2Error ? getFallbackLogo(matchDetails.team2) : matchDetails.team2_logo}
                  alt={matchDetails.team2}
                  loading="lazy"
                  className="h-full w-full object-contain rounded-full"
                  onError={() => setTeam2Error(true)}
                />
              </div>
              <span className="font-black text-base sm:text-2xl text-zinc-800 dark:text-zinc-100 line-clamp-1 tracking-tight">
                {matchDetails.team2}
              </span>
            </div>
          </div>

          {/* League Bar */}
          <div className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-50/50 dark:bg-[#2a374a] py-1 px-4 border border-blue-100/30 dark:border-blue-900/10">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              {matchDetails.league}
            </span>
          </div>
        </div>
      ) : (
        /* Fallback Title Header */
        <div className="border-b border-zinc-200 dark:border-white/5 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {displayTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 uppercase tracking-wider font-semibold text-emerald-655 dark:text-emerald-400">
            Source ID: {id}
          </p>
        </div>
      )}

      {/* Server selector tabs */}
      {server2Streams && server2Streams.length > 0 && streamSources.length > 0 && (
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 pb-px">
          <button
            onClick={() => {
              setActiveServer(1);
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeServer === 1
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Streaming Server 1
          </button>
          <button
            onClick={() => {
              setActiveServer(2);
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeServer === 2
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Streaming Server 2
          </button>
        </div>
      )}

      {/* 2. Video Player & Servers List */}
      <div className="space-y-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-md">
        {activeServer === 1 ? (
          streamSources.length > 0 ? (
            <div className="space-y-6">
              {/* Direct iframe container for Server 1 streams to use their own framed player UI */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <iframe
                  src={currentStreamUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>

              {/* Servers Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="h-4 w-4" /> Select Streaming Server 1 Channel
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {streamSources.map((source, index) => (
                    <button
                      key={`source-${index}`}
                      onClick={() => setActiveSourceIndex(index)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer ${
                        activeSourceIndex === index
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {getCleanServerName(source.name)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
              <Tv className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-zinc-655 dark:text-zinc-400 font-medium">No active streaming server 1 link found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Please try again later or verify another event link.</p>
            </div>
          )
        ) : (
          server2Streams.length > 0 ? (
            <div className="space-y-6">
              <StreamPlayer
                channelName={server2Streams[activeServer2Index].name}
                url={server2Streams[activeServer2Index].url}
                id={getChannelId(server2Streams[activeServer2Index].url)}
              />

              {/* Servers Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="h-4 w-4" /> Select Streaming Server 2 Channel
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {server2Streams.map((source, index) => (
                    <button
                      key={`source2-${index}`}
                      onClick={() => {
                        setActiveServer2Index(index);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer ${
                        activeServer2Index === index
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {source.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
              <Tv className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-zinc-650 dark:text-zinc-400 font-medium">No active streaming server 2 link found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Please select another server source or check back later.</p>
            </div>
          )
        )}
      </div>

      {/* 3. Match Insights Tab Section */}
      <div className="space-y-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 backdrop-blur-md">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Match Insights
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Explore detailed statistics, formations, rosters, and pregame ratings.</p>
        </div>

        {/* Insight Sub-Tabs Selector */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto no-scrollbar pb-px">
          <button
            onClick={() => setActiveInsightTab("event-info")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeInsightTab === "event-info"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Event Info
          </button>
          <button
            onClick={() => setActiveInsightTab("h2h")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeInsightTab === "h2h"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Head to Head
          </button>
          <button
            onClick={() => setActiveInsightTab("lineups")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeInsightTab === "lineups"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Lineups
          </button>
          <button
            onClick={() => setActiveInsightTab("pregame")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
              activeInsightTab === "pregame"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Pregame Form
          </button>
        </div>

        {/* Insight Panels */}
        {activeInsightTab === "event-info" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Starts In</span>
                <p className="text-sm font-bold text-emerald-650 dark:text-emerald-400 mt-0.5">
                  {matchDetails ? getStartsIn(matchDetails.start, matchDetails.duration || 2) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Venue / Stadium</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.venue || (matchDetails ? "To Be Announced" : "N/A")}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stadium Capacity</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.stadium_capacity
                    ? eventInfo.stadium_capacity.toLocaleString()
                    : (matchDetails ? "To Be Decided" : "N/A")}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Match Referee</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.referee || (matchDetails ? "Official TBA" : "N/A")}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Round details</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.round ? `Matchday Round ${eventInfo.round}` : (matchDetails ? "Regular Fixture" : "N/A")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{matchDetails?.team1 || "Home"} Manager</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.home_manager || (matchDetails ? "Coaching Staff" : "N/A")}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{matchDetails?.team2 || "Away"} Manager</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventInfo?.away_manager || (matchDetails ? "Coaching Staff" : "N/A")}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeInsightTab === "h2h" && (
          <div className="space-y-4">
            {h2h ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800/50">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{matchDetails?.team1 || "Home"} Wins</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {h2h.homeWins ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800/50">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Draws</span>
                  <p className="text-xl sm:text-2xl font-black text-zinc-655 dark:text-zinc-350 mt-1">
                    {h2h.draws ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800/50">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{matchDetails?.team2 || "Away"} Wins</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {h2h.awayWins ?? 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
                <Award className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mb-2" />
                <p className="text-zinc-655 dark:text-zinc-400 font-medium">H2H history data is not available</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">Details will load as historical records are updated.</p>
              </div>
          )}
          </div>
        )}

        {activeInsightTab === "lineups" && (
          <div className="space-y-6">
            {lineups ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-200 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Formation</span>
                    <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {lineups.home_formation || "TBA"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Formation</span>
                    <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {lineups.away_formation || "TBA"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Roster */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/20">
                    <h3 className="font-black text-base text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 uppercase tracking-wider">
                      {matchDetails?.team1 || "Home"} Roster
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {lineups.home_players && lineups.home_players.length > 0 ? (
                        lineups.home_players.map((player, idx) => (
                          <li key={`home-p-${idx}`} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1 border-b border-zinc-100 dark:border-zinc-800/25 last:border-0">
                            <User className="h-4 w-4 text-zinc-400" /> {player}
                          </li>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-xs py-4 text-center">Roster details to be announced</p>
                      )}
                    </ul>
                  </div>

                  {/* Away Roster */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/20">
                    <h3 className="font-black text-base text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 uppercase tracking-wider">
                      {matchDetails?.team2 || "Away"} Roster
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {lineups.away_players && lineups.away_players.length > 0 ? (
                        lineups.away_players.map((player, idx) => (
                          <li key={`away-p-${idx}`} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1 border-b border-zinc-100 dark:border-zinc-800/25 last:border-0">
                            <User className="h-4 w-4 text-zinc-400" /> {player}
                          </li>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-xs py-4 text-center">Roster details to be announced</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Missing Players */}
                {((lineups.home_missing_players && lineups.home_missing_players.length > 0) ||
                  (lineups.away_missing_players && lineups.away_missing_players.length > 0)) && (
                  <div className="rounded-xl border border-red-500/10 p-4 bg-red-500/5">
                    <h4 className="font-extrabold text-sm text-red-550 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-red-500/10 pb-3">
                      <ShieldAlert className="h-4 w-4" /> Suspended / Out Injured
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h5 className="font-bold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{matchDetails?.team1}</h5>
                        <ul className="mt-2 space-y-1.5 text-sm text-red-655 dark:text-red-455">
                          {lineups.home_missing_players?.map((p, idx) => <li key={`hm-${idx}`}>• {p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{matchDetails?.team2}</h5>
                        <ul className="mt-2 space-y-1.5 text-sm text-red-655 dark:text-red-455">
                          {lineups.away_missing_players?.map((p, idx) => <li key={`am-${idx}`}>• {p}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
                <User className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mb-3" />
                <p className="text-zinc-650 dark:text-zinc-400 font-medium">Roster lineups are not available</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Official team playing XI will release approximately 1 hour before kickoff.</p>
              </div>
            )}
          </div>
        )}

        {activeInsightTab === "pregame" && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
            <AlignJustify className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mb-2" />
            <p className="text-zinc-655 dark:text-zinc-400 font-medium">Pregame analytics are currently loading</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">Comparing team forms and standings analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
