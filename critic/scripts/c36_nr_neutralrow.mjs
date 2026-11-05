// Critic run 34 (copy of run 33) (R20): what a player sees of a refused landing on a neutral coast, by real clicks.
// 1938 seed <seed>, <TAG> played, its division nearest (sx, sy) selected by a real click on its counter, a hover and a
// real left-click on (dx, dy). Reads: the tooltip and its by-sea line before the click; the formation panel's notice and
// status; every order-news row (text, its full text by scrollWidth vs clientWidth, its title); then a click on the row
// (what it opens). Viewport <w> <h>, touch when <mode> = phone.
// Usage: node critic/scripts/c36_nr_neutralrow.mjs <seed> <TAG> <sx> <sy> <dx> <dy> <w> <h> <mode> <tag>
import { chromium } from '@playwright/test';
import { open1938, shot, save, settle, CELLS, screenOf } from './c31_lib.mjs';
const [seedS, TAG, sx, sy, dx, dy, wS, hS, mode, tag] = process.argv.slice(2);
const nat = CELLS.tags[TAG];
const out = { seed: +seedS, TAG, mode };
const phone = mode === 'phone';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +wS, height: +hS }, ...(phone ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((r) => { const l = r.querySelector('.ticker-line') ?? r; return { kind: r.dataset.order, text: r.innerText.replace(/\n/g, ' '), cut: l.scrollWidth > l.clientWidth + 1, title: r.title, w: Math.round(r.getBoundingClientRect().width) }; }));
try {
  await open1938(page, +seedS);
  await page.evaluate((n) => window.__warsim.view.select(n), nat); await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]');
  const div = await page.evaluate(({ nat, x, y }) => { const v = window.__warsim.view; return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1])[0][0]; }, { nat, x: +sx, y: +sy });
  out.div = div;
  const p = await page.evaluate((id) => window.__warsim.view.formationPos(id), div);
  await page.evaluate(({ x, y }) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: window.__warsim.view.controller.cam.scale * (window.__warsim.view.metresPerPx / 3000) }), { x: p[0], y: p[1] });
  await settle(page, 5000);
  const [px, py] = await screenOf(page, p[0], p[1]);
  if (phone) await page.touchscreen.tap(px, py); else await page.mouse.click(px, py);
  await page.waitForTimeout(800);
  out.panelOpen = await page.getByTestId('formation-panel').isVisible().catch(() => false);
  if (!out.panelOpen) { out.apiSelect = true; await page.evaluate((id) => { window.__warsim.view.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, div); await page.waitForTimeout(800); out.panelOpenApi = await page.getByTestId('formation-panel').isVisible().catch(() => false); }
  out.header = await page.evaluate(() => document.body.innerText.slice(0, 90).replace(/\n/g, ' | '));
  out.shotSel = await shot(page, `c36nr_${tag}_sel.png`);
  await page.evaluate(({ x, y }) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: window.__warsim.view.controller.cam.scale }), { x: +dx, y: +dy });
  await settle(page, 5000);
  const [qx, qy] = await screenOf(page, +dx, +dy);
  if (!phone) {
    await page.mouse.move(qx + 3, qy + 3); await page.mouse.move(qx, qy); await page.waitForTimeout(800);
    out.tooltip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
    out.bySea = await page.getByTestId('tooltip-by-sea').isVisible().catch(() => false);
    out.shotHover = await shot(page, `c36nr_${tag}_hover.png`);
    await page.mouse.click(qx, qy);
  } else await page.touchscreen.tap(qx, qy);
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__warsim.sim.step(1)); await page.waitForTimeout(1200);
  out.notice = await page.getByTestId('formation-notice').innerText({ timeout: 800 }).catch(() => null);
  out.status = await page.getByTestId('formation-status').innerText({ timeout: 800 }).catch(() => null);
  out.panelOpenAfter = await page.getByTestId('formation-panel').isVisible().catch(() => false);
  out.rows = await rows();
  out.shotClick = await shot(page, `c36nr_${tag}_click.png`);
  const row = page.getByTestId('order-news').first();
  if (await row.isVisible().catch(() => false)) {
    if (phone) await row.tap(); else await row.click();
    await page.waitForTimeout(1200);
    out.afterRow = { panel: await page.getByTestId('formation-panel').isVisible().catch(() => false), notice: await page.getByTestId('formation-notice').innerText({ timeout: 800 }).catch(() => null), rows: await rows() };
    out.shotRow = await shot(page, `c36nr_${tag}_row.png`);
  }
  out.divPos = await page.evaluate((id) => window.__warsim.view.formationPos(id), div);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c36_nr_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
