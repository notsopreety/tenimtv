import fs from "fs/promises";
import path from "path";

export interface Match {
  name: string;
  image: string;
  link: string;
}

export interface ApiResponse {
  title: string;
  matches: Match[];
}

export interface CricketMatch {
  team1: string;
  team1_logo: string;
  team2: string;
  team2_logo: string;
  league_logo: string | null;
  league: string;
  start: string;
  details_url: string;
  streaming_url: string;
  event_id: number;
  duration?: number;
}

export interface CricketApiResponse {
  matches: CricketMatch[];
}

export interface FootballMatch {
  team1: string;
  team1_logo: string;
  team2: string;
  team2_logo: string;
  league_logo: string | null;
  league: string;
  start: string;
  details_url: string;
  streaming_url: string;
  event_id: number;
  duration?: number;
  football_data?: {
    event?: {
      league?: string;
      round?: number;
      kick_off_time_utc?: string;
      venue?: string;
      stadium_capacity?: number;
      referee?: string | null;
      home_team?: string;
      away_team?: string;
      home_manager?: string;
      away_manager?: string;
    };
    h2h?: {
      homeWins?: number;
      awayWins?: number;
      draws?: number;
    };
    lineups?: {
      home_formation?: string | null;
      away_formation?: string | null;
      home_players?: string[];
      away_players?: string[];
      home_missing_players?: string[];
      away_missing_players?: string[];
    };
  } | null;
}

export interface FootballApiResponse {
  matches: FootballMatch[];
}

export interface StreamEvent {
  name: string;
  link?: string;
  links?: string[];
}

export interface StreamResponse {
  events: StreamEvent[];
}

export function sanitizeMatch(match: Match): Match {
  return {
    name: match.name ? match.name.trim() : "",
    image: match.image ? match.image.replace(/\s+/g, "") : "",
    link: match.link ? match.link.replace(/\s+/g, "") : "",
  };
}

export function sanitizeCricketMatch(match: CricketMatch): CricketMatch {
  return {
    ...match,
    team1: match.team1 ? match.team1.trim() : "",
    team2: match.team2 ? match.team2.trim() : "",
    team1_logo: match.team1_logo ? match.team1_logo.replace(/\s+/g, "") : "",
    team2_logo: match.team2_logo ? match.team2_logo.replace(/\s+/g, "") : "",
    league: match.league ? match.league.trim() : "",
    details_url: match.details_url ? match.details_url.replace(/\s+/g, "") : "",
    streaming_url: match.streaming_url ? match.streaming_url.replace(/\s+/g, "") : "",
  };
}

export function sanitizeFootballMatch(match: FootballMatch): FootballMatch {
  return {
    ...match,
    team1: match.team1 ? match.team1.trim() : "",
    team2: match.team2 ? match.team2.trim() : "",
    team1_logo: match.team1_logo ? match.team1_logo.replace(/\s+/g, "") : "",
    team2_logo: match.team2_logo ? match.team2_logo.replace(/\s+/g, "") : "",
    league: match.league ? match.league.trim() : "",
    details_url: match.details_url ? match.details_url.replace(/\s+/g, "") : "",
    streaming_url: match.streaming_url ? match.streaming_url.replace(/\s+/g, "") : "",
  };
}

