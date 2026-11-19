// Critic run 83 (R188 on a new seed and off its case): on a sideways phone the opened Ranking stops above the bar and its
// rows scroll. 1938 seed after <days> days at W x H: the Ranking opened; History, Relations, Editor, Statistics and Settings
// each the top element at its centre; the Ranking's box against the bar's; its last row reached by scrolling the box with
// a finger's swipe (touchscreen drag via CDP) and tapped (does its nation get chosen?). A shot of each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_rankBar.mjs <seed> <days> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 83951), days = Number(process.argv[3] ?? 300), W = Number(process.argv[4] ?? 844), H = Number(process.argv[5] ?? 390);
const TAG = process.env.TAG ?? '';
const L = `c83rb_${seed}_d${days}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(600);
const out = { seed, days, W, H };
await page.getByTestId('ranking-toggle').tap();
await page.waitForTimeout(700);
out.geom = await page.evaluate(() => {
  const r = document.querySelector('.stats-ranking')?.getBoundingClientRect();
  const bar = document.querySelector('.bottombar')?.getBoundingClientRect();
  const btns = {};
  for (const id of ['history-btn', 'relations-btn', 'editor-btn', 'stats-btn', 'settings-btn', 'god-btn']) {
    const b = document.querySelector(`[data-testid=${id}]`);
    if (!b) { btns[id] = 'absent'; continue; }
    const q = b.getBoundingClientRect();
    const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
    btns[id] = t === b || b.contains(t) ? 'top' : `under ${t?.closest('[data-testid]')?.getAttribute('data-testid') ?? t?.className}`;
  }
  const rows = document.querySelectorAll('[data-testid=rank-row]');
  return { ranking: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] : null, barTop: bar ? Math.round(bar.top) : null, btns, rows: rows.length };
});
await page.screenshot({ path: path.join(SHOTS, `${L}_1_open.png`) });
console.log(JSON.stringify(out.geom));
// The last row: swipe the ranking's box up with a finger until it is in the box, then tap it.
const box = await page.locator('.stats-ranking').boundingBox();
const cdp = await ctx.newCDPSession(page);
for (let i = 0; i < 8; i++) {
  const inBox = await page.evaluate(() => { const rs = document.querySelectorAll('[data-testid=rank-row]'); const l = rs[rs.length - 1]; const b = document.querySelector('.stats-ranking').getBoundingClientRect(); const r = l?.getBoundingClientRect(); return r ? r.bottom <= b.bottom + 1 && r.top >= b.top : false; });
  if (inBox) break;
  const x = box.x + box.width / 2, y0 = box.y + box.height * 0.8, y1 = box.y + box.height * 0.25;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
  for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 6 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(400);
}
await page.waitForTimeout(Number(process.env.SETTLE ?? 1500));
const last = await page.evaluate(() => { const rs = document.querySelectorAll('[data-testid=rank-row]'); const l = rs[rs.length - 1]; const r = l.getBoundingClientRect(); return { id: Number(l.getAttribute('data-nation')), x: r.left + r.width / 2, y: r.top + r.height / 2, top: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('[data-testid]')?.getAttribute('data-testid'), scrollTop: document.querySelector('.stats-ranking').scrollTop }; });
await page.screenshot({ path: path.join(SHOTS, `${L}_2_scrolled.png`) });
await page.touchscreen.tap(last.x, last.y);
await page.waitForTimeout(700);
out.lastRow = { ...last, selectedAfter: await page.evaluate(() => window.__warsim.hud.selected.value) };
out.lastRow.chosen = out.lastRow.selectedAfter === last.id;
await page.screenshot({ path: path.join(SHOTS, `${L}_3_last_tapped.png`) });
console.log(JSON.stringify(out.lastRow));
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
