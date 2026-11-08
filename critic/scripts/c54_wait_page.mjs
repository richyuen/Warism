// Critic run 52 (new): R42a, "a click whose landing waits says so in days", as the player meets it, on run 49's case
// (20661, Japan, the N divisions nearest Tokyo to Shanghai) and others. Takes control of TAG, at war with FOE, selects the
// N nearest FROM, clicks TO by sea; then each day: hovers TO and reads the by-sea tooltip (its text and data-days), reads
// each division's panel status, and whether it is afloat; until all are afloat or landed, or DAYS. Judges whether the
// told days count down and match when it sails.
// Usage: node critic/scripts/c54_wait_page.mjs <seed> <TAG> <FOE> <fromLon,fromLat> <toLon,toLat> <N> <label> [W H] [DAYS]
import { launch, open1938, shot, save, hours, settle, CELLS, cellOf } from './c54_lib.mjs';

const [seed, TAG, FOE, FROM, TO, N, label, W, H, DAYS] = [Number(process.argv[2] ?? 20661), process.argv[3] ?? 'JAP', process.argv[4] ?? 'CHI', process.argv[5] ?? '139.69,35.69', process.argv[6] ?? '121.47,31.23', Number(process.argv[7] ?? 2), process.argv[8] ?? 'jap_sh', Number(process.argv[9] ?? 1600), Number(process.argv[10] ?? 900), Number(process.argv[11] ?? 45)];
const out = { seed, TAG, FOE, FROM, TO, N, label, W, H, days: [], shots: [] };
const { browser, page, errors } = await launch(W, H);
const ll = async (s) => s.split(',').map(Number); // cells (from c54_ll.ts)
async function hover(x, y) {
  await page.evaluate(([x, y]) => window.__warsim.view.showPlace(x, y), [x, y]);
  await page.waitForTimeout(400);
  const box = await page.locator('canvas').first().boundingBox();
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(500);
}
try {
  await open1938(page, seed);
  const NAT = CELLS.tags[TAG], FOEID = CELLS.tags[FOE];
  out.nat = [NAT, FOEID];
  const from = await ll(FROM), to = await ll(TO);
  out.toCell = to;
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
  for (const id of sel) await page.evaluate((id) => window.__warsim.view.selectedFormations.add(id), id);
  for (const id of sel) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: to[0], y: to[1], n: NAT });
  await page.evaluate(() => window.__warsim.sim.step(2));

  let sailedDay = null;
  for (let d = 0; d <= DAYS; d++) {
    const rec = { day: d };
    // Re-select the click's divisions so the hover is of them.
    await page.evaluate((ids) => { const v = window.__warsim.view; v.selectedFormations.clear(); for (const id of ids) v.selectedFormations.add(id); }, sel);
    await hover(to[0], to[1]);
    rec.tip = await page.evaluate(() => { const t = document.querySelector('[data-testid=tooltip-by-sea]'); return t ? { text: t.innerText, days: t.getAttribute('data-days'), same: t.getAttribute('data-same') } : null; });
    rec.status = {};
    rec.afloat = {};
    for (const id of sel) {
      rec.afloat[id] = await page.evaluate((id) => { const v = window.__warsim.view; return v.formationAfloat(id) ? 1 : 0; }, id);
      await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
      await page.waitForTimeout(250);
      rec.status[id] = await page.evaluate(() => { const s = document.querySelector('[data-testid=formation-status]'); const w = document.querySelector('[data-testid=formation-panel]'); return s ? s.textContent : (w ? '(panel, no status)' : null); });
    }
    if (d === 0 || d === 3 || (rec.tip && d % 7 === 0)) {
      await page.evaluate((ids) => { const v = window.__warsim.view; v.selectedFormations.clear(); for (const id of ids) v.selectedFormations.add(id); }, sel);
      await hover(to[0], to[1]);
      out.shots.push(await shot(page, `c54wait_${label}_${seed}_${W}_d${d}.png`));
    }
    out.days.push(rec);
    console.log(JSON.stringify(rec));
    if (sel.every((id) => rec.afloat[id]) && sailedDay === null) { sailedDay = d; out.sailedDay = d; }
    if (sailedDay !== null && d > sailedDay + 2) break;
    await hours(page, 24);
  }
} finally {
  out.errors = errors;
  save(`c54_wait_${label}_${seed}_${W}.json`, out);
  await browser.close();
}
