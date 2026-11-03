// Critic run 24 (new), FO: the camera follows any formation clicked (PLAN 7.183, ADR-786), as an observer.
// Seed 7019 (Germany on Poland), day 3: a German land formation that is moving, clicked where drawn at 250 m/px;
// 2 days; wheel zoom in at an off-centre cursor; a Polish formation clicked (does the follow switch?); a click on
// empty ground (ends?); then a fleet at sea clicked at 1200 m/px and followed 2 days; then a keyboard pan.
// Usage: node critic/scripts/c30_fo_follow.mjs <seed>
import { launch, open1938, shot, save, lookAt, hours, screenOf, CELLS } from './c30_lib.mjs';
const seed = Number(process.argv[2] ?? 7019);
const GER = CELLS.tags.GER, POL = CELLS.tags.POL;
const out = { seed, steps: [] };
const { browser, page, errors } = await launch();
const st = async (s, id) => {
  const r = await page.evaluate((id) => {
    const v = window.__warsim.view; const c = v.controller.cam; const p = id ? v.formationPos(id) : null;
    return { following: v.controller.following, cam: [+c.cx.toFixed(2), +c.cy.toFixed(2), +(v.metresPerPx * c.scale).toFixed(1)], pos: p ? [+p[0].toFixed(2), +p[1].toFixed(2)] : null, panel: document.querySelector('[data-testid="formation-panel"], .formation-panel')?.innerText?.slice(0, 80) ?? null, selFormation: window.__warsim.hud.selectedFormation?.value ?? null };
  }, id ?? 0);
  r.distPx = r.pos ? +(Math.hypot(r.cam[0] - r.pos[0], r.cam[1] - r.pos[1]) * (await page.evaluate(() => window.__warsim.view.controller.cam.scale))).toFixed(1) : null;
  out.steps.push({ s, id, ...r, shot: await shot(page, `c30fo_${seed}_${out.steps.length}_${s.replace(/\W+/g, '_')}.png`) });
};
try {
  await open1938(page, seed);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 72);
  // a German formation that moved in the last 6 hours
  const before = await page.evaluate((g) => window.__warsim.view.formationsOf(g).map((id) => [id, window.__warsim.view.formationPos(id)]), GER);
  await hours(page, 24); await page.waitForTimeout(1500);
  const mover = await page.evaluate(({ before }) => {
    const v = window.__warsim.view; let best = null, bd = 0;
    for (const [id, p] of before) { const q = v.formationPos(id); if (!p || !q || v.formationAfloat(id)) continue; const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d > bd) { bd = d; best = id; } }
    return { id: best ?? before.find(([id]) => !v.formationAfloat(id))[0], d: bd };
  }, { before });
  out.mover = mover;
  const p0 = await page.evaluate((id) => window.__warsim.view.formationPos(id), mover.id);
  await lookAt(page, p0[0] + 3, p0[1] + 2, 250);
  const [sx, sy] = await screenOf(page, p0[0], p0[1]);
  out.clickAt = [sx, sy];
  await page.mouse.click(sx, sy);
  await page.waitForTimeout(1200);
  await st('clicked German mover', mover.id);
  await hours(page, 48);
  await page.waitForTimeout(1500);
  await st('after 48h', mover.id);
  await page.mouse.move(1200, 250);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(1200);
  await st('wheel in off-centre', mover.id);
  await hours(page, 12);
  await page.waitForTimeout(1200);
  await st('after wheel, 12h', mover.id);
  // a Polish formation on screen
  const findPol = () => page.evaluate((p) => { const v = window.__warsim.view; const c = v.controller.cam; return v.formationsOf(p).map((id) => [id, v.formationPos(id)]).filter(([id, q]) => q && !v.formationAfloat(id) && Math.abs((q[0] - c.cx) * c.scale) < 600 && Math.abs((q[1] - c.cy) * c.scale) < 350).slice(0, 1)[0] ?? null; }, POL);
  let pol = await findPol();
  for (let k = 0; k < 8 && !pol; k++) { await page.mouse.move(800, 450); await page.mouse.wheel(0, 300); await page.waitForTimeout(700); pol = await findPol(); }
  out.wheelOutForPol = true;
  out.pol = pol;
  if (pol) {
    const [px, py] = await screenOf(page, pol[1][0], pol[1][1]);
    await page.mouse.click(px, py);
    await page.waitForTimeout(1200);
    await st('clicked Polish', pol[0]);
    await hours(page, 24); await page.waitForTimeout(1200);
    await st('Polish after 24h', pol[0]);
  }
  // empty ground: far corner of the screen
  await page.mouse.click(60, 860);
  await page.waitForTimeout(800);
  await st('clicked ground', pol ? pol[0] : mover.id);
  await hours(page, 24); await page.waitForTimeout(800);
  await st('ground + 24h', pol ? pol[0] : mover.id);
  // a fleet at sea: any afloat formation
  const fleet = await page.evaluate(() => { const v = window.__warsim.view; for (let n = 1; n < 200; n++) for (const id of v.formationsOf(n)) if (v.formationAfloat(id)) return [id, v.formationPos(id), n]; return null; });
  out.fleet = fleet;
  if (fleet) {
    await lookAt(page, fleet[1][0] + 4, fleet[1][1] + 3, 1200);
    const [fx, fy] = await screenOf(page, fleet[1][0], fleet[1][1]);
    await page.mouse.click(fx, fy);
    await page.waitForTimeout(1200);
    await st('clicked fleet', fleet[0]);
    await hours(page, 48); await page.waitForTimeout(1200);
    await st('fleet after 48h', fleet[0]);
    await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(500); await page.keyboard.up('ArrowLeft');
    await page.waitForTimeout(400);
    await st('arrow pan', fleet[0]);
    await hours(page, 24); await page.waitForTimeout(800);
    await st('arrow pan + 24h', fleet[0]);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c30_fo_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out.steps.map((s) => [s.s, s.following, s.distPx, s.cam[2], !!s.panel])), out.fatal ?? '');
