// Critic run 45 (new): R36b's hover and click over the sea, by real mouse, beyond run 44's cases.
// Japan <seed>: the two nearest Tokyo to Shanghai (API).
//  1. gathering (ashore at Tokyo, +2 h): both selected, the sea one cell off Shanghai (1718.5, 413.5) hovered (tooltip, marks), clicked
//     (rows, toast); +1 h their states and panel: does the landing stand as it was?
//  2. the landing at sea +24 h: a fresh division ashore (the third nearest Tokyo) added to the selection; the same sea hovered and clicked:
//     what the tooltip promises and what each does.
//  3. a Japanese warship group (afloat, not of the landing) selected: the mouse swept over 60 points of open sea at speed; any tooltip
//     shown and any page error; then the landing selected and the same sweep, counting how often the 'only sea' note shows.
//  Then stepped to <days>, logging the landing hours. W/H: the viewport (default 1600 x 900; phone 390 x 844).
// Usage: node critic/scripts/c47_uh_seahover.mjs <seed> <days> <tag> [W H]
import { launch, open1938, shot, save, settle, CELLS } from './c47_lib.mjs';
const [seedS, daysS, tag, WS, HS] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const W = Number(WS ?? 1600), H = Number(HS ?? 900);
const nat = CELLS.tags.JAP;
const TOKYO = [1818.5, 385.5], SH = [1715.5, 413.5], WATER = [1718.5, 413.5];
const out = { seed, tag, W, H, steps: [] };
const { browser, page, errors } = await launch(W, H);
async function camAt(x, y, m) {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.waitForTimeout(300); await settle(page, 6000);
}
async function hoverCentre() {
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 5, cy + 5); await page.mouse.move(cx, cy); await page.waitForTimeout(900);
  return [cx, cy];
}
const tip = () => page.evaluate(() => { const e = document.querySelector('[data-testid=map-tooltip]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], open: !!e.querySelector('[data-testid=tooltip-sea-open]') }; });
const marks = () => page.evaluate(() => window.__warsim.view.landingMarks ?? null);
const st = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
const panel = async () => ({
  status: await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null),
  wait: await page.getByTestId('formation-wait').innerText({ timeout: 500 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null),
});
const step = (n) => page.evaluate(async (n) => { const w = window.__warsim; const t = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now(); await new Promise((d) => { const f = () => (w.view.lastTick >= t || performance.now() - t0 > 600000 ? d() : setTimeout(f, 10)); f(); }); }, n);
const pick = async (list) => page.evaluate((list) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(list, false); window.__warsim.hud.selectFormation(list[0]); }, list);
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' ')]));
const toast = () => page.evaluate(() => [...document.querySelectorAll('[role=status], [data-testid*=toast], [data-testid=order-error]')].map((x) => x.innerText.replace(/\s+/g, ' ')).filter(Boolean));
async function sweep(label) {
  const cb = await page.locator('canvas').first().boundingBox();
  const seen = { label, n: 0, tips: 0, open: 0, offscreen: 0, texts: {} };
  for (let i = 0; i < 60; i++) {
    const x = cb.x + cb.width * (0.15 + 0.7 * ((i * 37) % 60) / 60), y = cb.y + cb.height * (0.2 + 0.6 * ((i * 11) % 60) / 60);
    await page.mouse.move(x, y, { steps: 2 });
    if (i % 6 === 5) {
      await page.waitForTimeout(250);
      const t = await tip(); seen.n++;
      if (t) { seen.tips++; if (t.open) seen.open++; if (t.box[2] > W || t.box[3] > H || t.box[0] < 0) seen.offscreen++; const k = t.text.replace(/\s+/g, ' ').slice(0, 90); seen.texts[k] = (seen.texts[k] ?? 0) + 1; }
    }
  }
  return seen;
}
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  const near = await page.evaluate(({ nat, x, y }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1] });
  const ids = near.slice(0, 2), fresh = near[2];
  out.ids = ids; out.fresh = fresh;
  for (const id of ids) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0, g = null;
  while (h < 96 && g === null) { await step(1); h++; g = (await st(ids)).find((s) => s.v === 'gathering')?.id ?? null; }
  await step(2); h += 2;
  // 1. gathering, the sea.
  await camAt(WATER[0], WATER[1], 600);
  await pick(ids); let [cx, cy] = await hoverCentre();
  out.g = { h, before: await st(ids), hover: { tip: await tip(), marks: await marks(), shot: await shot(page, `c47uh_${tag}_g_hover.png`) } };
  await page.mouse.click(cx, cy); await page.waitForTimeout(500);
  out.g.click = { rows: await rows(), toast: await toast() };
  await step(1); h++;
  await pick([ids[0]]); await page.waitForTimeout(400);
  out.g.after = { h, st: await st(ids), panel: await panel(), rows: await rows(), shot: await shot(page, `c47uh_${tag}_g_after.png`) };
  // 2. at sea +24 h, with a fresh division.
  let sea = false;
  while (h < 900 && !sea) { await step(6); h += 6; sea = (await st(ids)).every((x) => x.v === 'atSea'); }
  await step(24); h += 24;
  await camAt(WATER[0], WATER[1], 600);
  await pick([...ids, fresh]); [cx, cy] = await hoverCentre();
  out.m = { h, before: await st([...ids, fresh]), hover: { tip: await tip(), marks: await marks(), shot: await shot(page, `c47uh_${tag}_m_hover.png`) } };
  await page.mouse.click(cx, cy); await page.waitForTimeout(500);
  out.m.click = { rows: await rows(), toast: await toast(), shot: await shot(page, `c47uh_${tag}_m_click.png`) };
  await step(1); h++;
  out.m.after = { h, st: await st([...ids, fresh]) };
  await step(12); h += 12;
  out.m.after12 = { h, st: await st([...ids, fresh]) };
  // 3. sweeps: a warship group selected, then the landing.
  const ship = await page.evaluate(({ nat, ids }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => v.formationAfloat(id) && !ids.includes(id)).map((id) => [id, v.formationPos(id)]).find((x) => x[1]) ?.[0] ?? null;
  }, { nat, ids });
  out.ship = ship;
  await camAt(1760, 420, 3000);
  if (ship !== null) { await pick([ship]); await page.waitForTimeout(300); out.sweepShip = await sweep('ship'); out.sweepShip.shot = await shot(page, `c47uh_${tag}_sweep_ship.png`); }
  await pick(ids); await page.waitForTimeout(300);
  out.sweepLanding = await sweep('landing'); out.sweepLanding.shot = await shot(page, `c47uh_${tag}_sweep_landing.png`);
  await page.evaluate(() => window.__warsim.player.clearSelection()); await page.waitForTimeout(300);
  out.sweepNone = await sweep('none');
  const landed = {};
  while (h < days * 24) {
    await step(6); h += 6;
    const s = await st([...ids, fresh]);
    for (const x of s) if (!landed[x.id] && x.v === null && x.p && Math.hypot(x.p[0] - SH[0], x.p[1] - SH[1]) < 6) landed[x.id] = { h, p: x.p };
    if (h % 48 === 0) out.steps.push({ h, st: s.map((x) => `${x.id}:${x.v ?? '-'}@${x.p}`).join(' ') });
    if (ids.every((id) => landed[id])) break;
  }
  out.landed = landed; out.endH = h; out.end = await st([...ids, fresh]);
  out.rows = await rows();
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c47_uh_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, g: out.g, m: out.m, sweepShip: out.sweepShip, sweepLanding: out.sweepLanding, sweepNone: out.sweepNone, landed: out.landed, end: out.end, fatal: out.fatal, errors: out.errors.slice(0, 5) }));
