// Critic run 63 (new): R64f hides the "Next" line while its hour is past. At Max, how often is the line gone while the
// track runs, and does it ever name a date before the shown one? 1938h from its URL, Max, sampled every 100 ms of wall
// time for SECS seconds: the date label, the line (or none), whether its date is before the shown date.
// Usage: node critic/scripts/c66_h_blank.mjs [secs=120] [W H] [speed=99]
import { launch, save, shot, BASE } from './c66_lib.mjs';
const SECS = Number(process.argv[2] ?? 120), W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const SPEED = Number(process.argv[5] ?? 99);
const out = { SECS, W, H, SPEED, samples: [] };
const { browser, page, errors } = await launch(W, H);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parse = (s) => { const m = /(\d{1,2}) (\w+) (\d{4})/.exec(s ?? ''); if (!m) return null; return Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1]); };
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await page.evaluate((s) => { window.__warsim.hud.setSpeedLevel(s); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); }, SPEED);
  const t0 = Date.now();
  let shots = 0;
  while (Date.now() - t0 < SECS * 1000) {
    const s = await page.evaluate(() => ({
      date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
      next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
      tick: window.__warsim.hud.tick.value,
      statsTick: window.__warsim.hud.stats.value?.tick ?? null,
      trackNextTick: window.__warsim.hud.stats.value?.trackNext?.tick ?? null,
      paused: window.__warsim.hud.paused.value,
    }));
    s.ms = Date.now() - t0;
    const d = parse(s.date), n = parse(s.next);
    s.past = d !== null && n !== null && n < d;
    if (s.paused) await page.evaluate(() => window.__warsim.hud.togglePause());
    if (s.next === null && s.trackNextTick !== null && shots < 3) { out[`blankShot${shots}`] = await shot(page, `c66hb_${W}x${H}_blank${shots}.png`); shots++; }
    out.samples.push(s);
    await page.waitForTimeout(100);
  }
  const sm = out.samples.filter((s) => s.trackNextTick !== null);
  out.summary = {
    n: out.samples.length,
    whileTrack: sm.length,
    blank: sm.filter((s) => s.next === null).length,
    past: out.samples.filter((s) => s.past).length,
    firstDate: out.samples[0]?.date, lastDate: out.samples.at(-1)?.date,
    distinctNext: [...new Set(out.samples.map((s) => s.next).filter(Boolean))].length,
  };
  // longest run of blank samples
  let run = 0, best = 0;
  for (const s of sm) { run = s.next === null ? run + 1 : 0; best = Math.max(best, run); }
  out.summary.longestBlankRun = best;
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c66_hb_${W}x${H}_s${SPEED}.json`, out);
await browser.close();
console.log(JSON.stringify(out.summary), out.fatal ?? 'ok', errors.slice(0, 5));
