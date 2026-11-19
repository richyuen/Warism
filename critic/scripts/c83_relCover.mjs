// Critic run 83 (new, R185 off its case): on a sideways phone R185 runs the relations panel down to the bar. What does it
// stand over? 1938 seed after <days> days at W x H, Relations opened (no nation chosen, then a nation chosen in it, so its
// panel stands on the right half): for the war row's banners and "+n", the ticker's rows and the legend, whether each is
// shown and the top element at its centre (covered by what). The relations filters: those whose box lies outside the
// filters' visible box (scrolled out of sight). A shot at each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_relCover.mjs <seed> <days> <W> <H> [nation TAG]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 400), W = Number(process.argv[4] ?? 844), H = Number(process.argv[5] ?? 390);
const NAT = process.argv[6] ?? 'GER';
const TAG = process.env.TAG ?? '';
const L = `c83rc_${seed}_d${days}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
const look = () => page.evaluate(() => {
  const res = [];
  const sel = ['[data-testid=war-banner]', '[data-testid=war-more]', '.ticker .ticker-row, [data-testid=ticker-row]', '[data-testid=map-legend], .map-legend'];
  for (const s of sel) for (const el of document.querySelectorAll(s)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) { res.push({ what: s.split(',')[0], text: el.textContent.trim().slice(0, 30), shown: false }); continue; }
    const x = Math.min(innerWidth - 1, r.left + Math.min(20, r.width / 2)), y = r.top + r.height / 2;
    const t = document.elementFromPoint(x, y);
    const ok = t && (t === el || el.contains(t));
    res.push({ what: s.split(',')[0], text: el.textContent.trim().slice(0, 30), shown: true, coveredBy: ok ? null : (t?.closest('[data-testid]')?.getAttribute('data-testid') ?? t?.className?.toString().slice(0, 30) ?? null) });
  }
  const f = document.querySelector('.relations-filters');
  let hiddenFilters = [];
  if (f) {
    const fr = f.getBoundingClientRect();
    hiddenFilters = [...f.children].filter((c) => { const r = c.getBoundingClientRect(); return r.right > fr.right + 1 || r.left < fr.left - 1; }).map((c) => c.textContent.trim().slice(0, 20) || c.tagName);
  }
  const g = document.querySelector('[data-testid=relations-panel]')?.getBoundingClientRect();
  return { items: res, covered: res.filter((r) => r.shown && r.coveredBy).length, of: res.filter((r) => r.shown).length, hiddenFilters, relPanel: g ? [Math.round(g.left), Math.round(g.top), Math.round(g.right), Math.round(g.bottom)] : null };
});
const out = { seed, days, W, H, steps: [] };
const step = async (name) => {
  const s = await look();
  await page.screenshot({ path: path.join(SHOTS, `${L}_${name}.png`) });
  out.steps.push({ name, ...s, shot: `critic/shots/${L}_${name}.png` });
  console.log(name, JSON.stringify({ covered: s.covered, of: s.of, by: [...new Set(s.items.filter((i) => i.coveredBy).map((i) => `${i.what}<${i.coveredBy}`))], hiddenFilters: s.hiddenFilters, relPanel: s.relPanel }));
};
await step('0_closed');
await page.getByTestId('relations-btn').tap();
await page.waitForTimeout(800);
await step('1_relations');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await page.waitForTimeout(800);
await step('2_nation_chosen');
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
