// Critic run 39 (new): R27b's landing mark, attacked. Japan, seed <seed>, the 3 divisions nearest Tokyo.
// 1) hour 0, paused, the first alone selected: hover Shanghai; mark + tooltip + shots at 3000/600/120/30 m/px.
// 2) Escape with the cursor still (paused): does the mark go with the selection?
// 3) The two first sent to Shanghai (escort), stepped until one is aboard. Then a selection of <sel>:
//    'mixed' = the one aboard + the third (fresh) one; 'aboard' = the one aboard alone. Hover (dx,dy) cells off
//    Shanghai, record the mark, click there, step until all landed or <days>; compare each landfall with the mark.
// Usage: node critic/scripts/c44_mk_mark.mjs <seed> <sel> <dx> <dy> <days> <w> <h> <tag>
import { launch, open1938, shot, save, settle, CELLS } from './c31_lib.mjs';
const [seedS, sel, dxS, dyS, daysS, wS, hS, tag] = process.argv.slice(2);
const seed = Number(seedS), dx = Number(dxS), dy = Number(dyS), days = Number(daysS);
const nat = CELLS.tags.JAP;
const TOKYO = [1818.5, 385.5], SH = [1715.5, 413.5];
const out = { seed, sel, dx, dy, tag, zoom: [], steps: [] };
const { browser, page, errors } = await launch(Number(wS), Number(hS));
const W = 2048;
const cellXY = (c) => (c < 0 ? null : [c % W, Math.floor(c / W)]);
const mark = () => page.evaluate(() => window.__warsim.view.landingMark);
const marks = () => page.evaluate(() => window.__warsim.view.landingMarks ?? null);
const nland = () => page.evaluate(() => document.querySelector('[data-testid=tooltip-by-sea]')?.getAttribute('data-landings') ?? null);
const tip = () => page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
async function camAt(x, y, m) {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.waitForTimeout(300); await settle(page, 6000);
}
async function hoverCentre() {
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 5, cy + 5); await page.mouse.move(cx, cy); await page.waitForTimeout(700);
  return [cx, cy];
}
const states = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, alive: !!f, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
const step = (n) => page.evaluate(async (n) => { const w = window.__warsim; const t = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now(); await new Promise((d) => { const f = () => (w.view.lastTick >= t || performance.now() - t0 > 600000 ? d() : setTimeout(f, 10)); f(); }); }, n);
try {
  await open1938(page, seed);
  out.W = await page.evaluate(() => window.__warsim.sim.mapLayers.w ?? window.__warsim.sim.mapLayers.width);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  const ids = await page.evaluate(({ nat, x, y }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1] });
  out.ids = ids;
  const pick = async (list) => page.evaluate((list) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(list, false); window.__warsim.hud.selectFormation(list[0]); }, list);
  // 1) zoom tiers
  await pick([ids[0]]);
  await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  for (const m of [3000, 600, 120, 30]) {
    await camAt(SH[0], SH[1], m);
    await hoverCentre();
    await page.waitForTimeout(500);
    out.zoom.push({ m, mark: await mark(), tip: await tip(), shot: await shot(page, `c44mk_${tag}_z${m}.png`) });
  }
  // 2) Escape with the cursor still, paused
  await camAt(SH[0], SH[1], 600); await hoverCentre();
  out.beforeEsc = { mark: await mark(), sel: await page.evaluate(() => window.__warsim.view.selectedFormations.size) };
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__warsim.view.draw(performance.now()));
  out.afterEsc = { mark: await mark(), marks: await marks(), sel: await page.evaluate(() => window.__warsim.view.selectedFormations.size), tip: await tip(), shot: await shot(page, `c44mk_${tag}_afterEsc.png`) };
  await page.mouse.move(10, 10); await page.waitForTimeout(500);
  out.afterMoveAway = { mark: await mark() };
  // 3) the two to Shanghai, step until one aboard
  for (const id of ids.slice(0, 2)) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0, aboard = null;
  while (h < 96 && aboard === null) { await step(1); h++; const st = await states(ids.slice(0, 2)); aboard = st.find((s) => s.v === 'gathering')?.id ?? null; }
  out.aboard = aboard; out.aboardH = h;
  if (aboard === null) throw new Error('none aboard');
  if (process.env.FRESHLOW) { ids[2] = await page.evaluate(({ nat, not, lim }) => { const v = window.__warsim.view; return v.formationsOf(nat).filter((id) => !v.formationAfloat(id) && !not.includes(id) && Math.hypot(v.formationPos(id)[0] - 1818.5, v.formationPos(id)[1] - 385.5) < lim).sort((a, b) => a - b)[0]; }, { nat, not: ids, lim: Number(process.env.FRESHLOW) }); out.ids = ids; }
  const selection = sel === 'mixed' ? [aboard, ids[2]] : [aboard];
  await pick(selection);
  out.selection = selection;
  out.firstForMark = [...selection].filter(Boolean).sort((a, b) => a - b)[0];
  const tgt = [SH[0] + dx, SH[1] + dy];
  out.target = tgt;
  await camAt(tgt[0], tgt[1], 600);
  await hoverCentre(); await page.waitForTimeout(800);
  out.hover = { mark: await mark(), marks: await marks(), nLandings: await nland(), tip: await tip(), shot: await shot(page, `c44mk_${tag}_hover.png`) };
  out.hover.markLand = cellXY(out.hover.mark?.land ?? -1); out.hover.markWater = cellXY(out.hover.mark?.water ?? -1);
  // the order: a real click at the centre
  const cb = await page.locator('canvas').first().boundingBox();
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await step(1); h++;
  out.afterClick = { mark: await mark(), st: await states(ids), shot: await shot(page, `c44mk_${tag}_afterClick.png`) };
  // step on until all three (or the selection + partner) are ashore near something, or days
  const watch = sel === 'mixed' ? ids : ids.slice(0, 2);
  const landed = {};
  while (h < days * 24) {
    await step(6); h += 6;
    const st = await states(watch);
    for (const s of st) if (!landed[s.id] && s.alive && s.v === null && s.p && Math.hypot(s.p[0] - TOKYO[0], s.p[1] - TOKYO[1]) > 30) landed[s.id] = { h, p: s.p };
    if (h % 48 === 0) out.steps.push({ h, st: st.map((s) => `${s.id}:${s.v ?? '-'}@${s.p}`).join(' ') });
    if (watch.every((id) => landed[id])) break;
  }
  out.landed = landed;
  out.endH = h;
  out.news = await page.evaluate(() => window.__news);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news], [data-testid=ticker-row]')].map((x) => x.innerText.replace(/\n/g, ' ')).slice(0, 40));
  out.final = await states(watch);
  await camAt(SH[0], SH[1] + 2, 600);
  out.endShot = await shot(page, `c44mk_${tag}_end.png`);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c44_mk_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, zoom: out.zoom.map((z) => [z.m, z.mark, z.tip]), beforeEsc: out.beforeEsc, afterEsc: { mark: out.afterEsc?.mark, sel: out.afterEsc?.sel }, afterMoveAway: out.afterMoveAway, aboard: out.aboard, sel: out.selection, first: out.firstForMark, hover: out.hover && { marks: out.hover.marks, nLandings: out.hover.nLandings, mark: out.hover.mark, land: out.hover.markLand, water: out.hover.markWater, tip: out.hover.tip }, afterClick: out.afterClick && { mark: out.afterClick.mark, st: out.afterClick.st }, landed: out.landed, endH: out.endH, news: out.news, fatal: out.fatal, errors: out.errors.slice(0, 5) }, null, 0));
