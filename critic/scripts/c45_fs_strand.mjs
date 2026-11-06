// Critic run 41 (new): R29b by real clicks on Britain's coast (c45_gen's case in the page). Seed <seed>, Britain takes
// control, war declared on France; the two divisions nearest London selected and clicked onto Calais (one real click);
// stepped until one is aboard a convoy standing at its port, + 2 h. Then, paused, in one hour: the fresh division nearest
// (1000.5, 283.5) selected and clicked onto the Normandy coast (1021.5, 291.5); then the two selected and clicked there.
// Stepped 6 h at a time to <days>: where each division and its transport group is, the panel of each on days 1/3/5,
// the order news, and shots of the coast when the first lands and at the end.
// Usage: [BASE=...] node critic/scripts/c45_mk4_eng.mjs <seed> <days> <tag>
import { launch, open1938, shot, save, settle, CELLS } from './c45_lib.mjs';
const [seedS, daysS, tag] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const nat = CELLS.tags.ENG, foe = CELLS.tags.FRA;
const HOME = [1023.5, 275.5], T1 = [1034.5, 279.5], T2 = [1021.5, 291.5], FRESH = [1000.5, 283.5];
const out = { seed, tag, steps: [], panels: [], events: [] };
const { browser, page, errors } = await launch(1600, 900);
async function camAt(x, y, m) {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.waitForTimeout(300); await settle(page, 6000);
}
async function clickCentre() {
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 5, cy + 5); await page.mouse.move(cx, cy); await page.waitForTimeout(700);
  const tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  await page.mouse.click(cx, cy); await page.waitForTimeout(300);
  return tip;
}
const st = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, alive: !!f, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
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
  const war = async () => { await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'forceWar', attacker: a, defender: d }), { a: nat, d: foe }); await step(1); };
  if (!process.env.TAKEFIRST) await war(); // TAKEFIRST=1: Britain taken at tick 0, then the war (God Mode), as c45_gen orders it
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  if (process.env.TAKEFIRST) await war();
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.view.lastTick })); });
  const near = (p, skip) => page.evaluate(({ nat, p, skip }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id) && !skip.includes(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - p[0], v.formationPos(id)[1] - p[1])]).sort((a, b) => a[1] - b[1]).map((d) => d[0]);
  }, { nat, p, skip });
  const two = process.env.PICK ? process.env.PICK.split(',').map(Number) : (await near(HOME, [])).slice(0, 2); // PICK: the two by id
  let fresh = (await near(FRESH, two))[0];
  if (process.env.SPAWNFRESH) {
    // A fresh infantry division placed at Plymouth's quay by God Mode (spawnFormation, template 0) at the start.
    const [sx, sy] = process.env.SPAWNFRESH.split(',').map(Number);
    const pre = await page.evaluate((n) => window.__warsim.view.formationsOf(n), nat);
    await page.evaluate(({ n, sx, sy }) => window.__warsim.hud.command({ kind: 'spawnFormation', nation: n, x: sx, y: sy, strength: 0, template: 0 }), { n: nat, sx, sy });
    await step(1);
    await page.waitForFunction(({ n, pre }) => window.__warsim.view.formationsOf(n).some((id) => !pre.includes(id)), { n: nat, pre }, { timeout: 20000 }).catch(() => null);
    fresh = (await page.evaluate((n) => window.__warsim.view.formationsOf(n), nat)).find((id) => !pre.includes(id));
    out.spawned = fresh;
  }
  const ids = [...two, fresh];
  out.ids = ids;
  await camAt(T1[0], T1[1], 600);
  await pick(two); out.firstTip = await clickCentre();
  let h = 0, aboard = null;
  while (h < 120 && aboard === null) { await step(1); h++; aboard = (await st(two)).find((s) => s.v === 'gathering')?.id ?? null; }
  const plus = Number(process.env.PLUS ?? 2); if (plus > 0) { await step(plus); h += plus; }
  out.orderTick = await page.evaluate(() => window.__warsim.view.lastTick);
  out.before = await st(ids);
  // Run 42 (new): the transports of the landing ordered out to sea by the player (the group selected, a sea cell clicked).
  const grp = await page.evaluate(({ two, nat }) => { const v = window.__warsim.view; const p = v.formationPos(two[0]); return v.formationsOf(nat).filter((id) => v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - p[0], v.formationPos(id)[1] - p[1])]).sort((a, b) => a[1] - b[1]).slice(0, 4); }, { two, nat });
  out.fleetsNear = grp;
  const SEA = (process.env.SEA ?? '1010.5,288.5').split(',').map(Number);
  const gid = Number(process.env.GID ?? grp[0][0]);
  out.gid = gid;
  await camAt(SEA[0], SEA[1], 600);
  await pick([gid]); out.fleetPanel0 = await panel(); out.seaTip = await clickCentre(); await page.waitForTimeout(500);
  out.rows0 = await page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' ')]));
  const trace = [];
  for (let d = 1; d <= days; d++) {
    await step(24); const s = await st(ids); trace.push(`d${d} ` + s.map((x) => `${x.id}:${x.alive ? '' : 'DEAD '}${x.v ?? '-'}${x.port ? '/' + x.port : ''}@${x.p}`).join(' '));
    if (d === 3 || d === days) { await pick([two[0]]); await page.waitForTimeout(400); out['panel270_d' + d] = await panel(); await camAt(SEA[0], SEA[1], 600); out['shot_d' + d] = await shot(page, `c45fs_${tag}_d${d}.png`); }
  }
  out.trace = trace;
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c45_fs_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ gid: out.gid, fleetsNear: out.fleetsNear, trace: out.trace, fatal: out.fatal }));
