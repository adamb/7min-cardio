# 7 Minute Cardio

A single-page, iPhone-friendly timer for a "7 minute" cardio routine with 8 one-minute exercises. The math is part of the joke.

Live at **https://7.dev.pr** · High scores at **https://7.dev.pr/stats**

1. Bunny Hop
2. Full Body Swing
3. Arm Swing (Vertical)
4. Trunk Twist (Popeye)
5. Dead Arms
6. Golf Twist
7. High 5 March
8. Side to Side Squat

It highlights the current move, counts down each minute, and beeps for the last 5 seconds before switching to the next move. It fits on one screen and keeps the phone awake while running. On iPhone, use Share → Add to Home Screen to open it full-screen like an app.

Use the share button in either page header to share its canonical URL. If native sharing is unavailable or fails, the page copies the link; if clipboard access also fails, it shows a selectable URL.

Inspired by [this Instagram reel](https://www.instagram.com/reels/DQFD972ETcB/). Made at [Code Puerto Rico](https://code.pr).

## Layout

```
public/            static site (index.html, stats.html, icons, manifest)
functions/api/     Cloudflare Pages Functions
  event.js         POST /api/event  (start, quit, finish, name)
  stats.js         GET  /api/stats  (leaderboard and world stats)
lib/scoreboard.js  shared helpers
schema.sql         D1 database schema
wrangler.toml      Pages config and D1 binding
```

## Scoreboard

The arcade-style high score page lives at `/stats`.

- **No accounts.** Each phone gets a random anonymous ID in `localStorage`. After a workout you can enter 3 initials, arcade style.
- **Score:** 100 points per minute, so 800 per "7-minute" workout.
- **Anti-cheat (light):** a finish only counts if the workout ran at least 6.5 minutes. Skipping one exercise still counts (that's the real 7 minutes), but skipping more doesn't.
- **Streaks** count consecutive days with a finished workout, using the phone's local date.
- **Where heroes fall:** if you restart or close the page mid-workout, the server records which exercise you quit on.
- If the API is unreachable, the timer still works and the finish screen just says the scoreboard is offline.

## One-time setup

```bash
npx wrangler d1 create 7min-cardio
# paste the database_id it prints into wrangler.toml
npx wrangler d1 execute 7min-cardio --remote --file schema.sql
```

## Deploy

```bash
npx wrangler pages deploy
```

This reads `wrangler.toml`, uploads `public/`, and bundles `functions/`. The Pages project's production branch must be `main` for 7.dev.pr to update.

## Local development

```bash
npx wrangler d1 execute 7min-cardio --local --file schema.sql
npx wrangler pages dev
```

## More ideas

- Turn on Cloudflare Web Analytics (Workers & Pages → 7min-cardio → Metrics) for page views, countries and referrers.
- Personal history page: a calendar of your workout days.
