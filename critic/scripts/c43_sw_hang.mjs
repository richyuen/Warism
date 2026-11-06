// Critic run 34 (copy of run 33): does the page keep stepping after a refused order over the sea? 1938 seed <seed>, <TAG> played, its
// division nearest (sx, sy) selected through the player (a real click on its counter), then a real left-click on the
// target (dx, dy). Then sim.step(3) ten times, recording lastTick, the paused flag, any toast text, after each.
// Usage: node critic/scripts/c43_sw_hang.mjs <seed> <TAG> <sx> <sy> <dx> <dy> <tag>
import { launch, open1938, shot, save, settle, CELLS, screenOf } from './c31_lib.mjs';
const [seedS, TAG, sx, sy, dx, dy, tag] = process.argv.slice(2);
const nat = CELLS.tags[TAG];
const out = { seed: +seedS, TAG, samples: [] };
const { browser, page, errors } = await launch();
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
  out.pick = await page.evaluate(({ px, py }) => window.__warsim.view.formationPick(px, py), { px, py });
  await page.mouse.click(px, py);
  await page.waitForTimeout(600);
  out.header = await page.evaluate(() => document.querySelector('.topbar, header, [data-testid=topbar]')?.innerText ?? document.body.innerText.slice(0, 80));
  out.shotSel = await shot(page, `c43sw_${tag}_sel.png`);
  await page.evaluate(({ x, y }) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: window.__warsim.view.controller.cam.scale }), { x: +dx, y: +dy });
  await settle(page, 5000);
  const [qx, qy] = await screenOf(page, +dx, +dy);
  await page.mouse.move(qx + 3, qy + 3); await page.mouse.move(qx, qy); await page.waitForTimeout(800);
  out.bySea = await page.getByTestId('tooltip-by-sea').isVisible().catch(() => false);
  await page.mouse.click(qx, qy);
  await page.waitForTimeout(800);
  out.shotClick = await shot(page, `c43sw_${tag}_click.png`);
  out.toasts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row], [role=status]')].map((r) => ({ text: r.innerText.replace(/\n/g, ' '), title: r.title || r.getAttribute('aria-label') || '' })).slice(0, 6));
  for (let k = 0; k < 10; k++) {
    const t0 = Date.now();
    const r = await Promise.race([page.evaluate(async () => { await window.__warsim.sim.step(3); return window.__warsim.view.lastTick; }), new Promise((d) => setTimeout(() => d('timeout 60s'), 60000))]);
    await page.waitForTimeout(300);
    out.samples.push({ k, r, lastTick: await page.evaluate(() => window.__warsim.view.lastTick), paused: await page.evaluate(() => window.__warsim.hud.paused.value), ms: Date.now() - t0 });
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c43_sw_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
