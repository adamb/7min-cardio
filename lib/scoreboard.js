// Shared helpers for the scoreboard API.

export const STEPS = 8;
// A finish only counts if the workout ran at least this long.
// Skipping exactly one exercise still counts: that's the real 7 minutes.
export const MIN_WORKOUT_MS = 6.5 * 60 * 1000;

const DEVICE = /^[A-Za-z0-9-]{8,64}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const validDevice = (d) => typeof d === 'string' && DEVICE.test(d);

export function cleanInitials(s) {
  if (typeof s !== 'string') return null;
  const v = s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  return v.length ? v : null;
}

// Use the player's local date if it's plausible (within 2 days of server time), else UTC.
export function pickDay(day, now = Date.now()) {
  if (typeof day === 'string' && DAY.test(day)) {
    const t = Date.parse(day + 'T00:00:00Z');
    if (!Number.isNaN(t) && Math.abs(t - now) < 2 * 86400000) return day;
  }
  return new Date(now).toISOString().slice(0, 10);
}

export function prevDay(day) {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function playerSummary(db, device) {
  const p = await db
    .prepare('SELECT initials, workouts, streak, best_streak FROM players WHERE device = ?')
    .bind(device)
    .first();
  if (!p) return null;
  let rank = null;
  if (p.workouts > 0) {
    const r = await db
      .prepare('SELECT COUNT(*) + 1 AS rank FROM players WHERE workouts > ?')
      .bind(p.workouts)
      .first();
    rank = r.rank;
  }
  return { ...p, score: p.workouts * 800, rank };
}
