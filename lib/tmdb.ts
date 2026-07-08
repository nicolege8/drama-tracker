import type { TmdbShowDetails, TmdbShowSummary } from "./types";

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_TMDB_API_KEY. Copy .env.example to .env and add your TMDB API key."
    );
  }
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function searchDramas(query: string): Promise<TmdbShowSummary[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<{ results: TmdbShowSummary[] }>("/search/tv", { query });
  return data.results;
}

// Origin-country-based browse, since TMDB's discover endpoint only accepts
// a single with_origin_country value (no OR across countries).
export async function discoverDramasByCountry(
  originCountry: "KR" | "CN",
  page = 1
): Promise<TmdbShowSummary[]> {
  const data = await tmdbFetch<{ results: TmdbShowSummary[] }>("/discover/tv", {
    with_origin_country: originCountry,
    sort_by: "popularity.desc",
    page: String(page),
  });
  return data.results;
}

export async function getDramaDetails(tmdbId: number): Promise<TmdbShowDetails> {
  return tmdbFetch<TmdbShowDetails>(`/tv/${tmdbId}`, { append_to_response: "credits" });
}

export function posterUrl(posterPath: string | null): string | null {
  return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
}
