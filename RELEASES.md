# Releases

## 2026-11-21 — Share buttons

- Source commit: `53e1e76169c838e37358f4fb648444acf3f9c9a8` (clean, tested, pushed to main before deployment).
- Cloudflare Pages deployment: `2a055c51`, https://2a055c51.7min-cardio.pages.dev.
- Added native sharing, clipboard fallback, and selectable links to the app and leaderboard.
- Verification: six mocked handler tests, script syntax checks, and diff checks passed. Live `/`, `/stats`, and `/share.js` fetched with curl matched source files byte for byte. Python urllib was rejected with HTTP 403; curl verification succeeded.
- Limitation: native share sheet behavior has not been tested on a physical iPhone; no real shares or analytics events were generated in testing.
- Implementation: Codex / gpt-6-luna. Integration review: Codex / gpt-6-astra.
