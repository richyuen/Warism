// Critic run 83 (new, R183's follow-up off its case): the phone's closed row shows "the banners that fit" (`fit`), which
// only falls and is counted again on a window resize, a change of the row's own width, or a change in the number of wars.
// A phone turned and a panel opened and closed: upright, on its side, a nation's panel opened there (the row narrows), the
// panel closed, turned upright again, then the world run D days with the panel closed. At each step: the banners shown,
// "+n", the room left in the row; then a 1 px resize and back (which counts the fit again) and the banners shown after.
// A step where the nudge shows more banners is a stale fit (the row said less than it had room for). Shots of the row.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_rotate.mjs <seed> <days> <nation TAG> [run days, default 20]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours, CELLS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 400), NAT = process.argv[4] ?? 'GER', RUN = Number(process.argv[5] ?? 20);
const TAG = process.env.TAG ?? '';
const L = `c83ro_${seed}_d${days}_${NAT}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
const geom = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  if (!row) return { shown: 0 };
  const rr = row.getBoundingClientRect();
  const last = [...row.children].at(-1)?.getBoundingClientRect();
  return { wars: window.__warsim.hud.stats.value.wars.length, shown: row.querySelectorAll('[data-testid=war-banner]').length, more: row.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null, rowW: Math.round(rr.width), roomLeft: last ? Math.round(rr.right - last.right) : null, overflow: Math.round(row.scrollWidth - row.clientWidth), panel: !!document.querySelector('[data-testid=nation-panel]') };
});
const rowShot = async (name) => {
  const b = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
  const vp = page.viewportSize();
  if (!b) return null;
  const x = Math.max(0, b.x - 4);
  await page.screenshot({ path: path.join(SHOTS, name), clip: { x, y: Math.max(0, b.y - 4), width: Math.min(vp.width - x, b.width + 8), height: b.height + 8 } });
  return `critic/shots/${name}`;
};
const out = { seed, days, nat: NAT, steps: [], stale: 0 };
const step = async (name) => {
  await page.waitForTimeout(1000);
  const before = await geom();
  const shotB = await rowShot(`${L}_${out.steps.length}_${name.replace(/\W+/g, '_')}.png`);
  const vp = page.viewportSize();
  await page.setViewportSize({ width: vp.width + 1, height: vp.height });
  await page.waitForTimeout(200);
  await page.setViewportSize(vp);
  await page.waitForTimeout(600);
  const after = await geom();
  const s = { name, ...vp, before, after: { shown: after.shown, more: after.more, roomLeft: after.roomLeft }, stale: after.shown > before.shown && after.wars === before.wars, shot: shotB };
  if (s.stale) { out.stale++; s.shotAfter = await rowShot(`${L}_${out.steps.length}_${name.replace(/\W+/g, '_')}_nudged.png`); }
  out.steps.push(s);
  console.log(JSON.stringify({ step: name, W: vp.width, H: vp.height, shown: before.shown, more: before.more, room: before.roomLeft, ov: before.overflow, afterNudge: after.shown, stale: s.stale }));
};
await step('1 upright');
await page.setViewportSize({ width: 844, height: 390 });
await step('2 on its side');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await step('3 side, panel opened');
await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
await step('4 side, panel closed');
await page.setViewportSize({ width: 390, height: 844 });
await step('5 upright again');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(800);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
await step('6 panel opened on its side, turned upright, closed');
if (RUN) { await hours(page, 24 * RUN); await step(`7 run ${RUN} days`); }
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
