"use client";

import { useRouter } from "next/navigation";
import { Play, ArrowUpRight } from "lucide-react";
import { Match } from "@/app/utils/fetchData";
import { useState } from "react";

interface MatchCardProps {
  match: Match;
  sportType?: "football" | "cricket" | "all";
}

export default function MatchCard({ match, sportType }: MatchCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const linkStr = match.link.toLowerCase();
    if (linkStr.includes("cricket.html")) {
      router.push("/cricket");
    } else if (linkStr.includes("football.html")) {
      router.push("/football");
    } else {
      window.open(match.link, "_blank", "noopener,noreferrer");
    }
  };

  const getFallbackImage = () => {
    const nameStr = match.name.toLowerCase();
    if (nameStr.includes("cricket") || sportType === "cricket") {
      return "https://cdn.jsdelivr.net/gh/yosintv2/cdn/cricket.png";
    }
    return "https://cdn.jsdelivr.net/gh/yosintv2/cdn/football.png";
  };

  // Clean name from cheap "Click Here" tags
  const cleanName = match.name
    .replace(/:\s*Click\s*Here\s*/gi, "")
    .replace(/\s*Click\s*Here\s*/gi, "")
    .trim();

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-zinc-50/90 dark:hover:bg-zinc-900/60 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-emerald-500/5 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full"
    >
      {/* Dynamic Glow Overlay on Hover */}
      <div className="absolute -inset-px -z-10 rounded-2xl bg-linear-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/10 group-hover:to-transparent group-hover:opacity-100 transition-all duration-500" />

      {/* Left Section: Logo & Match Description */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-2 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:border-emerald-500/30 group-hover:shadow-md transition-all duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageError ? getFallbackImage() : match.image}
            alt={cleanName}
            loading="lazy"
            className="h-full w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug text-base sm:text-lg tracking-tight">
            {cleanName}
          </h3>
        </div>
      </div>

      {/* Right Section: Interactive CTA button */}
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-zinc-100 dark:border-white/5 pt-3 sm:pt-0 shrink-0">
        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
          <Play className="h-4 w-4 fill-current animate-pulse" />
          <span>Click Here</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 group-hover:text-white dark:group-hover:text-black shadow-xs group-hover:shadow-md transition-all duration-300">
          <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:rotate-45" />
        </div>
      </div>
    </div>
  );
}
