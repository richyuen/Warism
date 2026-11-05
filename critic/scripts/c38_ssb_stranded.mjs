// Critic run 36 (copy of run 35) (R22b, new): evidence for the division left at the port. 1938 seed 3517, Japan played, the four divisions
// nearest Tokyo ordered to Shanghai through the page's command (escort on); at hour 26 the one aboard is ordered to
// Shanghai again (the same command). At hours 600, 1100, 1250, 1300: the panels of 364 (the first) and 365 (the second),
// crops; at 1250 the camera on Tokyo with 365 selected.
// Usage: node critic/scripts/c38_ssb_stranded.mjs
import { launch, open1938, save, hours, CELLS, shot, settle } from './c31_lib.mjs';
const nat = CELLS.tags.JAP;
const out = { marks: [] };
const { browser, page, errors } = await launch(1600, 900);
const sel = (id) => page.evaluate((id) => { const v = window.__warsim.view; v.selectedFormations.clear(); v.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, id);
const panel = async () => ({
  status: await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null),
  wait: await page.getByTestId('formation-wait').innerText({ timeout: 500 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null),
});
try {
  await open1938(page, 3517);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push(m)); });
  const ids = await page.evaluate(({ nat }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - 1818.5, v.formationPos(id)[1] - 385.5)]).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
  }, { nat });
  out.ids = ids;
  const order = (id) => page.evaluate(({ id, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: n, escort: true }), { id, n: nat });
  for (const id of ids) await order(id);
  let h = 0;
  await hours(page, 26); h = 26;
  out.before = await page.evaluate(async (id) => (await window.__warsim.sim.formation(id))?.voyage ?? null, ids[0]);
  await order(ids[0]);
  for (const at of [600, 1100, 1250, 1300]) {
    await hours(page, at - h); h = at;
    const m = { h };
    for (const id of ids.slice(0, 2)) {
      await sel(id); await page.waitForTimeout(500);
      m[id] = await panel();
      const crop = `critic/shots/c38ssb_h${at}_${id}_panel.png`;
      await page.getByTestId('formation-panel').screenshot({ path: crop }).catch(() => {});
      m[`${id}crop`] = crop;
    }
    m.voyages = await page.evaluate(async (ids) => { const r = {}; for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r[id] = [f?.voyage?.state ?? null, p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null]; } return r; }, ids);
    if (at === 1250) {
      await sel(ids[1]);
      await page.evaluate(() => window.__warsim.view.showPlace(1819.5, 385.5));
      await page.waitForTimeout(1500); await settle(page, 6000);
      m.shot = await shot(page, 'c38ssb_h1250_tokyo.png');
    }
    out.marks.push(m);
  }
  out.news = await page.evaluate(() => window.__news);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((x) => x.innerText.replace(/\n/g, ' ')).filter((t) => /division|landing|transport|not done/i.test(t)));
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save('c38_ssb.json', out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
