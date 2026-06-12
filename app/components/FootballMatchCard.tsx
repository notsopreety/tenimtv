"use client";

import { useRouter } from "next/navigation";
import { FootballMatch } from "@/app/utils/fetchData";
import { useState } from "react";

interface FootballMatchCardProps {
  match: FootballMatch;
}

export default function FootballMatchCard({ match }: FootballMatchCardProps) {
  const router = useRouter();
  const [team1Error, setTeam1Error] = useState(false);
  const [team2Error, setTeam2Error] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const detailsUrl = match.details_url || "";
    let id = "";
    if (detailsUrl.includes("yosintv=")) {
      const matchObj = detailsUrl.match(/[?&]yosintv=([^&]+)/);
      if (matchObj) {
        id = matchObj[1];
      }
    }
    if (id) {
      router.push(`/match?tenimtv=${id}`);
    } else {
      const link = match.details_url || match.streaming_url;
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const getFallbackLogo = (teamName: string) => {
    const initial = teamName ? teamName.charAt(0).toUpperCase() : "?";
    return `https://placehold.co/48x48/d1d5db/374151?text=${initial}`;
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

  const getStartsIn = (startStr: string, durationHours: number = 2.2) => {
    try {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      if (now > end) {
        return "Ended";
      }
      const diffMs = start.getTime() - now.getTime();
      if (diffMs <= 0) {
        return "Started";
      }
      const diffMins = Math.floor(diffMs / 1000 / 60);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    } catch {
      return "";
    }
  };

  const status = getStatus(match.start, match.duration || 2.2);

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#1e2530] p-4 sm:p-5 transition-all duration-300 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-0.5 flex flex-col gap-4 w-full"
    >
      {/* Team Face-off row */}
      <div className="flex items-center justify-between w-full">
        {/* Team 1 (Left Side) */}
        <div className="flex items-center justify-end gap-3 w-[42%] text-right">
          <span className="font-extrabold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {match.team1}
          </span>
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a1f26] border border-zinc-200 dark:border-zinc-800 p-1 group-hover:scale-105 transition-transform duration-300 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team1Error ? getFallbackLogo(match.team1) : match.team1_logo}
              alt={match.team1}
              loading="lazy"
              className="h-full w-full object-contain rounded-full"
              onError={() => setTeam1Error(true)}
            />
          </div>
        </div>

        {/* Time / Status (Center Column) */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-[16%] text-center shrink-0">
          <span className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {formatTime(match.start)}
          </span>
          <span
            className={`inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-[10px] font-extrabold tracking-widest ${
              status === "LIVE"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : status === "UPCOMING"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-zinc-200 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-350 border border-zinc-300 dark:border-zinc-700/50"
            }`}
          >
            {status}
          </span>
          {status === "UPCOMING" && (
            <span className="text-[10px] font-semibold text-emerald-655 dark:text-emerald-400 mt-1 whitespace-nowrap">
              Starts in: {getStartsIn(match.start, match.duration || 2.2)}
            </span>
          )}
        </div>

        {/* Team 2 (Right Side) */}
        <div className="flex items-center justify-start gap-3 w-[42%] text-left">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a1f26] border border-zinc-200 dark:border-zinc-800 p-1 group-hover:scale-105 transition-transform duration-300 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team2Error ? getFallbackLogo(match.team2) : match.team2_logo}
              alt={match.team2}
              loading="lazy"
              className="h-full w-full object-contain rounded-full"
              onError={() => setTeam2Error(true)}
            />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {match.team2}
          </span>
        </div>
      </div>

      {/* League Banner (Bottom full-width row) */}
      <div className="w-full rounded-xl bg-blue-50/50 dark:bg-[#2a374a] py-2.5 px-4 text-center border border-blue-100/30 dark:border-blue-900/10">
        <span className="text-[11px] sm:text-xs font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">
          {match.league}
        </span>
      </div>
    </div>
  );
}
