// Critic run 51 (copy of c51_lost; N divisions via env N, rows' overflow measured). Critic run 47 (new): R38a in the page, and R38c/R38f tooltip edges.
// Japan <seed> (3517), taken. Japan's transport groups but the two nearest Tokyo removed at the start (God's
// removeFormation, as c47_sunk KEEP=2). The three nearest Tokyo sent to Shanghai in one click: two sail, one is
// left for the next voyage. While gathering (+2 h): the sea hovered at points over the whole screen, the bottom and
// right edges too, with the landing selected (R38f `ashore`) and with a land division in no landing selected (R38f
// `plain`); each tooltip's box against the screen. SINK h after it sails, the landing's groups removed (as sunk):
// the rows, the toast, the panel of a lost one and of the one at the port, each shot.
// Usage: node critic/scripts/c47_lost.mjs <seed> <tag> [W H]
import { launch, open1938, shot, save, settle, CELLS } from './c51_lib.mjs';
const [seedS, tag, WS, HS] = process.argv.slice(2);
const seed = Number(seedS);
const W = Number(WS ?? 1600), H = Number(HS ?? 900);
const NDIV = Number(process.env.N ?? 3);
const SINK = Number(process.env.SINK ?? 24);
const nat = CELLS.tags.JAP;
const TOKYO = [1818.5, 385.5], SH = [1715.5, 413.5];
const out = { seed, tag, W, H };
const { browser, page, errors } = await launch(W, H);
const step = (n) => page.evaluate(async (n) => { const w = window.__warsim; const t = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now(); await new Promise((d) => { const f = () => (w.view.lastTick >= t || performance.now() - t0 > 600000 ? d() : setTimeout(f, 10)); f(); }); }, n);
const st = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
const pick = async (list) => page.evaluate((list) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(list, false); window.__warsim.hud.selectFormation(list[0]); }, list);
const panel = async () => ({
  status: await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null),
});
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' '), { cut: x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], sw: x.scrollWidth, cw: x.clientWidth, sh: x.scrollHeight, ch: x.clientHeight, vis: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0, of: cs.textOverflow, ws: cs.whiteSpace }]; }));
const tickerAll = () => page.evaluate(() => { const t = document.querySelector('.ticker'); if (!t) return null; const r = t.getBoundingClientRect(); return { cls: t.className, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], text: t.innerText.replace(/\s+/g, ' ').slice(0, 1500) }; });
const toast = () => page.evaluate(() => [...document.querySelectorAll('[role=status], [data-testid*=toast], [data-testid=order-error]')].map((x) => x.innerText.replace(/\s+/g, ' ')).filter(Boolean));
const tip = () => page.evaluate(() => { const e = document.querySelector('[data-testid=map-tooltip]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' '), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }; });
async function camAt(x, y, m) {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.waitForTimeout(300); await settle(page, 6000);
}
async function edges(label) {
  // Points over the screen, the edges included: fractions of W and H.
  const pts = [[0.5, 0.5], [0.9, 0.5], [0.97, 0.5], [0.5, 0.9], [0.5, 0.97], [0.95, 0.95], [0.05, 0.95], [0.97, 0.1]];
  const r = [];
  for (const [fx, fy] of pts) {
    const x = Math.round(W * fx), y = Math.round(H * fy);
    await page.mouse.move(x - 3, y - 3); await page.mouse.move(x, y); await page.waitForTimeout(700);
    const t = await tip();
    const off = t ? (t.box[0] < 0 || t.box[1] < 0 || t.box[2] > W || t.box[3] > H) : null;
    r.push({ at: [x, y], tip: t, off });
  }
  const last = r.findLast?.((q) => q.off) ?? r.filter((q) => q.off).pop();
  if (last) { await page.mouse.move(last.at[0], last.at[1]); await page.waitForTimeout(700); }
  return { label, r, shot: await shot(page, `c51lost_${tag}_${label}.png`) };
}
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  await step(1);
  // Japan's transports but 1136 and 1144 removed (ids as headless seed 3517).
  out.removed = await page.evaluate(async () => {
    const w = window.__warsim; const r = [];
    for (const id of [1151, 1152]) { r.push([id, await w.sim.command({ kind: 'removeFormation', id }, true)]); }
    return r;
  });
  await step(1);
  const near = await page.evaluate(({ nat, x, y, ndiv }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, ndiv + 1).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1], ndiv: NDIV });
  const ids = near.slice(0, NDIV), other = near[NDIV];
  out.ids = ids; out.other = other;
  for (const id of ids) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0;
  while (h < 96 && !(await st(ids)).some((s) => s.v === 'gathering')) { await step(1); h++; }
  await step(2); h += 2;
  await camAt(1745, 420, 1500);
  await pick(ids);
  out.edgesAshore = await edges('ashore');
  await pick([other]);
  out.edgesPlain = await edges('plain');
  await page.evaluate(() => window.__warsim.player.clearSelection());
  // To the sail hour.
  let sailed = false;
  while (h < 1400 && !sailed) { await step(6); h += 6; sailed = (await st(ids)).some((s) => s.v === 'atSea'); }
  out.sailedH = h; out.atSail = await st(ids);
  await step(SINK); h += SINK;
  out.beforeSink = await st(ids);
  const fleets = await page.evaluate(async (id) => { const w = window.__warsim; return (await w.sim.formation(id))?.voyage ?? null; }, ids[0]);
  out.voyage0 = fleets;
  out.rowsBefore = await rows();
  out.sink = await page.evaluate(async () => {
    const w = window.__warsim; const r = [];
    for (const id of [1136, 1144]) r.push([id, await w.sim.command({ kind: 'removeFormation', id }, true)]);
    return r;
  });
  await step(1); h++;
  await page.waitForTimeout(600);
  out.afterSink = { h, st: await st(ids), rows: await rows(), ticker: await tickerAll(), toast: await toast(), shot: await shot(page, `c51lost_${tag}_rows.png`) };
  const atPort = out.atSail.find((s) => s.v === 'nextVoyage')?.id ?? null;
  out.atPort = atPort;
  if (atPort !== null) {
    await pick([atPort]); await page.waitForTimeout(500);
    out.portPanel = { panel: await panel(), shot: await shot(page, `c51lost_${tag}_portpanel.png`) };
  }
  out.news = await page.evaluate(() => window.__news);
  // Critic run 51: a click on the first merged row (R40c says it dismisses all it names); the rows after.
  await page.evaluate(() => window.__warsim.player.clearSelection());
  await page.waitForTimeout(400);
  out.rowsBeforeClick = await rows();
  const many = await page.$$('[data-testid=order-news]');
  const mergedIx = (out.rowsBeforeClick ?? []).findIndex((r) => /^\d+ divisions/.test(r[1]));
  if (many.length > 0) {
    const ix = mergedIx >= 0 ? mergedIx : 0;
    out.clicked = out.rowsBeforeClick[ix]?.[1] ?? null;
    await many[ix].click().catch((e) => { out.clickErr = String(e).slice(0, 200); });
    await page.waitForTimeout(700);
    out.rowsAfterClick = await rows();
    out.newsLeft = await page.evaluate(() => window.__warsim.hud.orderNews?.value?.map?.((n) => `${n.seq} ${n.kind} ${n.id} t${n.tick}`) ?? null);
    out.clickShot = await shot(page, `c51lost_${tag}_afterclick.png`);
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c51_lost_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ...out, edgesAshore: out.edgesAshore?.r?.map((q) => [q.at, q.off, q.tip?.box]), edgesPlain: out.edgesPlain?.r?.map((q) => [q.at, q.off, q.tip?.box]) }, null, 1).slice(0, 6000));
