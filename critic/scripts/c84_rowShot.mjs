// Critic run 84: a full-page shot and the war row's geometry at each size (a fresh page per size: no resize history).
// 1938 seed after <days> days. Per size: the row's box, each banner's box and text, "+n", overflow, items off screen.
// Usage: [BASE=...] [TAG=] node critic/scripts/c84_rowShot.mjs <seed> <days> <WxH,...> [touch]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '700x800').split(',').map((s) => s.split('x').map(Number));
const touch = process.argv[5] === 'touch';
const TAG = process.env.TAG ?? '';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const out = { seed, days, sizes: [] };
for (const [W, H] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days) await hours(page, 24 * days);
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => {
    const row = document.querySelector('[data-testid=war-banners]');
    if (!row) return null;
    const b = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
    const items = [...row.children].map((c) => ({ t: c.textContent.trim().slice(0, 50), box: b(c.getBoundingClientRect()) }));
    // The ticker's rows and the legend: covered by the row? (each sampled along its width every 8 px, the top element)
    const under = [];
    for (const el of document.querySelectorAll('.ticker .ticker-row, [data-testid=ticker-row], [data-testid=map-legend], .map-legend, [data-testid=ticker-more]')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      let hit = 0, n = 0;
      for (let x = r.left + 2; x < r.right - 2; x += 8) { n++; const t = document.elementFromPoint(x, r.top + r.height / 2); if (t && row.contains(t)) hit++; }
      if (hit) under.push({ what: el.textContent.trim().slice(0, 40), coveredPx: hit * 8, of: Math.round(r.width) });
    }
    return { row: b(row.getBoundingClientRect()), overflow: Math.round(row.scrollWidth - row.clientWidth), items, offscreen: items.filter((i) => i.box[0] < 0 || i.box[2] > innerWidth).map((i) => i.t), under, phone: matchMedia('(max-width: 600px), (max-height: 500px)').matches };
  });
  const shot = `c84rw_${seed}_d${days}_${W}x${H}${TAG}.png`;
  await page.screenshot({ path: path.join(SHOTS, shot) });
  out.sizes.push({ W, H, ...g, errors, shot: `critic/shots/${shot}` });
  console.log(JSON.stringify({ W, H, ...g }));
  await ctx.close();
}
save(`c84rw_${seed}_d${days}${TAG}.json`, out);
await browser.close();
