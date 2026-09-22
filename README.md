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

## Deploy

```bash
npx wrangler pages deploy . --project-name 7min-cardio
```
