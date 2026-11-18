// GET /api/stats?device=...&day=YYYY-MM-DD
import { json, validDevice, pickDay, playerSummary, STEPS } from '../../lib/scoreboard.js';

export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const url = new URL(request.url);
  const device = url.searchParams.get('device');
  const day = pickDay(url.searchParams.get('day'));

  const [totals, today, players, top, quits] = await db.batch([
    db.prepare('SELECT COALESCE(SUM(starts), 0) AS starts, COALESCE(SUM(finishes), 0) AS finishes FROM daily'),
    db.prepare('SELECT starts, finishes FROM daily WHERE day = ?').bind(day),
    db.prepare('SELECT COUNT(*) AS n FROM players WHERE workouts > 0'),
    db.prepare(`SELECT device, initials, workouts, best_streak FROM players WHERE workouts > 0
                ORDER BY workouts DESC, best_streak DESC, last_finish ASC LIMIT 10`),
    db.prepare('SELECT step, n FROM quits'),
  ]);

  const t = totals.results[0];
  const td = today.results[0] || { starts: 0, finishes: 0 };
  const quitCounts = Array(STEPS).fill(0);
  for (const q of quits.results) if (q.step >= 0 && q.step < STEPS) quitCounts[q.step] = q.n;

  return json({
    starts: t.starts,
    finishes: t.finishes,
    minutes: t.finishes * 8,
    players: players.results[0].n,
    today: { starts: td.starts, finishes: td.finishes },
    top: top.results.map((r) => ({
      initials: r.initials,
      workouts: r.workouts,
      score: r.workouts * 800,
      best_streak: r.best_streak,
      you: validDevice(device) && r.device === device,
    })),
    quits: quitCounts,
    me: validDevice(device) ? await playerSummary(db, device) : null,
  });
}
