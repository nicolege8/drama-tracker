# Drama Tracker — MVP Plan

## Vision
A mobile app for tracking C-dramas and K-dramas — collections, ratings/reviews, leaderboards, genre browsing, recommendations, and actor/actress pages. Think "Letterboxd for C/K-dramas." The main incumbent is MyDramaList (MDL) — we're not avoiding that space, but our bet is a cleaner, more modern UX plus features MDL doesn't do well: gamified leaderboards (most dramas watched, genre completionist, streaks) and deeper actor-centric discovery (chemistry pairings, filmography-based recs). Long-term monetization is subscription-based, but that's a later-phase decision, not part of the MVP.

## MVP Goal
You, your friend, and your immediate circle can track dramas you've watched, rate them, and see what your friends are watching — enough real usage to learn what to build next (leaderboards? recs? reviews?) instead of guessing upfront.

## Tech Stack
- **App:** React Native + Expo — one codebase for iOS and Android, low native-build overhead for a small team.
- **Backend:** Supabase — Postgres + auth + realtime, covers accounts, collections, and social follows without a custom backend.
- **Drama metadata:** TMDB API — cast, posters, episode counts, air dates. Free API, official ToS (safer and more stable than scraping MDL). **To verify early:** TMDB's C-drama coverage depth, since it may be spottier than K-drama.
- **Subscriptions:** Deferred entirely — not needed until a paid tier exists. When it does, RevenueCat is the standard tool for managing App Store/Play Store subscriptions (mobile requires using platform in-app purchase systems, not Stripe, for digital subscriptions).

## MVP Feature Scope (v1)
1. Browse/search dramas (TMDB-backed)
2. Add a drama to your personal collection with a status (watching / completed / plan-to-watch) and a rating
3. Basic user profile
4. Friend following
5. Simple activity feed — see what friends have recently added or rated

## Explicitly Out of Scope for v1
These are strong v2/v3 candidates, not abandoned — deferred until real usage tells us what people actually want:
- Leaderboards / gamification
- Recommendation engine
- Reviews with social features (comments, likes)
- Subscriptions / monetization
- Dedicated actor/actress pages

## Loose Phased Roadmap
No fixed dates — casual side-project pace. Move to the next phase when the current one feels solid enough to use.

- **Phase 0 — Setup:** Expo project scaffold, Supabase project, TMDB API access, basic navigation shell.
- **Phase 1 — Drama browsing:** TMDB integration, search/browse UI.
- **Phase 2 — Personal collections:** Auth, add-to-collection with status + rating, personal list views.
- **Phase 3 — Social layer:** Friend following, activity feed.
- **Phase 4 — Polish + dogfooding:** Get your friend group actually using it, gather feedback, decide what v2 feature to build next (leaderboards vs. recs vs. reviews).

## Open Questions to Resolve Early
- TMDB C-drama coverage — spot-check before committing to it as the sole data source.
- iOS + Android simultaneously vs. one first — Expo makes both close to free, so default to both unless a reason emerges to sequence them.
- When to set up Apple/Google developer accounts (needed before any real device/store testing, so don't leave it too late).
