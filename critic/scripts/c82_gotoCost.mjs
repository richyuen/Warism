// Critic run 82 (new, R179 off its case): what the finer search of a clear map point costs on a phone. With a nation's panel
// open at W x H, time view.showPlaceClear(capital) at the default margin and at 8 px (R179's fallback, an 8 px grid), and
// the long tasks (PerformanceObserver 'longtask') of hud.onGoToNation over each nation in the list.
// Usage: [BASE=...] [TAG=] node critic/scripts/c82_gotoCost.mjs <seed> <W> <H> [TAGS comma list]
import { chromium } from '@playwright/test';
import { BASE, save, CELLS } from './c81_lib.mjs';
const seed = Number(process.argv[2] ?? 69937), W = Number(process.argv[3] ?? 360), H = Number(process.argv[4] ?? 740);
const TAGS = (process.argv[5] ?? 'ITA,USA,ENG,GER,SOV,FRA,JAP,CHI').split(',');
const TAG = process.env.TAG ?? '';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
await page.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: false }); });
const rows = [];
for (const tg of TAGS) {
  const id = CELLS.tags[tg];
  if (!id) continue;
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), id);
  await page.waitForTimeout(500);
  const t = await page.evaluate((id) => {
    const v = window.__warsim.view; const at = v.capitalOf(id); if (!at) return null;
    const c = v.controller.cam; const keep = { cx: c.cx, cy: c.cy, scale: c.scale };
    const t0 = performance.now(); const a = v.showPlaceClear(at[0], at[1]); const t1 = performance.now();
    const b = v.showPlaceClear(at[0], at[1], 8); const t2 = performance.now();
    return { def: a, defMs: +(t1 - t0).toFixed(1), m8: b, m8Ms: +(t2 - t1).toFixed(1) };
  }, id);
  await page.evaluate(() => { window.__lt.length = 0; });
  await page.evaluate((n) => window.__warsim.hud.onGoToNation(n), id);
  await page.waitForTimeout(2500);
  const lt = await page.evaluate(() => window.__lt.slice());
  rows.push({ tg, ...t, longTasksOnGoTo: lt });
  console.log(tg, JSON.stringify(rows.at(-1)));
}
save(`c82gc_${seed}_${W}x${H}${TAG}.json`, { seed, W, H, rows, errors });
await browser.close();
