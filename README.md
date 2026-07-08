# Drama Tracker

A mobile app for tracking C-dramas/K-dramas — collections, ratings, friend following, and an activity feed. See [`PLAN.md`](./PLAN.md) for the product vision and roadmap.

## Stack

- **App:** React Native + Expo (Expo Router for navigation)
- **Backend:** Supabase (auth + Postgres)
- **Drama metadata:** [TMDB API](https://www.themoviedb.org/documentation/api)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a [Supabase](https://supabase.com) project, then in the SQL Editor run the contents of [`supabase/schema.sql`](./supabase/schema.sql) to create the tables, triggers, and row-level security policies.

3. Get a [TMDB API key](https://www.themoviedb.org/settings/api) (free — the "API Key (v3 auth)" one).

4. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
   - `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's Settings > API page.
   - `EXPO_PUBLIC_TMDB_API_KEY` — from step 3.

5. Start the app:
   ```
   npx expo start
   ```
   Scan the QR code with the Expo Go app (iOS/Android), or press `i`/`a` to open a simulator.

## MVP scope

Browse/search dramas, add to a personal collection with a status + rating, follow friends, and see a simple activity feed. See `PLAN.md` for what's deliberately out of scope for v1 (leaderboards, recommendations, subscriptions, actor pages).
