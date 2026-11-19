// Critic run 86 (new, R198 off its case). R198 says "<Kind> hidden/shown" in the relations footer on a filter's tap. Routes
// its case does not take: every filter hidden in turn without showing it again (the last tap leaves no line: does the
// footer still say the graph is empty?), then shown again one by one; a nation tapped, then a filter (does the kind's line
// replace the nation's?); the footer's text cut or out of the panel; at 568x320 touch (dpr 2), 844x390 touch and 1600x900.
// Usage: [BASE=...] node critic/scripts/c86_relSaid.mjs <seed> <days>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84903), days = Number(process.argv[3] ?? 400);
const L = `c86rs_${seed}_d${days}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const out = { seed, days, sizes: [] };
const errors = [];
const read = (page) => page.evaluate(() => {
  const f = document.querySelector('[data-testid=relations-said]');
  const p = document.querySelector('[data-testid=relations-panel]');
  const fb = f?.getBoundingClientRect(), pb = p?.getBoundingClientRect();
  return {
    said: f?.innerText.trim() ?? null,
    lines: document.querySelectorAll('[data-testid=relations-panel] .relations-edge').length,
    cut: f ? f.scrollWidth > f.clientWidth + 1 || f.scrollHeight > f.clientHeight + 1 : null,
    inPanel: fb && pb ? fb.bottom <= pb.bottom + 0.5 && fb.top >= pb.top - 0.5 : null,
    inView: fb ? fb.bottom <= innerHeight && fb.top >= 0 : null,
  };
});
for (const [w, h, touch, dpr] of [[568, 320, true, 2], [844, 390, true, 2], [1600, 900, false, 1]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days) await hours(page, 24 * days);
  await page.waitForTimeout(800);
  const tap = async (loc) => {
    const bb = await loc.boundingBox();
    if (!bb) return false;
    if (touch) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
    else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(400);
    return true;
  };
  await tap(page.getByTestId('relations-btn'));
  await page.waitForTimeout(600);
  const steps = [];
  steps.push({ step: 'open', ...(await read(page)) });
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=relations-kind-]')].map((e) => e.getAttribute('data-testid')));
  for (const id of ids) { await tap(page.getByTestId(id)); steps.push({ step: `off ${id}`, ...(await read(page)) }); }
  await page.screenshot({ path: path.join(SHOTS, `${L}_${w}x${h}_alloff.png`) });
  for (const id of ids) { await tap(page.getByTestId(id)); steps.push({ step: `on ${id}`, ...(await read(page)) }); }
  // A nation, then a filter, then the nation again.
  const node = page.locator('[data-testid^=relations-node-]').first();
  if (await node.count()) {
    await tap(node);
    steps.push({ step: 'nation', ...(await read(page)) });
    await tap(page.getByTestId(ids[0]));
    steps.push({ step: `nation then off ${ids[0]}`, ...(await read(page)) });
    await page.screenshot({ path: path.join(SHOTS, `${L}_${w}x${h}_nation_off.png`) });
    await tap(page.getByTestId(ids[0]));
    steps.push({ step: `on ${ids[0]}`, ...(await read(page)) });
  }
  for (const s of steps) console.log(w, h, JSON.stringify(s));
  out.sizes.push({ w, h, steps, emptyButSaysOther: steps.filter((s) => s.lines === 0 && !/No ties/.test(s.said ?? '')).map((s) => `${s.step}: "${s.said}"`), cut: steps.filter((s) => s.cut).map((s) => s.step), outOfPanel: steps.filter((s) => s.inPanel === false || s.inView === false).map((s) => s.step) });
  await ctx.close();
}
out.errors = errors;
console.log('summary', JSON.stringify(out.sizes.map((s) => ({ w: s.w, empty: s.emptyButSaysOther, cut: s.cut, out: s.outOfPanel }))), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
