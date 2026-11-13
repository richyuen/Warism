// Critic run 65 (new): R68b's refusals. A start from a year whose save is (a) another year's bytes (1961's served for
// 1960), (b) missing (404), (c) a year not built (1977). Where does the page land, what does it say, and does a world
// run anyway? Usage: node critic/scripts/c67_x_badyear.mjs
import { launch, shot, save, BASE } from './c67_lib.mjs';
const out = { cases: [] };
const one = async (label, year, route) => {
  const { browser, page, errors } = await launch(1600, 900);
  const r = { label, year };
  try {
    if (route) await route(page);
    await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=7`);
    await page.waitForTimeout(12000);
    r.url = page.url();
    r.title = await page.evaluate(() => !!document.querySelector('[data-testid=title-screen]'));
    r.notice = await page.evaluate(() => [...document.querySelectorAll('.panel-warn, [data-testid=title-load-failed], [data-testid=title-save-error]')].map((e) => e.innerText).join(' | '));
    r.date = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
    r.shot = await shot(page, `c67by_${label}.png`);
  } catch (e) { r.fatal = String(e).slice(0, 300); }
  r.errors = errors.slice(0, 4);
  out.cases.push(r);
  await browser.close();
};
await one('wrongbytes', 1960, (page) => page.route('**/start/1960.sav', async (route) => {
  const res = await page.request.get(`${BASE}/data/scenarios/1938h/start/1961.sav`);
  await route.fulfill({ status: 200, body: await res.body(), contentType: 'application/octet-stream' });
}));
await one('missing', 1960, (page) => page.route('**/start/1960.sav', (route) => route.fulfill({ status: 404, body: 'no' })));
await one('notbuilt', 1977, null);
save('c67_by.json', out);
console.log(JSON.stringify(out, null, 1));
