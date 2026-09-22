# 7 Minute Cardio

A single-page, iPhone-friendly timer for a "7 minute" cardio routine with 8 one-minute exercises. The math is part of the joke.

Live at **https://7.dev.pr**

1. Bunny Hop
2. Full Body Swing
3. Arm Swing (Vertical)
4. Trunk Twist (Popeye)
5. Dead Arms
6. Golf Twist
7. High 5 March
8. Side to Side Squat

It highlights the current move, counts down each minute, and beeps for the last 5 seconds before switching to the next move. It fits on one screen and keeps the phone awake while running. On iPhone, use Share → Add to Home Screen to open it full-screen like an app.

It's a single `index.html` file with no build step.

Inspired by [this Instagram reel](https://www.instagram.com/reels/DQFD972ETcB/). Made at [Code Puerto Rico](https://code.pr).

## Deploy

```bash
npx wrangler pages deploy . --project-name 7min-cardio
```

## Ideas: usage stats

1. **Visits.** Turn on Cloudflare Web Analytics for the Pages project (Workers & Pages → 7min-cardio → Metrics). It needs no code or cookies, and shows page views, visitors, countries, devices and referrers.
2. **Workouts started and finished.** Add a small Pages Function (`/functions/api/event.js`) backed by D1 or KV. The page pings it anonymously on start, on finish and when someone quits, which gives completion rate and drop-off per exercise. It could also power a public counter: "1,284 workouts done. Around 10,000 minutes. Probably."
3. **Personal history.** Store completed workouts, streak and total minutes in `localStorage` on each phone. That's private by default and needs no server.
