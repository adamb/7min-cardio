// POST /api/event  { type: "start" | "quit" | "finish" | "name", device, day, step?, initials? }
import {
  json, validDevice, cleanInitials, pickDay, prevDay, playerSummary, STEPS, MIN_WORKOUT_MS,
} from '../../lib/scoreboard.js';

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const { type, device } = b || {};
  if (!validDevice(device)) return json({ error: 'bad device' }, 400);

  const db = env.DB;
  const now = Date.now();
  const day = pickDay(b.day, now);

  await db.prepare('INSERT OR IGNORE INTO players (device, created_at) VALUES (?, ?)')
    .bind(device, now).run();

  if (type === 'start') {
    await db.batch([
      db.prepare('UPDATE players SET started_at = ? WHERE device = ?').bind(now, device),
      db.prepare('INSERT INTO daily (day, starts) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET starts = starts + 1').bind(day),
    ]);
    return json({ ok: true });
  }

  if (type === 'quit') {
    const step = b.step;
    if (!Number.isInteger(step) || step < 0 || step >= STEPS) return json({ error: 'bad step' }, 400);
    const p = await db.prepare('SELECT started_at FROM players WHERE device = ?').bind(device).first();
    if (!p || !p.started_at) return json({ ok: true, counted: false });
    await db.batch([
      db.prepare('UPDATE players SET started_at = NULL WHERE device = ?').bind(device),
      db.prepare('INSERT INTO quits (step, n) VALUES (?, 1) ON CONFLICT(step) DO UPDATE SET n = n + 1').bind(step),
    ]);
    return json({ ok: true });
  }

  if (type === 'name') {
    const ini = cleanInitials(b.initials);
    if (!ini) return json({ error: 'bad initials' }, 400);
    await db.prepare('UPDATE players SET initials = ? WHERE device = ?').bind(ini, device).run();
    return json(await playerSummary(db, device));
  }

  if (type === 'finish') {
    const p = await db.prepare('SELECT * FROM players WHERE device = ?').bind(device).first();
    const ini = cleanInitials(b.initials);
    if (ini && ini !== p.initials) {
      await db.prepare('UPDATE players SET initials = ? WHERE device = ?').bind(ini, device).run();
    }
    if (!p.started_at || now - p.started_at < MIN_WORKOUT_MS) {
      await db.prepare('UPDATE players SET started_at = NULL WHERE device = ?').bind(device).run();
      return json({ ...(await playerSummary(db, device)), counted: false, reason: 'too_fast' });
    }
    const streak = p.last_day === day ? Math.max(1, p.streak)
      : p.last_day === prevDay(day) ? p.streak + 1
      : 1;
    await db.batch([
      db.prepare(`UPDATE players SET workouts = workouts + 1, streak = ?, best_streak = MAX(best_streak, ?),
                  last_day = ?, last_finish = ?, started_at = NULL WHERE device = ?`)
        .bind(streak, streak, day, now, device),
      db.prepare('INSERT INTO daily (day, finishes) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET finishes = finishes + 1').bind(day),
    ]);
    return json({ ...(await playerSummary(db, device)), counted: true });
  }

  return json({ error: 'bad type' }, 400);
}
