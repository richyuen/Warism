// Critic run 86: one shot of the row's foot at W x H in a map mode, and what the row covers (the legend, the ticker).
// Usage: [BASE=...] [TAG=] node critic/scripts/c86_modeShot.mjs <seed> <days> <W> <H> <mode>
import { chromium } from '@playwright/test';
import { BASE, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const [seed, days, W, H] = process.argv.slice(2, 6).map(Number);
const mode = process.argv[6] ?? 'seaControl';
const TAG = process.env.TAG ?? '';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
await hours(page, 24 * days);
await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
await page.waitForTimeout(1200);
const g = await page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  const rr = row.getBoundingClientRect();
  const under = [];
  for (const el of document.querySelectorAll('[data-testid=map-legend], .ticker .ticker-row, [data-testid=ticker-row]')) {
    const r = el.getBoundingClientRect();
    let hit = 0;
    for (let x = r.left + 2; x < r.right - 2; x += 2) for (let y = r.top + 2; y < r.bottom - 2; y += 4) { const t = document.elementFromPoint(x, y); if (t && row.contains(t)) { hit++; } }
    if (hit) under.push({ what: el.getAttribute('data-testid') ?? el.className, cells: hit });
  }
  return { shown: row.querySelectorAll('[data-testid=war-banner]').length, row: [Math.round(rr.left), Math.round(rr.top), Math.round(rr.right), Math.round(rr.bottom)], under };
});
const f = `c86ms_${seed}_${W}x${H}_${mode}${TAG}.png`;
await page.screenshot({ path: path.join(SHOTS, f), clip: { x: 0, y: H - 300, width: W, height: 300 } });
console.log(JSON.stringify({ ...g, shot: `critic/shots/${f}` }));
await browser.close();
