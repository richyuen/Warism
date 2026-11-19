// Critic run 83 (new, R186 off its case): R186 caps a nation's panel on every upright phone 760 px tall or less, to leave a
// strip of map under it. What is left of the panel itself? 1938 seed after <days> days at W x H (a touch phone), NAT's
// panel; for each of its tabs (Overview, and every tab-* button), with God Mode off then on (its tools' second bar row):
// the panel's box, its visible height against its content (clientHeight / scrollHeight), the map strip left under it
// (to the top of the ticker or the war row, whichever is higher), and how many finger-swipes of the panel's own height
// reach its foot. A shot of each.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_panelShort.mjs <seed> <days> <W> <H> [nation TAG]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 83941), days = Number(process.argv[3] ?? 120), W = Number(process.argv[4] ?? 360), H = Number(process.argv[5] ?? 640);
const NAT = process.argv[6] ?? 'GER';
const TAG = process.env.TAG ?? '';
const L = `c83ps_${seed}_d${days}_${W}x${H}_${NAT}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await page.waitForTimeout(800);
const geom = () => page.evaluate(() => {
  const p = document.querySelector('[data-testid=nation-panel]');
  if (!p) return { panel: null };
  const r = p.getBoundingClientRect();
  const below = [...document.querySelectorAll('[data-testid=ticker], [data-testid=war-banners], .bottombar')].map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0 && b.top > r.top);
  const floor = below.length ? Math.min(...below.map((b) => b.top)) : innerHeight;
  return { panel: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], visible: p.clientHeight, content: p.scrollHeight, shownShare: Math.round((100 * p.clientHeight) / p.scrollHeight), mapStrip: Math.round(floor - r.bottom), swipes: Math.max(0, Math.ceil((p.scrollHeight - p.clientHeight) / Math.max(1, p.clientHeight * 0.8))) };
});
const tabs = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=tab-]')].map((b) => b.getAttribute('data-testid')));
const out = { seed, days, W, H, nat: NAT, tabs, steps: [] };
for (const god of [false, true]) {
  if (god) { await page.getByTestId('god-btn').tap().catch(() => null); await page.waitForTimeout(700); }
  const now = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=tab-]')].map((b) => b.getAttribute('data-testid')));
  for (const t of ['(as opened)', ...now]) {
    if (t !== '(as opened)') { const b = page.getByTestId(t); if (!(await b.isVisible().catch(() => false))) { await b.scrollIntoViewIfNeeded().catch(() => null); } await b.tap().catch(() => null); await page.waitForTimeout(500); }
    await page.evaluate(() => { const p = document.querySelector('[data-testid=nation-panel]'); if (p) p.scrollTop = 0; });
    const g = await geom();
    const name = `${god ? 'god' : 'plain'}_${t.replace(/\W+/g, '')}`;
    await page.screenshot({ path: path.join(SHOTS, `${L}_${name}.png`) });
    const s = { god, tab: t, ...g, shot: `critic/shots/${L}_${name}.png` };
    out.steps.push(s);
    console.log(JSON.stringify({ god, tab: t, panel: g.panel, visible: g.visible, content: g.content, shownShare: g.shownShare, mapStrip: g.mapStrip, swipes: g.swipes }));
  }
}
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
