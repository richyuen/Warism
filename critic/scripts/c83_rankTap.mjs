// Critic run 83 (R188 off its case): on a sideways phone, which of the opened Ranking's rows can a finger choose? 1938 seed
// after <days> days at W x H, the Ranking opened: (a) row 3 tapped as opened; (b) the box scrolled by script to its foot,
// the last row tapped; (c) the box swiped by a finger to its foot (CDP touch events), the next-to-last row tapped after
// 1.5 s. After each: the nation chosen or not, the top element at the tap; the choice undone (Escape) between.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_rankTap.mjs <seed> <days> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 83951), days = Number(process.argv[3] ?? 300), W = Number(process.argv[4] ?? 844), H = Number(process.argv[5] ?? 390);
const TAG = process.env.TAG ?? '';
const L = `c83rt2_${seed}_d${days}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
const out = { seed, days, W, H, cases: [] };
const openRanking = async () => {
  await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
  await page.waitForTimeout(400);
  if (!(await page.locator('[data-testid=rank-row]').first().isVisible().catch(() => false))) { await page.getByTestId('ranking-toggle').tap(); await page.waitForTimeout(600); }
};
const tapRow = async (idx, name) => {
  const r = await page.evaluate((idx) => { const rs = document.querySelectorAll('[data-testid=rank-row]'); const l = rs[idx < 0 ? rs.length + idx : idx]; const b = l.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const t = document.elementFromPoint(x, y); return { id: Number(l.getAttribute('data-nation')), x, y, top: t?.closest('[data-testid]')?.getAttribute('data-testid') ?? t?.className, scrollTop: document.querySelector('.stats-ranking').scrollTop, box: (() => { const q = document.querySelector('.stats-ranking').getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)]; })() }; }, idx);
  await page.touchscreen.tap(r.x, r.y);
  await page.waitForTimeout(700);
  const sel = await page.evaluate(() => window.__warsim.hud.selected.value);
  await page.screenshot({ path: path.join(SHOTS, `${L}_${name}.png`) });
  const c = { name, ...r, selectedAfter: sel, chosen: sel === r.id, shot: `critic/shots/${L}_${name}.png` };
  out.cases.push(c);
  console.log(JSON.stringify(c));
};
await openRanking();
await tapRow(2, 'a_row3_as_opened');
await openRanking();
await page.evaluate(() => { const b = document.querySelector('.stats-ranking'); b.scrollTop = b.scrollHeight; });
await page.waitForTimeout(500);
await tapRow(-1, 'b_last_after_script_scroll');
await openRanking();
await page.evaluate(() => { const b = document.querySelector('.stats-ranking'); b.scrollTop = 0; });
const box = await page.locator('.stats-ranking').boundingBox();
const cdp = await ctx.newCDPSession(page);
for (let i = 0; i < 3; i++) {
  const x = box.x + box.width / 2, y0 = box.y + box.height * 0.8, y1 = box.y + box.height * 0.25;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
  for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 6 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(400);
}
await page.waitForTimeout(1500);
await tapRow(-2, 'c_next_to_last_after_swipe');
await tapRow(-1, 'd_last_tapped_again');
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
