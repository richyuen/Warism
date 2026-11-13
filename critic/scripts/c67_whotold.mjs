// Critic run 57 (new): as c67_lland (TAG at war with FOE, the N nearest FROM sent to TO), stepped to hour AT; then each
// division's panel status and its last order news line, the bar's rows, and the ticker's order rows: which division of
// an ended landing is told, and what. Shot of the bar and one of the untold divisions' panels.
// Usage: node critic/scripts/c67_whotold.mjs <seed> <TAG> <FOE> <from> <to> <N> <AT>
import { launch, open1938, shot, save, hours, CELLS } from './c67_lib.mjs';
const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, AT] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), Number(a[6])];
const out = { seed, TAG, FOE, FROM, TO, N, AT, divs: {} };
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
  await hours(page, AT);
  await page.waitForTimeout(1500);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=landing-row]')].map((li) => li.innerText.replace(/\s+/g, ' ')));
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row], [data-testid=order-news]')].map((r) => r.innerText.replace(/\s+/g, ' ')));
  for (const id of sel) {
    await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
    await page.waitForTimeout(250);
    out.divs[id] = await page.evaluate(() => ({ status: document.querySelector('[data-testid=formation-status]')?.textContent ?? null, panel: document.querySelector('[data-testid=formation-panel]')?.innerText?.replace(/\s+/g, ' ').slice(0, 500) ?? null }));
    await shot(page, `c67wt_${seed}_${id}_h${AT}.png`);
  }
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c67_wt_${TAG}_${seed}_h${AT}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
