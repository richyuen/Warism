// Critic run 84 (new, R191 off its case): on a sideways phone the relations filters wrap and the zoom's buttons stand in
// the header beside the x. At each size of SIZES in turn (a touch page, one window resized; default the sideways phones
// 568x320, 640x360, 667x375, 740x360, 844x390, 932x430, a short desk 1280x480, upright 390x844, then 667x375 again),
// Relations open with no nation chosen: for every filter checkbox, the focus selector, the zoom's three buttons, the x and
// the title, its box, whether it lies inside the viewport and inside the panel's visible box, the top element at its centre
// (seen), and the header's controls that overlap each other; the graph's height; then each filter tapped (its checked state
// must flip) and tapped back. Then a nation chosen (its panel on the right half) and the same read. A shot at each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c84_relSide.mjs <seed> <days> [WxH,...] [nation TAG]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84903), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '568x320,640x360,667x375,740x360,844x390,932x430,1280x480,390x844,667x375').split(',').map((s) => s.split('x').map(Number));
const NAT = process.argv[5] ?? 'GER';
const TAG = process.env.TAG ?? '';
const L = `c84rs_${seed}_d${days}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const [W0, H0] = sizes[0];
const ctx = await browser.newContext({ viewport: { width: W0, height: H0 }, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(600);
const read = () => page.evaluate(() => {
  const P = document.querySelector('[data-testid=relations-panel]');
  if (!P) return { panel: null };
  const pr = P.getBoundingClientRect();
  const box = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
  const ctl = [
    ...[...P.querySelectorAll('[data-testid^=relations-kind-]')].map((e) => ({ id: e.getAttribute('data-testid'), el: e, lab: e.closest('label') })),
    { id: 'relations-focus', el: P.querySelector('[data-testid=relations-focus]') },
    { id: 'relations-zoom-out', el: P.querySelector('[data-testid=relations-zoom-out]') },
    { id: 'relations-zoom-in', el: P.querySelector('[data-testid=relations-zoom-in]') },
    { id: 'relations-zoom-reset', el: P.querySelector('[data-testid=relations-zoom-reset]') },
    { id: 'relations-close', el: P.querySelector('[data-testid=relations-close]') },
    { id: 'title', el: P.querySelector('.ranking-head > span') },
  ].filter((c) => c.el);
  const res = ctl.map((c) => {
    const r = c.el.getBoundingClientRect();
    const inView = r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
    const inPanel = r.left >= pr.left - 0.5 && r.top >= pr.top - 0.5 && r.right <= pr.right + 0.5 && r.bottom <= pr.bottom + 0.5;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const t = r.width > 0 && cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight ? document.elementFromPoint(cx, cy) : null;
    const seen = !!t && (t === c.el || c.el.contains(t) || (c.lab && c.lab.contains(t)));
    return { id: c.id, box: box(r), w: Math.round(r.width), inView, inPanel, seen, top: seen ? null : (t?.closest('[data-testid]')?.getAttribute('data-testid') ?? t?.className?.toString().slice(0, 30) ?? 'none') };
  });
  const head = res.filter((c) => /zoom|close|title/.test(c.id));
  const overlaps = [];
  for (let i = 0; i < head.length; i++) for (let j = i + 1; j < head.length; j++) {
    const a = head[i].box, b = head[j].box;
    const ox = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), oy = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
    if (ox > 0.5 && oy > 0.5) overlaps.push(`${head[i].id}x${head[j].id}:${Math.round(ox)}x${Math.round(oy)}`);
  }
  const svg = P.querySelector('svg');
  const fl = P.querySelector('.relations-filters')?.getBoundingClientRect();
  return { panel: box(pr), graphH: svg ? Math.round(svg.getBoundingClientRect().height) : null, filterRows: fl ? Math.round(fl.height) : null, bad: res.filter((c) => !c.inView || !c.inPanel || !c.seen).map((c) => `${c.id}${c.inView ? '' : '/offview'}${c.inPanel ? '' : '/outpanel'}${c.seen ? '' : '/under:' + c.top}`), overlaps, controls: res };
});
const tapFilters = async () => {
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=relations-kind-]')].map((e) => e.getAttribute('data-testid')));
  const dead = [];
  for (const id of ids) {
    const loc = page.getByTestId(id);
    const before = await loc.isChecked().catch(() => null);
    const b = await loc.boundingBox();
    if (!b) { dead.push(`${id}:nobox`); continue; }
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(250);
    const after = await loc.isChecked().catch(() => null);
    if (after === before) dead.push(id);
    else { await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(250); }
  }
  return dead;
};
const out = { seed, days, steps: [] };
let i = 0;
for (const [W, H] of sizes) {
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(900);
  if (!(await page.locator('[data-testid=relations-panel]').count())) {
    const b = page.getByTestId('relations-btn');
    if (await b.isVisible().catch(() => false)) { await b.tap().catch(() => null); await page.waitForTimeout(800); }
  }
  for (const withNat of [false, true]) {
    await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), withNat ? CELLS.tags[NAT] : 0);
    await page.waitForTimeout(700);
    const g = await read();
    const dead = g.panel ? await tapFilters() : null;
    const name = `${L}_${i}_${W}x${H}_${withNat ? NAT : 'none'}.png`;
    await page.screenshot({ path: path.join(SHOTS, name) });
    const s = { i, W, H, nation: withNat ? NAT : null, panel: g.panel, graphH: g.graphH, filterRows: g.filterRows, bad: g.bad, overlaps: g.overlaps, deadTaps: dead, shot: `critic/shots/${name}`, controls: g.controls };
    out.steps.push(s);
    console.log(JSON.stringify({ W, H, nation: s.nation, panel: s.panel, graphH: s.graphH, filterRows: s.filterRows, bad: s.bad, overlaps: s.overlaps, deadTaps: dead }));
  }
  await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
  i++;
}
out.summary = { steps: out.steps.length, withBad: out.steps.filter((s) => s.bad?.length).length, withOverlap: out.steps.filter((s) => s.overlaps?.length).length, withDead: out.steps.filter((s) => s.deadTaps?.length).length, noPanel: out.steps.filter((s) => !s.panel).length, minGraph: Math.min(...out.steps.filter((s) => s.graphH != null).map((s) => s.graphH)) };
out.errors = errors;
console.log('summary', JSON.stringify(out.summary), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
