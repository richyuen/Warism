// Critic run 40 (new): R28b's overSea now judges every selected land division. Japan, seed 3517, paused: the round
// trip of sim.overSea(ids, Shanghai) for the 1, 4, 16 and all (land, not afloat) Japanese divisions, 20 asks each
// (median, max ms). Then the 16 box-selected, the mouse parked over Shanghai at top speed for 15 s: fps and the
// frame-gap p95 against no selection (as c39_tm_touch measured with one).
// Usage: node critic/scripts/c40_hp_hintperf.mjs
import { launch, open1938, save, settle, CELLS } from './c31_lib.mjs';
const nat = CELLS.tags.JAP;
const out = { asks: [], perf: {} };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, 3517);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const all = await page.evaluate((nat) => { const v = window.__warsim.view; return v.formationsOf(nat).filter((i) => !v.formationAfloat(i)).map((i) => [i, Math.hypot(v.formationPos(i)[0] - 1818.5, v.formationPos(i)[1] - 385.5)]).sort((a, b) => a[1] - b[1]).map((d) => d[0]); }, nat);
  out.nAll = all.length;
  for (const n of [1, 4, 16, all.length]) {
    const r = await page.evaluate(async (ids) => {
      const t = [];
      for (let i = 0; i < 20; i++) { const t0 = performance.now(); await window.__warsim.sim.overSea([...ids].sort((a, b) => a - b), 1715.5, 413.5); t.push(performance.now() - t0); }
      t.sort((a, b) => a - b);
      return { med: +t[10].toFixed(2), max: +t[19].toFixed(2) };
    }, all.slice(0, n));
    out.asks.push({ n, ...r });
  }
  const sel = all.slice(0, 16);
  await page.evaluate(() => { const v = window.__warsim.view; v.controller.set({ cx: 1715.5, cy: 413.5, scale: (v.metresPerPx * v.controller.cam.scale) / 600 }); });
  await page.waitForTimeout(500); await settle(page, 5000);
  const cb = await page.locator('canvas').first().boundingBox();
  const measure = async (tag) => {
    await page.mouse.move(cb.x + cb.width / 2 + 3, cb.y + cb.height / 2 + 3); await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
    out.perf[tag] = await page.evaluate(async () => {
      const gaps = []; let last = performance.now(); let n = 0; const t0 = last; const tick0 = window.__warsim.view.lastTick;
      await new Promise((d) => { const f = (t) => { gaps.push(t - last); last = t; n++; if (t - t0 < 15000) requestAnimationFrame(f); else d(); }; requestAnimationFrame(f); });
      gaps.sort((a, b) => a - b);
      return { fps: +(n / ((last - t0) / 1000)).toFixed(1), p95: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), max: +gaps[gaps.length - 1].toFixed(1), ticks: window.__warsim.view.lastTick - tick0 };
    });
  };
  // top speed, running
  await page.evaluate(() => window.__warsim.player.clearSelection());
  await page.evaluate(() => { const h = window.__warsim.hud; h.setSpeedLevel(99); if (h.paused.value) h.togglePause(); }); await page.waitForTimeout(1000);
  await measure('noSel');
  await page.evaluate((ids) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(ids, false); }, sel);
  await measure('sel16');
  await page.evaluate((ids) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(ids, false); }, all);
  await measure('selAll');
  out.tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  out.marks = await page.evaluate(() => window.__warsim.view.landingMarks);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save('c40_hp_hintperf.json', out);
await browser.close();
console.log(JSON.stringify(out));
