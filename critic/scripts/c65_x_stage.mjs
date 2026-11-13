// Critic run 65 (new): R66's armies on a stage's front, as a viewer sees them. The replay from 1 January of a year,
// stepped to a day inside a stage's 7-day window (or just before it), then the stage's place at 3000, 600, 120 and 40
// m/px: the chips, the engaged figures, the line. Daily for the window's days at 600 m/px: shots and the ticker.
// Usage: node critic/scripts/c65_x_stage.mjs <label> <year> <isoDate to reach> <cx> <cy> [windowDays=8]
import { launch, shot, save, lookAt, BASE } from './c65_lib.mjs';
const [label, yearS, dateS, cxS, cyS, wdS] = process.argv.slice(2);
const year = Number(yearS), cx = Number(cxS), cy = Number(cyS), wd = Number(wdS ?? 8);
const out = { label, year, dateS, cx, cy, views: [], days: [] };
const { browser, page, errors } = await launch(1600, 900);
const text = () => page.evaluate(() => ({ date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null, ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(0, 6), chips: [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' ')).slice(0, 6) }));
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=555`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  const days = Math.round((Date.parse(dateS) - Date.UTC(year, 0, 1)) / 86400000);
  await page.evaluate((d) => window.__warsim.sim.step(24 * d), days);
  await page.waitForTimeout(5000);
  out.at = await text();
  for (const m of [3000, 600, 120, 40]) {
    await lookAt(page, cx, cy, m, true);
    await page.waitForTimeout(500);
    out.views.push({ m, shot: await shot(page, `c65st_${label}_${m}.png`) });
  }
  await lookAt(page, cx, cy, 600, true);
  for (let d = 1; d <= wd; d++) {
    await page.evaluate(() => window.__warsim.sim.step(24));
    await page.waitForTimeout(1800);
    const t = await text();
    t.shot = await shot(page, `c65st_${label}_d${d}.png`);
    out.days.push(t);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c65_st_${label}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3500));
