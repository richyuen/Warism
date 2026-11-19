// Critic run 84 (new, R190 off its case): only the panel "Go to country" opened leaves a strip of map on a short upright
// phone (`hud.wentTo`, the panel's `go-strip`). Routes the item's case does not take, on a touch phone W x H:
//  1 A chosen, a chip of A's panel -> Go to B          (B's panel: strip expected, B's capital on the map)
//  2 from B's panel, a chip -> Go to C                  (a Go to after a Go to: strip expected on C)
//  3 C chosen again by a tap on its own capital point  (the same nation: strip kept or not, read)
//  4 History opened and closed over the panel          (strip expected kept)
//  5 turned sideways and back upright                   (strip expected kept upright)
//  6 another nation D chosen from the Ranking or map    (no strip expected)
//  7 D's chip -> Go to E, then the panel's x, then E chosen again (no strip expected: not Go to's panel)
// At each: wentTo, selected, the panel's class, its visible height and content, the map strip under it, where the
// selected nation's capital lies on screen and what is on top there. A shot each.
// Usage: [BASE=...] [TAG=] node critic/scripts/c84_goChain.mjs <seed> <days> <W> <H> <A TAG> [D TAG]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84937), days = Number(process.argv[3] ?? 300), W = Number(process.argv[4] ?? 360), H = Number(process.argv[5] ?? 640);
const A = process.argv[6] ?? 'GER', D = process.argv[7] ?? 'BRA';
const TAG = process.env.TAG ?? '';
const L = `c84gc_${seed}_d${days}_${W}x${H}_${A}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(600);
const read = () => page.evaluate(() => {
  const h = window.__warsim.hud, v = window.__warsim.view;
  const p = document.querySelector('[data-testid=nation-panel]');
  const sel = h.selected.value;
  let pan = null;
  if (p) {
    const r = p.getBoundingClientRect();
    const below = [...document.querySelectorAll('[data-testid=ticker], [data-testid=war-banners], .bottombar')].map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0 && b.top > r.top);
    const floor = below.length ? Math.min(...below.map((b) => b.top)) : innerHeight;
    pan = { cls: p.className, nation: Number(p.dataset.nation), visible: p.clientHeight, content: p.scrollHeight, strip: Math.round(floor - r.bottom), bottom: Math.round(r.bottom) };
  }
  let cap = null;
  const c = v.capitalOf ? v.capitalOf(sel) : null;
  if (c) {
    const cam = v.controller.cam, el = v.canvas ?? document.querySelector('canvas'), at = el.getBoundingClientRect();
    const px = (c[0] - cam.cx) * cam.scale + el.clientWidth / 2 + at.left, py = (c[1] - cam.cy) * cam.scale + el.clientHeight / 2 + at.top;
    const t = px >= 0 && py >= 0 && px < innerWidth && py < innerHeight ? document.elementFromPoint(px, py) : null;
    cap = { px: [Math.round(px), Math.round(py)], top: t ? (t === el ? 'map' : (t.closest('[data-testid]')?.getAttribute('data-testid') ?? t.tagName)) : 'off screen' };
  }
  return { wentTo: h.wentTo?.value ?? null, selected: sel, panel: pan, cap };
});
const out = { seed, days, W, H, steps: [] };
const step = async (name, note = '') => {
  await page.waitForTimeout(2600);
  const g = await read();
  const shot = `${L}_${out.steps.length}_${name}.png`;
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const s = { name, note, ...g, shot: `critic/shots/${shot}` };
  out.steps.push(s);
  console.log(JSON.stringify({ name, note, wentTo: g.wentTo, selected: g.selected, cls: g.panel?.cls, visible: g.panel?.visible, content: g.panel?.content, strip: g.panel?.strip, cap: g.cap?.top }));
};
const goChip = async (k = 0) => {
  const chips = page.locator('[data-testid=nation-panel] [data-testid=nation-chip]');
  const n = await chips.count();
  for (let j = k; j < n; j++) {
    const chip = chips.nth(j);
    const txt = (await chip.innerText()).trim().slice(0, 30);
    await chip.scrollIntoViewIfNeeded().catch(() => null);
    await chip.tap().catch(() => null);
    await page.waitForTimeout(400);
    const go = page.locator('[data-testid=nation-menu-goto]');
    if (await go.count()) { await go.tap(); return txt; }
    await page.keyboard.press('Escape').catch(() => null);
    await page.mouse.click(1, 1).catch(() => null);
  }
  return null;
};
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[A]);
await page.waitForTimeout(700);
await step('0_A_chosen');
const b = await goChip(0);
await step('1_goto_B', b ?? 'no chip');
const c2 = await goChip(0);
await step('2_goto_C', c2 ?? 'no chip');
// the same nation tapped again on the map at its capital, if on the map
const g = await read();
if (g.cap?.top === 'map') { await page.touchscreen.tap(g.cap.px[0], g.cap.px[1]); }
await step('3_same_tapped', g.cap?.top ?? '');
const hb = page.getByTestId('history-btn');
if (await hb.isVisible().catch(() => false)) {
  await hb.tap(); await page.waitForTimeout(800);
  await step('4a_history_open');
  const close = page.locator('[data-testid=history-close]');
  if (await close.count()) await close.first().tap(); else await hb.tap();
}
await step('4b_history_closed');
await page.setViewportSize({ width: H, height: W });
await step('5a_sideways');
await page.setViewportSize({ width: W, height: H });
await step('5b_upright');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[D]);
await step('6_D_chosen');
const e = await goChip(0);
await step('7a_goto_E', e ?? 'no chip');
const eid = await page.evaluate(() => window.__warsim.hud.selected.value);
const x = page.getByTestId('nation-close');
if (await x.count()) await x.tap();
await page.waitForTimeout(500);
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), eid);
await step('7b_E_again');
out.errors = errors;
save(`${L}.json`, out);
console.log('errors', errors.length);
await browser.close();
