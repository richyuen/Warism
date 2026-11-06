// Critic run 34 (R21b, new): is a refusal at a port bombed shut told in the page? 1938 seed 3517, Britain played, God's war
// on France; the three divisions nearest London selected (by the API) and sent to Calais by a real click. Hourly to
// hour 110: every ticker row, every order-news row (any element whose text has "not done"), the panel's notice; at the
// end each division's panel opened in turn (its notice), and a screenshot.
// Usage: node critic/scripts/c45_pst_portshut.mjs
import { launch, open1938, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const nat = CELLS.tags.ENG, FRA = CELLS.tags.FRA;
const out = { rows: [], notDone: [], notices: [], perDiv: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, 3517);
  await page.getByTestId('god-btn').click();
  await page.evaluate(({ a, b }) => window.__warsim.hud.command({ kind: 'forceWar', attacker: a, defender: b }), { a: nat, b: FRA });
  await hours(page, 1);
  await page.getByTestId('god-btn').click().catch(() => {});
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const ids = await page.evaluate(({ nat }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - 1023.5, v.formationPos(id)[1] - 275.5)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map((d) => d[0]);
  }, { nat });
  out.ids = ids;
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((n) => window.__news.push(n)); });
  await page.evaluate((ids) => { const v = window.__warsim.view; for (const id of ids) v.selectedFormations.add(id); window.__warsim.hud.selectFormation(ids[0]); }, ids);
  await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  await page.evaluate(() => window.__warsim.view.showPlace(1034.5, 279.5));
  await page.waitForTimeout(2000); await settle(page, 8000);
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 4, cy + 4); await page.mouse.move(cx, cy); await page.waitForTimeout(500);
  await page.mouse.click(cx, cy);
  for (let h = 1; h <= 110; h++) {
    await hours(page, 1);
    const r = await page.evaluate(() => ({
      ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].map((x) => x.innerText.replace(/\n/g, ' ')),
      notDone: [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && /not done/.test(e.textContent ?? '')).map((e) => e.textContent.trim()),
      notice: document.querySelector('[data-testid=formation-notice]')?.innerText ?? null,
    }));
    for (const t of r.ticker) if (!out.rows.includes(t)) out.rows.push(t);
    for (const t of r.notDone) if (!out.notDone.includes(t)) { out.notDone.push(t); out.notices.push({ h, t }); }
    if (r.notice && !out.notices.some((n) => n.t === r.notice)) out.notices.push({ h, t: r.notice, panel: true });
    if (h === 60 || h === 90) out[`shot${h}`] = await shot(page, `c45pst_h${h}.png`);
  }
  for (const id of ids) {
    await page.evaluate((id) => { const v = window.__warsim.view; v.selectedFormations.clear(); v.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, id);
    await page.waitForTimeout(400);
    out.perDiv.push({ id, status: await page.getByTestId('formation-status').innerText({ timeout: 400 }).catch(() => null), notice: await page.getByTestId('formation-notice').innerText({ timeout: 400 }).catch(() => null), shot: await shot(page, `c45pst_div${id}.png`) });
  }
  out.newsBeforeControl = await page.evaluate(() => window.__news.length);
  // control: an order the sim refuses at once (Bergen, Norway outside the war) must reach the listener
  await page.evaluate(({ id, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x: 1054.5, y: 203.5, nation: n, escort: true }), { id: ids[1], n: nat });
  await hours(page, 1);
  out.news = await page.evaluate(() => window.__news);
  out.rowsAfterControl = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((x) => x.innerText.replace(/\n/g, ' ')));
  out.states = await page.evaluate(async (ids) => { const r = []; for (const id of ids) { const f = await window.__warsim.sim.formation(id); r.push({ id, v: f?.voyage?.state ?? null }); } return r; }, out.ids);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save('c45_pst.json', out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
