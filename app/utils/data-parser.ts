import fs from 'fs';
import path from 'path';

export interface Channel {
  name: string;
  url: string;
  id: string | null;
}

export interface EventData {
  slug: string;
  title: string;
  channels: Channel[];
}

const DATA_DIR = path.join(process.cwd(), 'app', 'data');

export async function getEventBySlug(slug: string): Promise<EventData | null> {
  try {
    const filePath = path.join(DATA_DIR, `${slug}.txt`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const lines = fileContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      return null;
    }

    const title = lines[0];
    const channels: Channel[] = [];

    for (let i = 1; i < lines.length; i += 2) {
      if (i + 1 >= lines.length) break;
      const name = lines[i];
      const url = lines[i + 1];
      
      let id: string | null = null;
      try {
        const parsedUrl = new URL(url);
        id = parsedUrl.searchParams.get('id');
      } catch {
        // Fallback for non-standard URLs or partial params
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) {
          id = match[1];
        }
      }

      channels.push({ name, url, id });
    }

    return {
      slug,
      title,
      channels,
    };
  } catch (error) {
    console.error(`Error parsing event file for slug ${slug}:`, error);
    return null;
  }
}

export async function getAllEvents(): Promise<EventData[]> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return [];
    }

    const files = await fs.promises.readdir(DATA_DIR);
    const txtFiles = files.filter(f => f.endsWith('.txt') && f !== '[slug].txt');
    const events: EventData[] = [];

    for (const file of txtFiles) {
      const slug = path.basename(file, '.txt');
      const event = await getEventBySlug(slug);
      if (event) {
        events.push(event);
      }
    }

    return events;
  } catch (error) {
    console.error('Error reading all events:', error);
    return [];
  }
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0'
];

export interface StreamUrlResponse {
  id: string;
  name: string;
  Bearer: string | null;
  url: string;
  k1?: string;
  k2?: string;
}

export async function fetchStreamUrl(id: string): Promise<StreamUrlResponse> {
  const randomETag = `W/"${generateRandomString(28)}"`;
  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const response = await fetch(`https://footapi-psi.vercel.app/main?id=${encodeURIComponent(id)}`, {
    headers: {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
      'if-none-match': randomETag,
      'origin': 'https://footsterss.pages.dev',
      'user-agent': randomUA,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`FootAPI failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

