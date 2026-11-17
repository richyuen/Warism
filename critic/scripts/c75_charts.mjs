// Critic run 73 (new): the ranking and the charts on a desk since R94a (the ranking closed until asked for). 1938
// SEED, DAYS days at Max; then Statistics by its button: what opens, the ranking's rows, "Charts", a chart drawn.
// Usage: node critic/scripts/c75_charts.mjs <seed> [days=200]
import { launch, open1938, shot, save, hours } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 56995), days = Number(process.argv[3] ?? 200);
const out = { seed, days, steps: [] };
const { browser, page, errors } = await launch(1600, 900);
const count = (id) => page.getByTestId(id).count();
try {
  await open1938(page, seed);
  await hours(page, days * 24);
  await page.waitForTimeout(1200);
  out.before = { ranking: await count('stats-ranking'), toggle: await count('ranking-toggle'), rows: await count('rank-row') };
  out.shot0 = await shot(page, `c75ch_${seed}_0closed.png`);
  if (await count('ranking-toggle')) await page.getByTestId('ranking-toggle').click(); else await page.getByTestId('stats-btn').click();
  await page.waitForTimeout(800);
  out.afterOpen = { ranking: await count('stats-ranking'), rows: await count('rank-row'), charts: await count('ranking-charts'), text: (await page.getByTestId('stats-ranking').first().innerText().catch(() => '')).slice(0, 300) };
  out.shot1 = await shot(page, `c75ch_${seed}_1ranking.png`);
  if (await count('ranking-charts')) { await page.getByTestId('ranking-charts').click(); await page.waitForTimeout(1000); }
  else if (await count('stats-btn')) { await page.getByTestId('stats-btn').click(); await page.waitForTimeout(1000); }
  out.afterCharts = await page.evaluate(() => ({ canvases: [...document.querySelectorAll('canvas')].length, svgs: [...document.querySelectorAll('svg')].length, panel: document.querySelector('.stats-chart, [data-testid=stats-chart], [data-testid=stats-panel]')?.innerText?.slice(0, 300) ?? null }));
  out.shot2 = await shot(page, `c75ch_${seed}_2charts.png`);
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1000);
}
out.errors = errors;
save(`c75_ch_${seed}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
