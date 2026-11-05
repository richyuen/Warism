// Critic run 39 (new): R27b's mark on a touch screen. Phone 390x844, hasTouch. Japan, seed 3517, the nearest
// division to Tokyo selected; the camera on Shanghai; landingMark and the tooltip read before a tap, then a tap at
// Shanghai (the order), then read again. Also: the overSea asks per second at top speed with a mouse parked on Shanghai.
import { chromium } from '@playwright/test';
import { open1938, shot, save, settle, CELLS } from './c31_lib.mjs';
const nat = CELLS.tags.JAP;
const out = {};
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e.message)));
try {
  await open1938(page, 3517);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').tap();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const id = await page.evaluate((nat) => { const v = window.__warsim.view; return v.formationsOf(nat).filter((i) => !v.formationAfloat(i)).map((i) => [i, Math.hypot(v.formationPos(i)[0] - 1818.5, v.formationPos(i)[1] - 385.5)]).sort((a, b) => a[1] - b[1])[0][0]; }, nat);
  out.id = id;
  await page.evaluate((id) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect([id], false); window.__warsim.hud.selectFormation(id); }, id);
  await page.evaluate(() => { const v = window.__warsim.view; v.controller.set({ cx: 1715.5, cy: 413.5, scale: (v.metresPerPx * v.controller.cam.scale) / 600 }); });
  await page.waitForTimeout(500); await settle(page, 5000);
  out.before = { mark: await page.evaluate(() => window.__warsim.view.landingMark), tip: await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null), shot: await shot(page, 'c40tm_before.png') };
  const cb = await page.locator('canvas').first().boundingBox();
  await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__warsim.sim.step(1)); await page.waitForTimeout(800);
  out.after = { mark: await page.evaluate(() => window.__warsim.view.landingMark), f: await page.evaluate(async (id) => (await window.__warsim.sim.formation(id))?.voyage ?? null, id), shot: await shot(page, 'c40tm_after.png') };
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
await browser.close();
// performance: mouse parked over Shanghai with a selection, speed max, count overSea calls
const b2 = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const pg = await b2.newPage({ viewport: { width: 1600, height: 900 } });
try {
  await open1938(pg, 3517);
  await pg.evaluate((n) => window.__warsim.view.select(n), nat);
  await pg.waitForTimeout(400);
  await pg.getByTestId('take-control').click();
  await pg.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await pg.evaluate(() => { const s = window.__warsim.sim; const o = s.overSea.bind(s); window.__asks = 0; s.overSea = (...a) => { window.__asks++; return o(...a); }; });
  const run = async (withSel) => {
    await pg.evaluate(({ withSel, nat }) => { const v = window.__warsim.view; const p = window.__warsim.player; p.clearSelection(); if (withSel) { const id = v.formationsOf(nat).filter((i) => !v.formationAfloat(i)).map((i) => [i, Math.hypot(v.formationPos(i)[0] - 1818.5, v.formationPos(i)[1] - 385.5)]).sort((a, b) => a[1] - b[1])[0][0]; p.boxSelect([id], false); } v.controller.set({ cx: 1715.5, cy: 413.5, scale: (v.metresPerPx * v.controller.cam.scale) / 600 }); }, { withSel, nat });
    await pg.waitForTimeout(500);
    await pg.mouse.move(805, 455); await pg.mouse.move(800, 450);
    await pg.evaluate(() => { const h = window.__warsim.hud; h.setSpeedLevel(99); if (h.paused.value) h.togglePause(); });
    const r = await pg.evaluate(async () => { const w = window.__warsim; const a0 = window.__asks, t0 = w.view.lastTick, f0 = w.view.frames, p0 = performance.now(); await new Promise((d) => setTimeout(d, 20000)); const s = (performance.now() - p0) / 1000; return { asksPerS: (window.__asks - a0) / s, ticksPerS: (w.view.lastTick - t0) / s, fps: (w.view.frames - f0) / s }; });
    await pg.evaluate(() => { const h = window.__warsim.hud; if (!h.paused.value) h.togglePause(); });
    return r;
  };
  out.perfNoSel = await run(false);
  out.perfSel = await run(true);
  out.perfNoSel2 = await run(false);
} catch (e) { out.perfFatal = String(e?.stack ?? e).slice(0, 600); }
await b2.close();
save('c40_tm_touch.json', out);
console.log(JSON.stringify(out));
