// Critic run 44 (new): R33c's edits of a whole landing at sea, by real click. The two to Shanghai; once both are aboard at sea
// (+PLUS h), MODE=one: the first alone clicked onto Fuzhou (refused AtSea?); MODE=both: both onto Fuzhou (redirect); MODE=home: both onto
// home soil (cancel: sail back, march); MODE=tsing: both onto Tsingtao. Hover marks/tooltip, toast/rows, panel; stepped to <days>.
// Was: Critic run 44: R43-B1 on R33's landing. The two to Shanghai; when the first stands at its port ('gathering', ashore, R33b) +2 h, it alone
// is clicked onto Fuzhou (it leaves, its own landing); once it is aboard at sea ('atSea'), RECALL h later it is clicked back onto Shanghai.
// Critic run 43 (new): R31e's recall at sea by real click. Japan <seed>: the two nearest Tokyo to Shanghai (API), at aboard+2 h the
// first alone clicked onto Fuzhou (it sails alone), RECALL h later clicked back onto Shanghai while at sea (mark, tooltip,
// panel, rows), then stepped to <days>. Based on: Critic run 40 (new): R40-B1 in the page, by real clicks, paused. Japan, seed <seed>; the two nearest Tokyo sent to
// Shanghai (escort, by the API), stepped until one is aboard + 2 h. Then, paused, in one hour: the third (fresh)
// selected and clicked onto Fuzhou; then the two of the landing selected, hovered on Fuzhou (marks + tooltip), and
// clicked there. The first's panel and the map at Tokyo shot after; stepped 6 h at a time to <days>, logging where each
// division and its transport group is (via the API) and the panel's status on days 1, 5, 10, 20.
// MODE=nofresh: no fresh click, NSH (default 2) sent to Shanghai first, the first two re-clicked (R28a's ATs by real click).
// MODE=leaversfirst gives the two's click first and the fresh one's after (the control).
// Usage: node critic/scripts/c45_mk2_steal.mjs <seed> <days> <tag>
import { launch, open1938, shot, save, settle, CELLS } from './c45_lib.mjs';
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
  const ids = await page.evaluate(({ nat, x, y }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, 2).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1] });
  out.ids = ids;
  for (const id of ids) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0, sea = false;
  while (h < 900 && !sea) { await step(6); h += 6; const s = await st(ids); sea = s.every((x) => x.v === 'atSea'); }
  const PLUS = Number(process.env.PLUS ?? 24);
  await step(PLUS); h += PLUS;
  out.seaAt = h; out.atSea = await st(ids);
  const MODE = process.env.MODE ?? 'one';
  const HOME = [1812.5, 382.5], TS = [1703.5, 373.5];
  const to = MODE === 'home' ? HOME : MODE === 'tsing' ? TS : MODE === 'water' ? [1715.5, 412.5] : MODE === 'water2' ? [1718.5, 413.5] : FZ;
  const who = MODE === 'one' ? [ids[0]] : ids;
  await camAt(to[0], to[1], 600);
  await pick(who); let [cx, cy] = await hoverCentre();
  out.hover = { marks: await marks(), tip: await tip(), shot: await shot(page, `c45se_${tag}_hover.png`) };
  const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' ')]));
  const toast = () => page.evaluate(() => [...document.querySelectorAll('[role=status], [data-testid*=toast], [data-testid=order-error]')].map((x) => x.innerText.replace(/\s+/g, ' ')).filter(Boolean));
  await page.mouse.click(cx, cy); await page.waitForTimeout(500);
  out.click = { toast: await toast(), rows: await rows(), shot: await shot(page, `c45se_${tag}_click.png`) };
  await step(1); h++;
  await pick([ids[0]]); await page.waitForTimeout(500);
  out.after = { h, st: await st(ids), panel: await panel(), rows: await rows(), toast: await toast(), shot: await shot(page, `c45se_${tag}_after.png`) };
  const landed = {};
  let nextShot = h + 48;
  while (h < days * 24) {
    await step(6); h += 6;
    const s = await st(ids);
    for (const x of s) if (!landed[x.id] && x.v === null && x.p) landed[x.id] = { h, p: x.p };
    if (h % 48 === 0) out.steps.push({ h, st: s.map((x) => `${x.id}:${x.v ?? '-'}${x.port !== null ? '/' + x.port : ''}@${x.p}`).join(' ') });
    if (h >= nextShot && out.panels.length < 4) { nextShot = h + 120; await pick([ids[0]]); await page.waitForTimeout(300); const p = (await st([ids[0]]))[0].p; if (p) await camAt(p[0], p[1], 1200); out.panels.push({ h, ...(await panel()), p, shot: await shot(page, `c45se_${tag}_h${h}.png`) }); }
    if (ids.every((id) => landed[id])) break;
  }
  out.landed = landed; out.endH = h; out.end = await st(ids);
  out.rows = await rows();
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c45_se_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, seaAt: out.seaAt, hover: out.hover, click: out.click, after: out.after, landed: out.landed, end: out.end, news: out.news, fatal: out.fatal, errors: out.errors.slice(0, 5) }));
