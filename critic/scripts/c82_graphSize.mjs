// Critic run 82 (new): how big the relations graph and its names are drawn at W x H (Relations alone, then with a nation
// chosen in it, R182's side by side on a sideways phone): the graph's rect, the median and least screen height of a node's
// name, and the share of names under 8 px. Usage: [BASE=...] [TAG=] node critic/scripts/c82_graphSize.mjs <seed> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), W = Number(process.argv[3] ?? 844), H = Number(process.argv[4] ?? 390);
const TAG = process.env.TAG ?? '';
const L = `c82gs_${seed}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: W < 600 || H < 500, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
const measure = () => page.evaluate(() => {
  const g = document.querySelector('[data-testid=relations-graph]');
  if (!g) return null;
  const r = g.getBoundingClientRect();
  const hs = [...g.querySelectorAll('text')].map((t) => t.getBoundingClientRect().height).filter((h) => h > 0).sort((a, b) => a - b);
  return { graph: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], names: hs.length, medianPx: +(hs[hs.length >> 1] ?? 0).toFixed(1), leastPx: +(hs[0] ?? 0).toFixed(1), under8: hs.filter((h) => h < 8).length };
});
const out = { seed, W, H, base: BASE };
await page.evaluate(() => window.__warsim.hud.toggleRelations());
await page.waitForTimeout(900);
out.alone = await measure();
await page.screenshot({ path: path.join(SHOTS, `${L}_alone.png`) });
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags.GER);
await page.waitForTimeout(900);
out.withPanel = await measure();
await page.screenshot({ path: path.join(SHOTS, `${L}_panel.png`) });
out.errors = errors;
console.log(JSON.stringify(out));
save(`${L}.json`, out);
await browser.close();
