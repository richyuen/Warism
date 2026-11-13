// Critic run 66 (new): R73's notice for a refused start. Cases: 1960 replay served 404; 1975 free served 404; a year
// never built (1977); 1961's bytes served for 1960; with a saved game present, 1960 replay served 404. For each: the
// URL landed on, the notice's text, which card is open, the slider's year and the start date shown, the saved game's
// card and its Continue. At 1600 x 900 and 390 x 844.
// Usage: node critic/scripts/c66_x_badyear2.mjs
import { launch, open1938, shot, save, BASE } from './c66_lib.mjs';
const out = { cases: [] };
const read = (page) => page.evaluate(() => ({
  url: location.search,
  notice: document.querySelector('[data-testid=title-start-error]')?.innerText ?? null,
  saveCard: document.querySelector('[data-testid=title-save]')?.innerText ?? null,
  continueBtn: document.querySelectorAll('[data-testid=title-continue]').length,
  slider: document.querySelector('[data-testid=title-start-year]')?.value ?? null,
  date: document.querySelector('[data-testid=title-start-date]')?.innerText ?? null,
  nations: document.querySelector('[data-testid=title-nations]')?.innerText ?? null,
  powers: document.querySelector('[data-testid=title-powers]')?.innerText ?? null,
  preview: document.querySelector('[data-testid=title-preview]')?.getAttribute('src') ?? null,
  heading: [...document.querySelectorAll('h2,h3')].map((e) => e.innerText).slice(0, 4),
  noticeVisible: (() => { const e = document.querySelector('[data-testid=title-start-error]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), inView: r.bottom <= innerHeight && r.top >= 0 }; })(),
}));
for (const [W, H] of [[1600, 900], [390, 844]]) {
  const cases = [
    { name: '404replay1960', year: 1960, mode: 'replay', route: (p) => p.route('**/start/1960.sav', (r) => r.fulfill({ status: 404, body: 'no' })) },
    { name: '404free1975', year: 1975, mode: 'free', route: (p) => p.route('**/start/1975.sav', (r) => r.fulfill({ status: 404, body: 'no' })) },
    { name: 'never1977', year: 1977, mode: 'replay', route: async () => {} },
    { name: 'wrongbytes1960', year: 1960, mode: 'replay', route: (p) => p.route('**/start/1960.sav', async (r) => { const resp = await p.request.fetch(`${BASE}/data/scenarios/1938h/start/1961.sav`); r.fulfill({ status: 200, body: await resp.body() }); }) },
  ];
  for (const c of cases) {
    const { browser, page, errors } = await launch(W, H);
    const rec = { W, H, name: c.name };
    try {
      await c.route(page);
      await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${c.year}&mode=${c.mode}&after=7`);
      await page.getByTestId('title-screen').waitFor({ timeout: 60000 });
      await page.waitForTimeout(1500);
      rec.read = await read(page);
      rec.shot = await shot(page, `c66by2_${W}x${H}_${c.name}.png`);
    } catch (e) { rec.fatal = String(e?.stack ?? e).slice(0, 400); }
    rec.errors = errors.filter((e) => !e.includes('could not be loaded')).slice(0, 4);
    rec.warn = errors.filter((e) => e.includes('could not be loaded')).slice(0, 1);
    out.cases.push(rec);
    await browser.close();
  }
  // With a saved game present.
  const { browser, page, errors } = await launch(W, H);
  const rec = { W, H, name: 'withSave404replay1960' };
  try {
    await open1938(page, 4711);
    await page.evaluate(() => window.__warsim.sim.step(24 * 5));
    await page.waitForTimeout(1500);
    await page.getByTestId('settings-btn').click();
    await page.getByTestId('settings-menu').click();
    await page.getByTestId('title-screen').waitFor();
    await page.waitForTimeout(1500);
    rec.before = await read(page);
    await page.route('**/start/1960.sav', (r) => r.fulfill({ status: 404, body: 'no' }));
    await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=1960&mode=replay&after=7`);
    await page.getByTestId('title-screen').waitFor({ timeout: 60000 });
    await page.waitForTimeout(2500);
    rec.read = await read(page);
    rec.shot = await shot(page, `c66by2_${W}x${H}_withSave.png`);
    // Continue still works?
    if (rec.read.continueBtn > 0) {
      await page.getByTestId('title-continue').click();
      await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null, null, { timeout: 60000 });
      rec.continued = await page.evaluate(() => ({ tick: window.__warsim.sim.tick ?? null, url: location.search }));
    }
  } catch (e) { rec.fatal = String(e?.stack ?? e).slice(0, 400); }
  rec.errors = errors.filter((e) => !e.includes('could not be loaded')).slice(0, 4);
  out.cases.push(rec);
  await browser.close();
}
save('c66_by2.json', out);
console.log(JSON.stringify(out, null, 1));
