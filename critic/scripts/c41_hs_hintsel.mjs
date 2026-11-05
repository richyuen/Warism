// Critic run 40 (new): R28b's marks and tooltip for box selections of Japan's land divisions, paused at hour 0, the
// cursor on Shanghai (600 m/px): the nearest 1, 2, 4, 16 to Tokyo and all; shots of each.
// Usage: node critic/scripts/c41_hs_hintsel.mjs <seed> <w> <h> <tag>
import { launch, open1938, save, settle, shot, CELLS } from './c31_lib.mjs';
const [seedS, wS, hS, tag] = process.argv.slice(2);
const nat = CELLS.tags.JAP;
const out = { rows: [] };
const { browser, page, errors } = await launch(Number(wS), Number(hS));
try {
  await open1938(page, Number(seedS));
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const all = await page.evaluate((nat) => { const v = window.__warsim.view; return v.formationsOf(nat).filter((i) => !v.formationAfloat(i)).map((i) => [i, Math.hypot(v.formationPos(i)[0] - 1818.5, v.formationPos(i)[1] - 385.5)]).sort((a, b) => a[1] - b[1]).map((d) => d[0]); }, nat);
  await page.evaluate(() => { const v = window.__warsim.view; v.controller.set({ cx: 1715.5, cy: 413.5, scale: (v.metresPerPx * v.controller.cam.scale) / 600 }); });
  await page.waitForTimeout(500); await settle(page, 5000);
  const cb = await page.locator('canvas').first().boundingBox();
  for (const n of [1, 2, 4, 16, all.length]) {
    const ids = all.slice(0, n);
    await page.evaluate((ids) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(ids, false); window.__warsim.hud.selectFormation(ids[0]); }, ids);
    await page.mouse.move(cb.x + cb.width / 2 + 7, cb.y + cb.height / 2 + 7); await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.waitForTimeout(1000);
    out.rows.push({ n, ids: ids.slice(0, 6), first: [...ids].sort((a, b) => a - b)[0], selected: await page.evaluate(() => window.__warsim.view.selectedFormations.size), marks: await page.evaluate(() => window.__warsim.view.landingMarks), tip: await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null), shot: await shot(page, `c41hs_${tag}_n${n}.png`) });
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c41_hs_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out.rows.map((r) => [r.n, r.first, r.selected, r.marks?.length, (r.tip ?? '').split('\n').pop()]).concat([[out.fatal, out.errors]])));
