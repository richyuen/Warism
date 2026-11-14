// Critic run 62 (new): the historical track's end at the first intervention, as the player meets it. Two pages of
// 1938h with different ?seed= and ?after=: equal hashes over the first days (the seed fixed); in each, what does not
// end the track (pause, speed, a selection, panels), then "Take control" of Germany on day 3 by the panel's button: the
// line under the date, the ticker and History afterwards; then 200 days on, the two pages' hashes (the second seeds).
// Usage: node critic/scripts/c68_h_interv.mjs [W] [H]
import { launch, shot, save, BASE, CELLS } from './c68_lib.mjs';
const W = Number(process.argv[2] ?? 1600), H = Number(process.argv[3] ?? 900);
const out = { W, H, pages: [] };
const { browser, page, errors } = await launch(W, H);
const page2 = await browser.newPage({ viewport: { width: W, height: H } });
const errors2 = [];
page2.on('pageerror', (e) => errors2.push(e.message));
const ready = async (p) => {
  await p.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await p.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
};
const stepH = (p, n) => p.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 600000 ? done() : setTimeout(f, 20)); f(); });
}, n);
const state = (p) => p.evaluate(async () => ({
  tick: window.__warsim.hud.tick.value,
  hash: await window.__warsim.sim.hash(),
  date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
  next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
  ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-5),
}));
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1&seed=5&after=11`);
  await page2.goto(`${BASE}/?scenario=1938h&paused=1&seed=77&after=22`);
  await ready(page); await ready(page2);
  await stepH(page, 72); await stepH(page2, 72);
  const a = await state(page), b = await state(page2);
  out.day3 = { a, b, sameHash: a.hash === b.hash };
  // Not interventions: pause twice, speed up and down, select Germany, open History and Statistics, close them.
  const notInterv = async (p) => {
    await p.getByTestId('pause-btn').click(); await p.getByTestId('pause-btn').click();
    await p.getByTestId('speed-up').click(); await p.getByTestId('speed-down').click();
    await p.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.GER);
    await p.getByTestId('history-btn').click(); await p.waitForTimeout(400); await p.getByTestId('history-btn').click();
    await p.getByTestId('stats-btn').click(); await p.waitForTimeout(400); await p.getByTestId('stats-btn').click();
    if (!(await p.evaluate(() => window.__warsim.hud.paused.value))) await p.getByTestId('pause-btn').click();
    await stepH(p, 2);
    return state(p);
  };
  out.afterNotInterv = await notInterv(page);
  out.notIntervShot = await shot(page, `c68hi_${W}x${H}_notinterv.png`);
  // The intervention: Take control of Germany.
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await stepH(page, 2);
  out.afterTake = await state(page);
  out.takeShot = await shot(page, `c68hi_${W}x${H}_taken.png`);
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(800);
  out.history = (await page.evaluate(() => document.querySelector('[data-testid=history-panel]')?.innerText ?? '')).slice(0, 1500);
  out.historyShot = await shot(page, `c68hi_${W}x${H}_history.png`);
  await page.getByTestId('history-btn').click();
  // The other page: the same intervention, by the API's select and the same button.
  await page2.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.GER);
  await page2.getByTestId('take-control').click();
  await page2.getByTestId('release-control').waitFor({ timeout: 10000 });
  await stepH(page2, 2);
  out.afterTake2 = await state(page2);
  for (let d = 0; d < 4; d++) { await stepH(page, 24 * 50); await stepH(page2, 24 * 50); }
  const a2 = await state(page), b2 = await state(page2);
  out.day205 = { a: a2, b: b2, sameHash: a2.hash === b2.hash };
  out.day205Shot = await shot(page, `c68hi_${W}x${H}_day205.png`);
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(800);
  out.history205 = (await page.evaluate(() => document.querySelector('[data-testid=history-panel]')?.innerText ?? '')).slice(0, 2500);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors; out.errors2 = errors2;
save(`c68_hi_${W}x${H}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
