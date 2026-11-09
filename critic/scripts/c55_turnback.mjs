// Critic run 54 (copy of c55_cancel_page with SHOTAT=h,h: shots and the bar's text at those hours, the row opened). R47c's cancel in the page, followed every 3 hours. Takes TAG at war with FOE, orders the N
// divisions nearest FROM to TO by sea, presses the first row's "Cancel the landing" at hour CANCEL (after the click),
// then every 3 h for HOURS: each division's place, its panel status, the bar's rows; shots of the division's place on
// the bar's "cancelled" hour and at the end (camera on the division, 600 m/px).
// Usage: node critic/scripts/c55_cancel_page.mjs <seed> <TAG> <FOE> <from x,y cells> <to x,y cells> <N> <label> [CANCEL] [HOURS] [W H]
import { launch, open1938, shot, save, hours, lookAt, CELLS } from './c55_lib.mjs';

const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, label] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), a[6]];
const CANCEL = Number(a[7] ?? 26), HOURS = Number(a[8] ?? 240), W = Number(a[9] ?? 1600), H = Number(a[10] ?? 900);
const out = { seed, TAG, FOE, FROM, TO, N, label, CANCEL, samples: [], shots: [] };
const { browser, page, errors } = await launch(W, H);
const ll = (s) => s.split(',').map(Number);
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=landing-row]')].map((li) => [li.querySelector('[data-testid=landing-title]')?.textContent, li.getAttribute('data-state'), li.querySelector('[data-testid=landing-status]')?.textContent]));
const status = async (id) => {
  await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
  await page.waitForTimeout(150);
  const s = await page.evaluate(() => document.querySelector('[data-testid=formation-status]')?.textContent ?? null);
  await page.evaluate(() => window.__warsim.hud.selectFormation(0));
  return s;
};
try {
  await open1938(page, seed);
  const NAT = CELLS.tags[TAG], FOEID = CELLS.tags[FOE];
  const from = ll(FROM), to = ll(TO);
  await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: NAT, d: FOEID });
  await page.evaluate(() => window.__warsim.sim.step(1));
  await page.evaluate((n) => window.__warsim.view.select(n), NAT);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  const sel = await page.evaluate(({ n, x, y, N }) => {
    const v = window.__warsim.view;
    return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]);
  }, { n: NAT, x: from[0], y: from[1], N });
  out.ids = sel;
  for (const id of sel) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: to[0], y: to[1], n: NAT });
  const t0 = await page.evaluate(() => window.__warsim.view.lastTick);
  out.t0 = t0;
  let cancelledShot = false;
  for (let h = 0; h <= HOURS; h += 3) {
    if (h >= CANCEL && out.cancelAt === undefined) {
      await page.evaluate(() => window.__warsim.hud.selectFormation(0));
      await page.waitForTimeout(200);
      const t = page.getByTestId('landing-toggle');
      if ((await t.count()) > 0) {
        await t.first().click();
        await page.waitForTimeout(200);
        out.cancelRow = await rows();
        out.cancelDivs = await page.evaluate(() => [...document.querySelectorAll('[data-testid=landing-division]')].map((d) => d.getAttribute('data-formation')));
        await page.getByTestId('landing-cancel').first().click();
        out.cancelAt = h;
        out.shots.push(await shot(page, `c55tb_${label}_${seed}_cancelclick.png`));
      } else out.cancelAt = -1;
    }
    const s = { h, tick: await page.evaluate(() => window.__warsim.view.lastTick), rows: await rows(), d: {} };
    for (const id of sel) s.d[id] = [await page.evaluate((id) => window.__warsim.view.formationPos(id)?.map((v) => Math.round(v * 10) / 10) ?? null, id), await status(id)];
    if ((process.env.SHOTAT ?? '').split(',').map(Number).includes(h)) {
      s.barText = await page.evaluate(() => document.querySelector('[data-testid=landings-bar]')?.innerText ?? null);
      out.shots.push(await shot(page, `c55tb_${label}_${seed}_h${h}.png`));
    }
    out.samples.push(s);
    console.log(JSON.stringify(s));
    if (!cancelledShot && s.rows.some((r) => r[1] === 'over' && /cancel/.test(r[2] ?? ''))) {
      cancelledShot = true;
      const id = Number(out.cancelDivs?.[0] ?? sel[0]);
      const p = s.d[id][0];
      if (p) await lookAt(page, p[0], p[1], 600);
      out.shots.push(await shot(page, `c55tb_${label}_${seed}_cancelled_h${h}.png`));
    }
    await hours(page, 3);
  }
  const id = Number(out.cancelDivs?.[0] ?? sel[0]);
  const p = await page.evaluate((id) => window.__warsim.view.formationPos(id), id);
  if (p) await lookAt(page, p[0], p[1], 600);
  await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
  await page.waitForTimeout(300);
  out.shots.push(await shot(page, `c55tb_${label}_${seed}_end.png`));
  out.tickerEnd = await page.evaluate(() => document.body.innerText.split('\n').filter((l) => /19\d\d /.test(l)).slice(-10));
} catch (e) {
  out.fail = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c55_tb_${label}_${seed}.json`, out);
  await browser.close();
}
