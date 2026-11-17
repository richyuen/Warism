// Critic run 69 (copy of c75_x_trackend, the end moved to 1991): the replay end as a player meets it, from a start in 1991 (replay): stepped to 2 January 1992,
// then the date line (no "Next"), the ticker's end row, History (count, the first rows, rows of January 1992, and
// what a game started in 1975 holds of 1938-74), the charts and the Relations panel (the two blocs).
// Usage: node critic/scripts/c75_x_trackend.mjs [year=1975]
import { launch, shot, save, BASE } from './c75_lib.mjs';
const year = Number(process.argv[2] ?? 1975);
const out = { year };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=999`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  const days = Math.round((Date.UTC(1992, 0, 2) - Date.UTC(year, 0, 1)) / 86400000);
  await page.evaluate((d) => window.__warsim.sim.step(24 * d), days);
  await page.waitForFunction(() => /January 1992/.test(document.querySelector('[data-testid=date-label]')?.innerText ?? ''), null, { timeout: 600_000, polling: 500 });
  await page.waitForTimeout(2500);
  out.date = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((e) => e.innerText.replace(/\n/g, ' ')));
  out.shotEnd = await shot(page, `c75te91_${year}_end.png`);
  let t0 = Date.now();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 120_000 });
  out.historyOpenMs = Date.now() - t0;
  out.count = await page.evaluate(() => document.querySelector('[data-testid=history-count]')?.innerText);
  out.firstRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].slice(0, 25).map((r) => r.innerText.replace(/\n/g, ' ')));
  out.shotHistory = await shot(page, `c75te91_${year}_history.png`);
  out.kinds = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-kind] option')].map((o) => o.textContent));
  await page.getByTestId('history-close').click();
  t0 = Date.now();
  // Run 75: the ranking is closed until asked for (R94a): open it, then its "Charts".
  if (!(await page.getByTestId('ranking-charts').count())) { if (await page.getByTestId('ranking-toggle').count()) await page.getByTestId('ranking-toggle').click(); else await page.getByTestId('stats-btn').click(); await page.waitForTimeout(600); }
  await page.getByTestId('ranking-charts').click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  out.chartsMs = Date.now() - t0;
  out.shotCharts = await shot(page, `c75te91_${year}_charts.png`);
  await page.keyboard.press('Escape');
  await page.getByTestId('ranking-charts').click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  t0 = Date.now();
  await page.getByRole('button', { name: 'Relations', exact: true }).click();
  await page.waitForTimeout(2000);
  out.relationsMs = Date.now() - t0;
  out.relationsText = (await page.evaluate(() => document.querySelector('[data-testid=relations-panel]')?.innerText ?? document.body.innerText)).slice(0, 1500);
  out.shotRelations = await shot(page, `c75te91_${year}_relations.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c75te91_${year}_fatal.png`).catch(() => null); }
out.errors = errors;
save(`c75_te91_${year}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
