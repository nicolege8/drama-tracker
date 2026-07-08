export type DramaStatus = "watching" | "completed" | "plan_to_watch";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface DramaEntry {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  status: DramaStatus;
  rating: number | null;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface TmdbShowSummary {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
  origin_country: string[];
  overview: string;
}

export interface TmdbShowDetails extends TmdbShowSummary {
  genres: { id: number; name: string }[];
  number_of_episodes: number | null;
  number_of_seasons: number | null;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}
