// Critic run 40 (new): R40-B1 in the page, by real clicks, paused. Japan, seed <seed>; the two nearest Tokyo sent to
// Shanghai (escort, by the API), stepped until one is aboard + 2 h. Then, paused, in one hour: the third (fresh)
// selected and clicked onto Fuzhou; then the two of the landing selected, hovered on Fuzhou (marks + tooltip), and
// clicked there. The first's panel and the map at Tokyo shot after; stepped 6 h at a time to <days>, logging where each
// division and its transport group is (via the API) and the panel's status on days 1, 5, 10, 20.
// MODE=nofresh: no fresh click, NSH (default 2) sent to Shanghai first, the first two re-clicked (R28a's ATs by real click).
// MODE=leaversfirst gives the two's click first and the fresh one's after (the control).
// Usage: node critic/scripts/c41_mk2_steal.mjs <seed> <days> <tag>
import { launch, open1938, shot, save, settle, CELLS } from './c41_lib.mjs';
const [seedS, daysS, tag] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const nat = CELLS.tags.JAP;
const TOKYO = [1818.5, 385.5], SH = [1715.5, 413.5], FZ = [1703.5, 445.5];
const out = { seed, tag, mode: process.env.MODE ?? 'freshfirst', steps: [], panels: [] };
const { browser, page, errors } = await launch(1600, 900);
const marks = () => page.evaluate(() => window.__warsim.view.landingMarks ?? null);
const tip = () => page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
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
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  const ids = await page.evaluate(({ nat, x, y, k }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, k).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1], k: Math.max(3, Number(process.env.NSH ?? 2)) });
  out.ids = ids;
  for (const id of ids.slice(0, Number(process.env.NSH ?? 2))) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0, aboard = null;
  while (h < 96 && aboard === null) { await step(1); h++; aboard = (await st(ids.slice(0, 2))).find((s) => s.v === 'aboard')?.id ?? null; }
  await step(2); h += 2;
  out.aboardAt = h; out.before = await st(ids);
  await page.evaluate(() => { const h = window.__warsim.hud; const o = h.command.bind(h); window.__cmds = []; h.command = (c) => { window.__cmds.push({ ...c, tick: window.__warsim.view.lastTick }); return o(c); }; if (h.commands) { const o2 = h.commands.bind(h); h.commands = (cs) => { window.__cmds.push({ batch: cs.map((c) => c.id), tick: window.__warsim.view.lastTick }); return o2(cs); }; } });
  await camAt(FZ[0], FZ[1], 600);
  const clickFresh = async () => {
    await pick([ids[2]]); await hoverCentre();
    out.freshHover = { marks: await marks(), tip: await tip() };
    const [cx, cy] = await hoverCentre(); await page.mouse.click(cx, cy); await page.waitForTimeout(300);
  };
  const clickTwo = async () => {
    await pick(ids.slice(0, 2)); await hoverCentre();
    out.twoHover = { marks: await marks(), tip: await tip(), shot: await shot(page, `c41mk2_${tag}_twohover.png`) };
    const [cx, cy] = await hoverCentre(); await page.mouse.click(cx, cy); await page.waitForTimeout(300);
  };
  if (out.mode === 'nofresh') await clickTwo();
  else if (out.mode === 'leaversfirst') { await clickTwo(); await clickFresh(); } else { await clickFresh(); await clickTwo(); }
  out.cmds = await page.evaluate(() => window.__cmds);
  await step(1); h++;
  if (process.env.RECALL) {
    // Critic run 41: the two re-clicked onto Shanghai RECALL hours after (a player's undo of the redirect).
    await step(Number(process.env.RECALL) - 1); h += Number(process.env.RECALL) - 1;
    await camAt(SH[0], SH[1], 600);
    await pick(ids.slice(0, 2)); await hoverCentre();
    out.recallHover = { marks: await marks(), tip: await tip() };
    const [cx, cy] = await hoverCentre(); await page.mouse.click(cx, cy); await page.waitForTimeout(300);
    await step(1); h++;
    await pick([ids[0]]); await page.waitForTimeout(600);
    out.recall = { h, panel: await panel(), rows: await page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' ')])), shot: await shot(page, `c41mk2_${tag}_recall.png`) };
    await pick([ids[1]]); await page.waitForTimeout(600);
    out.recall.panel2 = await panel();
  }
  await pick([ids[0]]); await page.waitForTimeout(600);
  out.panels.push({ h, ...(await panel()), shot: await shot(page, `c41mk2_${tag}_panel_h${h}.png`) });
  await camAt(TOKYO[0] - 4, TOKYO[1] + 2, 600);
  out.tokyoShot = await shot(page, `c41mk2_${tag}_tokyo_h${h}.png`);
  const landed = {};
  const at = new Set([24, 120, 240, 480]);
  while (h < days * 24) {
    await step(6); h += 6;
    const s = await st(ids);
    for (const x of s) if (!landed[x.id] && x.v === null && x.p && (Math.hypot(x.p[0] - FZ[0], x.p[1] - FZ[1]) < 8 || Math.hypot(x.p[0] - SH[0], x.p[1] - SH[1]) < 6)) landed[x.id] = { h, p: x.p };
    if (h % 48 === 0) out.steps.push({ h, st: s.map((x) => `${x.id}:${x.v ?? '-'}${x.port !== null ? '/' + x.port : ''}@${x.p}`).join(' ') });
    for (const a of at) if (h >= a) { at.delete(a); await pick([ids[0]]); await page.waitForTimeout(400); out.panels.push({ h, ...(await panel()) }); if (a === 240) { await camAt(1800, 392, 600); out.day10Shot = await shot(page, `c41mk2_${tag}_day10.png`); } }
    if ((out.mode === 'nofresh' ? ids.slice(0, Number(process.env.NSH ?? 2)) : ids).every((id) => landed[id] || (out.mode === 'nofresh' && ![ids[0], ids[1]].includes(id) && h > 1400))) break;
  }
  out.landed = landed; out.endH = h;
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c41_mk2_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ cmds: out.cmds, ids: out.ids, aboardAt: out.aboardAt, freshHover: out.freshHover, twoHover: out.twoHover, panels: out.panels, landed: out.landed, endH: out.endH, news: out.news, fatal: out.fatal, errors: out.errors.slice(0, 5) }));
