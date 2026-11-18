-- 7 Minute Cardio scoreboard (Cloudflare D1)
-- Apply with: npx wrangler d1 execute 7min-cardio --remote --file schema.sql

-- One row per phone/browser (an anonymous random id kept in localStorage).
CREATE TABLE IF NOT EXISTS players (
  device      TEXT PRIMARY KEY,
  initials    TEXT    NOT NULL DEFAULT '???',
  workouts    INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_day    TEXT,              -- player's local date of last counted workout (YYYY-MM-DD)
  last_finish INTEGER,           -- ms epoch
  started_at  INTEGER,           -- ms epoch of the workout in progress, NULL if none
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS players_rank ON players (workouts DESC, best_streak DESC);

-- Starts and finishes per day (for totals and "today").
CREATE TABLE IF NOT EXISTS daily (
  day      TEXT PRIMARY KEY,
  starts   INTEGER NOT NULL DEFAULT 0,
  finishes INTEGER NOT NULL DEFAULT 0
);

-- How many workouts were abandoned on each exercise (0-7).
CREATE TABLE IF NOT EXISTS quits (
  step INTEGER PRIMARY KEY,
  n    INTEGER NOT NULL DEFAULT 0
);