export async function fetchCricketData(): Promise<ApiResponse> {
  const res = await fetch("https://cdn.singhs.com.np/api/cricket-homepage.json", {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) {
    throw new Error("Failed to fetch cricket data");
  }
  const data: ApiResponse = await res.json();
  return {
    title: data.title || "Cricket Events",
    matches: (data.matches || []).map(sanitizeMatch),
  };
}

export async function fetchDetailedCricketMatches(): Promise<CricketApiResponse> {
  const res = await fetch("https://cdn.singhs.com.np/api/match-cricket.json", {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) {
    throw new Error("Failed to fetch detailed cricket matches");
  }
  const data: CricketApiResponse = await res.json();
  return {
    matches: (data.matches || []).map(sanitizeCricketMatch),
  };
}

export async function fetchDetailedFootballMatches(): Promise<FootballApiResponse> {
  const res = await fetch("https://cdn.singhs.com.np/api/match-football.json", {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) {
    throw new Error("Failed to fetch detailed football matches");
  }
  const data: FootballApiResponse = await res.json();
  return {
    matches: (data.matches || []).map(sanitizeFootballMatch),
  };
}

export async function fetchFifaWorldCupMatches(): Promise<FootballApiResponse> {
  const res = await fetch("https://cdn.singhs.com.np/api/fifawc.json", {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) {
    throw new Error("Failed to fetch FIFA WC matches");
  }
  const data: FootballApiResponse = await res.json();
  return {
    matches: (data.matches || []).map(sanitizeFootballMatch),
  };
}

export async function fetchFootballData(): Promise<ApiResponse> {
  const res = await fetch("https://cdn.singhs.com.np/api/football-homepage.json", {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) {
    throw new Error("Failed to fetch football data");
  }
  const data: ApiResponse = await res.json();
  return {
    title: data.title || "Football Events",
    matches: (data.matches || []).map(sanitizeMatch),
  };
}

export async function fetchStreamData(id: string): Promise<StreamResponse> {
  const cleanId = id.trim().replace(/\.json$/i, "");
  const res = await fetch(`https://cdn.singhs.com.np/${cleanId}.json`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch stream details for ${cleanId}`);
  }
  const data = await res.json();
  const rawEvents = data && Array.isArray(data.events) ? data.events : [];
  
  // Sanitize the events array to remove dividers and string anomalies
  const events = rawEvents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((e: any) => e && typeof e === "object" && !Array.isArray(e))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => ({
      name: e.name ? String(e.name).trim() : "",
      link: e.link ? String(e.link).trim() : undefined,
      links: Array.isArray(e.links) ? e.links.map((l: unknown) => String(l).trim()) : undefined,
    }));

  return { events };
}

export function extractStreamId(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Check for common query params
    const id = parsed.searchParams.get("yosintv") || 
               parsed.searchParams.get("tenimtv") || 
               parsed.searchParams.get("id");
    if (id) return id;
    
    // Check pathname (e.g. /portugal.json)
    const pathname = parsed.pathname;
    if (pathname.endsWith(".json")) {
      const parts = pathname.split("/");
      const filename = parts[parts.length - 1];
      return filename.replace(/\.json$/i, "");
    }
  } catch {
    // regex fallback
    const matchParam = url.match(/[?&](?:yosintv|tenimtv|id)=([^&]+)/);
    if (matchParam) return matchParam[1];
    
    const matchJson = url.match(/\/([^/]+)\.json/);
    if (matchJson) return matchJson[1];
  }
  return null;
}

export async function findMatchDetails(id: string): Promise<FootballMatch | null> {
  try {
    const [cricket, football, wc] = await Promise.all([
      fetchDetailedCricketMatches().catch(() => ({ matches: [] })),
      fetchDetailedFootballMatches().catch(() => ({ matches: [] })),
      fetchFifaWorldCupMatches().catch(() => ({ matches: [] })),
    ]);

    const allMatches = [
      ...cricket.matches,
      ...football.matches,
      ...wc.matches,
    ];

    const match = allMatches.find((m) => {
      const link = (m.details_url || m.streaming_url || "").toLowerCase();
      const team1 = (m.team1 || "").toLowerCase();
      const team2 = (m.team2 || "").toLowerCase();
      const queryLower = id.toLowerCase();
      return (
        link.includes(`yosintv=${queryLower}`) || 
        link.includes(`/${queryLower}.json`) ||
        team1.includes(queryLower) ||
        team2.includes(queryLower)
      );
    });

    return match || null;
  } catch (e) {
    console.error("Error finding match details:", e);
    return null;
  }
}

export interface Server2Stream {
  name: string;
  url: string;
}

export async function fetchServer2Data(id: string): Promise<Server2Stream[]> {
  try {
    const cleanId = id.trim().replace(/\.json$/i, "").toLowerCase();
    const filePath = path.join(process.cwd(), "app/data", `${cleanId}.txt`);
    
    try {
      await fs.access(filePath);
    } catch {
      return [];
    }

    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    
    // First line is match title/header
    // Rest of the lines are Name and URL pairs
    const streams: Server2Stream[] = [];
    for (let i = 1; i < lines.length; i += 2) {
      const name = lines[i];
      const url = lines[i + 1];
      if (name && url) {
        streams.push({ name, url });
      }
    }
    return streams;
  } catch (error) {
    console.error("Error reading Server 2 data:", error);
    return [];
  }
}
