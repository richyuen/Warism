// Critic run 80 (new, R173): a nation's menu opened from a nation panel's chip on a phone, then a tap outside it (the
// Relations button), then a real two-finger pinch on the relations graph (CDP touch events). Does the menu close, does
// the pinch zoom, and does a tap inside the menu still act ("Go to country" moves the camera)? Also the desk: a
// right-click menu on the map, a click on the History button. Errors counted.
// Usage: [BASE=...] [TAG=] node critic/scripts/c85_menuPinch.mjs <seed> [W H]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68931), W = Number(process.argv[3] ?? 390), H = Number(process.argv[4] ?? 844);
const TAG = process.env.TAG ?? '';
const L = `c85mp_${seed}_${W}x${H}${TAG}`;
const out = { seed, W, H, base: BASE, steps: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
const shot = async (n) => { await page.screenshot({ path: path.join(SHOTS, `${L}_${n}.png`) }); return `critic/shots/${L}_${n}.png`; };
const step = (name, o) => { out.steps.push({ name, ...o }); console.log(name, JSON.stringify(o)); };
const menuN = () => page.locator('[data-testid=nation-menu]').count();
const cam = () => page.evaluate(() => { const c = window.__warsim.view.controller.cam; return [+c.cx.toFixed(1), +c.cy.toFixed(1)]; });
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  const ger = CELLS.tags.GER;
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), ger);
  await page.waitForSelector('[data-testid=nation-panel]', { timeout: 10_000 });
  const chips = page.locator('[data-testid=nation-chip]');
  const nChips = await chips.count();
  step('panel', { ger, chips: nChips });
  if (nChips === 0) throw new Error('no chip on the panel');
  // 1. Chip menu, then "Go to country" tapped inside: it acts.
  const c0 = await cam();
  await chips.first().scrollIntoViewIfNeeded();
  await chips.first().tap();
  await page.waitForTimeout(300);
  step('chip menu opened', { menus: await menuN(), shot: await shot('1_chipmenu') });
  const go = page.locator('[data-testid=nation-menu-goto]');
  if (await go.count()) {
    await go.tap();
    await page.waitForTimeout(3000);
    step('goto tapped', { menus: await menuN(), camBefore: c0, camAfter: await cam() });
  } else step('goto missing', {});
  // 2. Chip menu again, then a tap on Relations (outside the menu).
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), ger);
  await page.waitForSelector('[data-testid=nation-chip]', { timeout: 10_000 });
  await chips.first().tap();
  await page.waitForTimeout(300);
  const before = await menuN();
  const rel = page.getByTestId('relations-btn');
  await rel.scrollIntoViewIfNeeded();
  await rel.tap();
  await page.waitForTimeout(600);
  const graph = page.getByTestId('relations-graph');
  const gVis = await graph.isVisible().catch(() => false);
  const covered = await page.evaluate(() => {
    const g = document.querySelector('[data-testid=relations-graph]');
    if (!g) return null;
    const r = g.getBoundingClientRect();
    let hidden = 0, n = 0;
    for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
      const x = r.left + (r.width * i) / 10, y = r.top + (r.height * j) / 10;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      n++;
      const top = document.elementFromPoint(x, y);
      if (!(top && (top === g || g.contains(top)))) hidden++;
    }
    return { graphBox: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], hiddenOf81: hidden, sampled: n, panelOpen: !!document.querySelector('[data-testid=nation-panel]') };
  });
  step('relations tapped with a menu open', { menusBefore: before, menusAfter: await menuN(), graph: gVis, covered, shot: await shot('2_relations') });
  // 3. A real pinch out on the graph (two touch points, CDP), the nation panel closed first.
  const closeBtn = page.locator('[data-testid=nation-panel] button', { hasText: '×' });
  if (await closeBtn.count()) { await closeBtn.first().tap(); await page.waitForTimeout(400); }
  step('panel closed', { panelOpen: await page.locator('[data-testid=nation-panel]').count(), shot: await shot('2b_graph') });
  if (gVis) {
    const z0 = Number(await graph.getAttribute('data-zoom'));
    const b = await graph.boundingBox();
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    const cdp = await ctx.newCDPSession(page);
    const pts = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(20) });
    for (let d = 25; d <= 90; d += 5) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) }); await page.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(500);
    const z1 = Number(await graph.getAttribute('data-zoom'));
    step('pinch out', { z0, z1, zoomed: z1 > z0, menus: await menuN(), shot: await shot('3_pinched') });
    // 4. A tap on a node after the pinch selects it?
    const pick = await page.evaluate(() => {
      const g = document.querySelector('[data-testid=relations-graph]').getBoundingClientRect();
      for (const n of document.querySelectorAll('[data-testid^=relations-node-]')) {
        const c = n.querySelector('circle'); if (!c) continue;
        const r = c.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
        if (x > g.left + 20 && x < g.right - 20 && y > g.top + 20 && y < g.bottom - 20) {
          const top = document.elementFromPoint(x, y);
          if (top && n.contains(top)) return { id: n.getAttribute('data-testid'), x, y };
        }
      }
      return null;
    });
    if (pick) { await page.touchscreen.tap(pick.x, pick.y); await page.waitForTimeout(600); }
    step('node tapped after the pinch', { pick, selected: await page.evaluate(() => window.__warsim.hud.selected.value), shot: await shot('4_nodetap') });
  }
  // 5. A menu opened by a long press on the map, then a tap on the map elsewhere and on a HUD button.
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => window.__warsim.player.openMenu(1, 120, 300));
  await page.waitForTimeout(200);
  const o1 = await menuN();
  const hb = page.getByTestId('history-btn');
  if (await hb.isVisible().catch(() => false)) { await hb.tap(); await page.waitForTimeout(400); }
  step('menu then History tapped', { opened: o1, after: await menuN(), history: await page.getByTestId('history-panel').isVisible().catch(() => false), shot: await shot('5_history') });
} catch (e) {
  step('FAILED', { err: String(e).slice(0, 300), shot: await shot('fail').catch(() => null) });
}
out.errors = errors;
console.log('errors', errors.length, errors.slice(0, 5));
save(`${L}.json`, out);
await browser.close();
