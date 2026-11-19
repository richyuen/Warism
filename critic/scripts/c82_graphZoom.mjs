// Critic run 82 (new): on a sideways phone, can the relations graph be read and a node picked after zooming it with its
// own "+" button? Relations opened, "+" tapped k times (0..4); each time: the names' median screen height, the nodes whose
// circle centre lies inside the graph with the circle the top element there, and a tap on the first such node (does its
// panel open?). Usage: [BASE=...] [TAG=] node critic/scripts/c82_graphZoom.mjs <seed> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), W = Number(process.argv[3] ?? 667), H = Number(process.argv[4] ?? 375);
const TAG = process.env.TAG ?? '';
const L = `c82gz_${seed}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
await page.getByTestId('relations-btn').tap();
await page.waitForTimeout(800);
const rows = [];
for (let k = 0; k <= 4; k++) {
  if (k > 0) {
    const plus = page.locator('.relations-zoom button', { hasText: '+' }).first();
    await plus.tap();
    await page.waitForTimeout(500);
  }
  const m = await page.evaluate(() => {
    const g = document.querySelector('[data-testid=relations-graph]');
    const gr = g.getBoundingClientRect();
    const hs = [...g.querySelectorAll('text')].filter((t) => { const r = t.getBoundingClientRect(); return r.height > 0 && r.top >= gr.top && r.bottom <= gr.bottom && r.left >= gr.left && r.right <= gr.right; }).map((t) => t.getBoundingClientRect().height).sort((a, b) => a - b);
    const picks = [];
    for (const n of document.querySelectorAll('[data-testid^=relations-node-]')) {
      const c = n.querySelector('circle'); if (!c) continue;
      const r = c.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
      if (x > gr.left + 2 && x < gr.right - 2 && y > gr.top + 2 && y < gr.bottom - 2) { const top = document.elementFromPoint(x, y); if (top && n.contains(top)) picks.push({ id: n.getAttribute('data-testid'), x, y, d: +r.width.toFixed(1) }); }
    }
    return { graphH: Math.round(gr.height), namesInView: hs.length, medianPx: +(hs[hs.length >> 1] ?? 0).toFixed(1), pickable: picks.length, firstPick: picks[0] ?? null };
  });
  await page.screenshot({ path: path.join(SHOTS, `${L}_k${k}.png`) });
  rows.push({ k, ...m });
  console.log(JSON.stringify(rows.at(-1)));
}
// A finger's tap (Playwright's touchscreen) on the first pickable node at the last zoom: its panel?
const last = rows.at(-1).firstPick;
let tapped = null;
if (last) {
  await page.touchscreen.tap(last.x, last.y);
  await page.waitForTimeout(800);
  tapped = await page.evaluate(() => ({ selected: window.__warsim.hud.selected.value, panel: !!document.querySelector('[data-testid=nation-panel]') }));
  await page.screenshot({ path: path.join(SHOTS, `${L}_tapped.png`) });
}
console.log('tapped', JSON.stringify(tapped), 'errors', errors.length);
save(`${L}.json`, { seed, W, H, base: BASE, rows, tapped, errors });
await browser.close();
