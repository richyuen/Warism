// Critic run 69 (new): the replay's last years on the page (R80f-i), from a built start (replay mode), stepped to each
// date given; at each: the date and Next lines, the ticker, the hovered tooltip at each place, and a shot per place
// (lon, lat, m/px; no settle while a burst could animate: units only).
// Usage: node critic/scripts/c71_ev91.mjs <startYear> <after> <date@label:lon:lat:mpp,label:lon:lat:mpp> ...
import { launch, save, shot, BASE, settle } from './c71_lib.mjs';
const year = Number(process.argv[2] ?? 1990);
const after = Number(process.argv[3] ?? 999);
const stops = process.argv.slice(4).map((a) => {
  const [date, rest] = a.split('@');
  return { date, places: (rest ?? '').split(',').filter(Boolean).map((p) => { const [label, lon, lat, m] = p.split(':'); return { label, lon: Number(lon), lat: Number(lat), m: Number(m) }; }) };
});
const out = { year, after, stops: [] };
const { browser, page, errors } = await launch(1600, 900);
const tickOf = (d) => Math.round((Date.parse(`${d}T00:00:00Z`) - Date.UTC(1938, 0, 1)) / 3600000);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=${process.env.MODE ?? 'replay'}&after=${after}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  for (const s of stops) {
    const now = await page.evaluate(() => window.__warsim.view.lastTick);
    const want = tickOf(s.date);
    if (want > now) {
      await page.evaluate((n) => window.__warsim.sim.step(n), want - now);
      await page.waitForFunction((t) => window.__warsim.view.lastTick >= t, want, { timeout: 900_000, polling: 500 });
    }
    await page.waitForTimeout(2500);
    const rec = { date: s.date, places: [] };
    rec.dateLine = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
    rec.next = await page.evaluate(() => document.querySelector('[data-testid=track-next]')?.innerText ?? null);
    rec.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 14).map((e) => e.innerText.replace(/\n/g, ' ')));
    for (const p of s.places) {
      const [cx, cy] = await page.evaluate(({ lon, lat }) => {
        // The world's cells (critic/c6_cells.json's size), as c71_x_places' coordinates.
        const w = 2048, h = 1024;
        // The map's Miller projection (src/sim/data/projection.ts), top at 80° N.
        const my = (p) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * p));
        const top = my((80 * Math.PI) / 180);
        return [((lon + 180) / 360) * w, ((top - my((lat * Math.PI) / 180)) / Math.PI) * h];
      }, p);
      await page.evaluate(({ cx, cy, m }) => { const v = window.__warsim.view; v.controller.set({ cx, cy, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { cx, cy, m: p.m });
      await settle(page, 8000);
      await page.mouse.move(780, 430); await page.waitForTimeout(150); await page.mouse.move(800, 450, { steps: 4 });
      await page.waitForTimeout(900);
      const tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip, [data-testid=tooltip]')?.innerText ?? null);
      const file = await shot(page, `c71ev_${year}_${s.date}_${p.label}_${p.m}m.png`);
      rec.places.push({ ...p, cx, cy, tip, file });
    }
    out.stops.push(rec);
  }
  out.living = await page.evaluate(async () => ({ tick: window.__warsim.view.lastTick, hash: (await window.__warsim.sim.hash()).hash }));
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c71ev_${year}_fatal.png`).catch(() => null); }
out.errors = errors;
save(`c71_ev_${year}_${after}${process.env.MODE ? '_' + process.env.MODE : ''}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 8000));
