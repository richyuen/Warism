// Critic run 56 (new): a landing with a division left for the next voyage, turned back by the player. As c56_lland
// (TAG at war with FOE, the N nearest FROM sent to TO), then at hour CANCELAT every division of the click is sent back
// to FROM (a cancel: those at sea turn back); at hour ORDERAT those still at the port are sent to ORDERTO (a march on
// land). Logs rows, news, panels of all at SHOTAT hours, and positions; shots at the SHOTAT hours.
// Usage: CANCELAT=66 ORDERAT=200 ORDERTO=x,y SHOTAT=h,h node critic/scripts/c56_retstuck.mjs <seed> <TAG> <FOE> <from> <to> <N> <label> [HOURS]
import { launch, open1938, shot, save, hours, lookAt, CELLS } from './c56_lib.mjs';
const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, label] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), a[6]];
const HOURS = Number(a[7] ?? 240);
const out = { seed, TAG, FOE, FROM, TO, N, label, samples: [], shots: [] };
const { browser, page, errors } = await launch(1600, 900);
const ll = (s) => s.split(',').map(Number);
try {
  await open1938(page, seed);
  const NAT = CELLS.tags[TAG], FOEID = CELLS.tags[FOE];
  const from = ll(FROM), to = ll(TO);
  await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: NAT, d: FOEID });
  await page.evaluate(() => window.__warsim.sim.step(1));
  await page.evaluate((n) => window.__warsim.view.select(n), NAT);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  const sel = await page.evaluate(({ n, x, y, N }) => {
    const v = window.__warsim.view;
    return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]);
  }, { n: NAT, x: from[0], y: from[1], N });
  out.ids = sel;
  for (const id of sel) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: to[0], y: to[1], n: NAT });
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  let overAt = null;
  const STEP = Number(process.env.STEP ?? 6);
  for (let h = 0; h <= HOURS; h += STEP) {
    const s = await page.evaluate((sel) => {
      const v = window.__warsim.view;
      const bar = document.querySelector('[data-testid=landings-bar]');
      const rows = bar ? [...bar.querySelectorAll('[data-testid=landing-row]')].map((li) => [li.getAttribute('data-state'), li.querySelector('[data-testid=landing-title]')?.textContent, li.querySelector("[data-testid=landing-status]")?.textContent, li.getAttribute("data-landing"), li.getAttribute("data-parts")]) : [];
      const news = [...document.querySelectorAll("[data-testid=order-news]")].map((x) => x.innerText.replace(/\s+/g, " "));
      return { tick: v.lastTick, rows, news, d: Object.fromEntries(sel.map((id) => [id, [v.formationPos(id)?.map((q) => Math.round(q * 10) / 10) ?? null, v.formationAfloat(id) ? 1 : 0]])) };
    }, sel);
    out.samples.push({ h, ...s });
    console.log(JSON.stringify({ h, ...s }));
    if (h === Number(process.env.CANCELAT ?? 66)) { await page.evaluate(({ ids, x, y, n }) => window.__warsim.hud.commands([...ids].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, nation: n, escort: true }))), { ids: sel, x: from[0], y: from[1], n: NAT }); console.log('CANCEL', h, '(one batch, as player.ts sends a click)'); }
    if (h === Number(process.env.ORDERAT ?? 200)) { const ot = ll(process.env.ORDERTO ?? FROM); await page.evaluate(({ ids, x, y, n }) => window.__warsim.hud.commands([...ids].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, nation: n, escort: true }))), { ids: process.env.ORDERIDS ? process.env.ORDERIDS.split(',').map(Number) : sel, x: ot[0], y: ot[1], n: NAT }); console.log('ORDER', h, ot, process.env.ORDERIDS ?? 'all'); }
    if ((process.env.SHOTAT ?? '').split(',').map(Number).includes(h)) {
      s.panels = {};
      for (const id of sel) { await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id); await page.waitForTimeout(150); s.panels[id] = await page.evaluate(() => document.querySelector('[data-testid=formation-status]')?.textContent ?? null); }
      const p = s.d[sel[sel.length - 1]][0];
      await lookAt(page, p[0], p[1], 600); out.shots.push(await shot(page, `c56rs_${label}_${seed}_h${h}_600m.png`));
      await page.evaluate(() => window.__warsim.hud.selectFormation(0));
      console.log('SHOT', h, JSON.stringify(s.panels));
    }
    if (false) {
      overAt = out.overAt = h;
      const p = s.d[sel[0]][0];
      await lookAt(page, p[0], p[1], 1500); out.shots.push(await shot(page, `c56lland_${label}_${seed}_over_1500m.png`));
      await lookAt(page, p[0], p[1], 250); out.shots.push(await shot(page, `c56lland_${label}_${seed}_over_250m.png`));
      await lookAt(page, to[0], to[1], 1500); out.shots.push(await shot(page, `c56lland_${label}_${seed}_target_1500m.png`));
    }
    await hours(page, STEP);
  }
} catch (e) {
  out.fail = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c56_rs_${label}_${seed}.json`, out);
  await browser.close();
}
