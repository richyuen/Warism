// Critic run 31 (focused, ROADMAP R11): the relations graph's zoom on a phone, as a player meets it.
// 1938 seed <seed>, heroes on, after <days> days, 390 x 844 touch: open Relations; label heights in CSS px at the whole
// graph, then after 1..4 taps of "+"; a one-finger drag (does it pan? does it select?); a tap on a node after the drag
// (does it select?); "Whole graph"; the labels overlapping each other at each zoom. Shots.
// Usage: node critic/scripts/c43_rgz_zoom.mjs <seed> <days>
import { chromium } from '@playwright/test';
import { BASE, shot, save, hours, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111), days = Number(process.argv[3] ?? 365);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
const out = { seed, days, steps: [] };
const read = () => page.evaluate(() => {
  const g = document.querySelector('[data-testid=relations-graph]');
  const gr = g.getBoundingClientRect();
  const labels = [...g.querySelectorAll('text')].map((t) => { const r = t.getBoundingClientRect(); return { t: t.textContent, x: r.x, y: r.y, w: r.width, h: r.height, in: r.x >= gr.x && r.right <= gr.right && r.y >= gr.y && r.bottom <= gr.bottom }; }).filter((l) => l.in && l.h > 0);
  let over = 0;
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) { const a = labels[i], b = labels[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) over++; }
  const hs = labels.map((l) => l.h).sort((a, b) => a - b);
  return { zoom: g.getAttribute('data-zoom'), viewBox: g.getAttribute('viewBox'), box: [gr.x, gr.y, gr.width, gr.height].map(Math.round), labelsInView: labels.length, labelH: hs.length ? { min: +hs[0].toFixed(1), med: +hs[hs.length >> 1].toFixed(1) } : null, overlaps: over, said: document.querySelector('[data-testid=relations-said]')?.innerText ?? null, sample: labels.slice(0, 6).map((l) => l.t) };
});
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days > 0) await hours(page, days * 24);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Relations', exact: true }).tap();
  await page.waitForSelector('[data-testid=relations-graph]', { timeout: 30_000 });
  await page.waitForTimeout(800);
  out.steps.push({ step: 'whole', ...(await read()), shot: await shot(page, `c43rgz_${seed}_whole.png`) });
  for (let k = 1; k <= 4; k++) {
    await page.locator('[data-testid=relations-zoom-in]').tap();
    await page.waitForTimeout(400);
    out.steps.push({ step: `plus${k}`, ...(await read()), shot: await shot(page, `c43rgz_${seed}_plus${k}.png`) });
  }
  // A one-finger drag across the graph, by touch events through CDP.
  const b = (await read()).box;
  const cdp = await ctx.newCDPSession(page);
  const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const sx = b[0] + b[2] * 0.7, sy = b[1] + b[3] * 0.6;
  await t('touchStart', sx, sy);
  for (let i = 1; i <= 10; i++) await t('touchMove', sx - i * 15, sy - i * 6);
  await t('touchEnd', 0, 0);
  await page.waitForTimeout(500);
  const selAfterDrag = await page.evaluate(() => window.__warsim.view.selectedNation ?? window.__warsim.hud.selected?.value ?? null);
  out.steps.push({ step: 'drag', ...(await read()), selAfterDrag, shot: await shot(page, `c43rgz_${seed}_drag.png`) });
  // A tap on a node in view after the drag.
  const node = await page.evaluate(() => { const g = document.querySelector('[data-testid=relations-graph]').getBoundingClientRect(); const all = [...document.querySelectorAll('[data-testid^=relations-node-] circle')].map((c) => ({ id: c.closest('[data-testid]').getAttribute('data-testid'), r: c.getBoundingClientRect() })).find((c) => c.r.x > g.x + 20 && c.r.right < g.right - 20 && c.r.y > g.y + 20 && c.r.bottom < g.bottom - 20); return all ? { id: all.id, x: all.r.x + all.r.width / 2, y: all.r.y + all.r.height / 2, d: all.r.width } : null; });
  if (node) {
    await page.touchscreen.tap(node.x, node.y);
    await page.waitForTimeout(700);
    out.steps.push({ step: 'tapNode', node, ...(await read()), panel: await page.evaluate(() => [...document.querySelectorAll('aside, .panel')].map((e) => e.innerText.split('\n').slice(0, 3).join(' | ')).filter((x) => /Overview|Take control/.test(x)).slice(0, 2)), shot: await shot(page, `c43rgz_${seed}_tapnode.png`) });
  }
  // A pinch out (two fingers apart) on the whole graph.
  await page.locator('[data-testid=relations-zoom-reset]').tap().catch(() => {});
  await page.waitForTimeout(400);
  const b2 = (await read()).box; const mx = b2[0] + b2[2] / 2, my = b2[1] + b2[3] / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: mx - 20, y: my, id: 1 }, { x: mx + 20, y: my, id: 2 }] });
  for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: mx - 20 - i * 8, y: my, id: 1 }, { x: mx + 20 + i * 8, y: my, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(500);
  out.steps.push({ step: 'pinch', ...(await read()), shot: await shot(page, `c43rgz_${seed}_pinch.png`) });
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c43_rgz_${seed}.json`, out);
await browser.close();
for (const s of out.steps) console.log(s.step, s.zoom, JSON.stringify(s.labelH), s.labelsInView, s.overlaps, s.selAfterDrag ?? '', s.panel ? JSON.stringify(s.panel) : '');
console.log(out.fatal ?? '', errors.length);
