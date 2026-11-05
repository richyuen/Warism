// Critic run 34 (copy of run 33) (R20): the "sent home" rows below the ticker, one and many. 1938 seed <seed>, Britain played; God
// (the command) puts <n> British divisions on France's ground near Calais (as landingNeutral1938.spec.ts does with one),
// steps 26 h (a day start), and reads every order-news row (text, cut or not, the box it takes), the History's rows of
// the day, and a screenshot; then 24 h more (do the rows stay?). Viewport <w> <h>.
// Usage: node critic/scripts/c40_shm_mass.mjs <seed> <n> <w> <h> <tag>
import { chromium } from '@playwright/test';
import { open1938, shot, save, settle, CELLS } from './c31_lib.mjs';
const [seedS, nS, wS, hS, tag] = process.argv.slice(2);
const ENG = CELLS.tags.ENG;
const out = { seed: +seedS, n: +nS };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +wS, height: +hS } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((r) => { const l = r.querySelector('.ticker-line') ?? r; const b = r.getBoundingClientRect(); return { kind: r.dataset.order, text: r.innerText.replace(/\n/g, ' '), cut: l.scrollWidth > l.clientWidth + 1, box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }; }));
try {
  await open1938(page, +seedS);
  await page.evaluate((n) => window.__warsim.view.select(n), ENG); await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]');
  const pts = [[1034.5, 279.5], [1036.5, 281.5], [1038.5, 283.5], [1040.5, 285.5], [1036.5, 287.5], [1042.5, 289.5], [1038.5, 291.5], [1044.5, 293.5], [1040.5, 295.5], [1046.5, 297.5], [1035.5, 290.5], [1043.5, 284.5]];
  out.spawn = [];
  for (let i = 0; i < +nS; i++) {
    const [x, y] = pts[i % pts.length];
    out.spawn.push(await page.evaluate(({ x, y, n }) => window.__warsim.hud.command({ kind: 'spawnFormation', nation: n, x, y, strength: 10000 }), { x, y, n: ENG }).catch((e) => String(e)));
  }
  await page.evaluate(() => window.__warsim.sim.step(1)); await page.waitForTimeout(800);
  const ids = await page.evaluate((n) => { const v = window.__warsim.view; return v.formationsOf(n).filter((id) => { const p = v.formationPos(id); return p && p[0] > 1030 && p[1] > 276; }); }, ENG);
  out.inFrance = ids.length;
  await page.evaluate(() => window.__warsim.view.showPlace(1038, 286)); await page.waitForTimeout(1500); await settle(page, 5000);
  out.shotBefore = await shot(page, `c40shm_${tag}_before.png`);
  await page.evaluate(() => window.__warsim.sim.step(25)); await page.waitForTimeout(1500);
  out.rows = await rows();
  out.stillInFrance = await page.evaluate((ids) => ids.filter((id) => { const p = window.__warsim.view.formationPos(id); return p && p[0] > 1030 && p[1] > 276; }).length, ids);
  out.shotAfter = await shot(page, `c40shm_${tag}_after.png`);
  const row = page.getByTestId('order-news').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click(); await page.waitForTimeout(1500); await settle(page, 5000);
    out.afterRowClick = { panel: await page.getByTestId('formation-panel').isVisible().catch(() => false), rows: (await rows()).length };
    out.shotRow = await shot(page, `c40shm_${tag}_rowclick.png`);
  }
  // the History: is the jump there?
  await page.getByRole('button', { name: 'History' }).click().catch(() => {});
  await page.waitForTimeout(1500);
  out.history = await page.evaluate(() => (document.querySelector('[data-testid=history-panel], .history-panel, [role=dialog]')?.innerText ?? '').slice(0, 1500));
  out.historyHasHome = /sent home|home/i.test(out.history);
  out.shotHist = await shot(page, `c40shm_${tag}_history.png`);
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => window.__warsim.sim.step(24)); await page.waitForTimeout(1200);
  out.rowsNextDay = (await rows()).length;
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c40_shm_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3500));
