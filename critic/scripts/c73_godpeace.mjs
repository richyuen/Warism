// Critic run 71 (new, R85c): a God Mode "Make peace" in the replay. The act is the player's, and it is the act that ends the
// replay; the history row of that peace and the ticker's: does it read "…as history's course ended" (R85c's trackEnd)?
// The 1942 replay, paused; NATION selected, its God tab; the peace button of its war whose name holds FOE's name; two hours on;
// History's peace rows and the ticker. Usage: node critic/scripts/c73_godpeace.mjs [year=1942] [NATION=JAP] [FOE=United States] [W H]
import { launch, shot, save, CELLS, BASE } from './c73_lib.mjs';
const year = Number(process.argv[2] ?? 1942), NATION = process.argv[3] ?? 'JAP', FOE = process.argv[4] ?? 'United States';
const W = Number(process.argv[5] ?? 1600), H = Number(process.argv[6] ?? 900);
const label = `${year}_${NATION}_${FOE.replace(/\W+/g, '')}_${W}x${H}`;
const out = { year, NATION, FOE, W, H };
const { browser, page, errors } = await launch(W, H);
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 600000 ? done() : setTimeout(f, 20)); f(); });
}, n);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  await page.waitForTimeout(2500);
  await page.getByTestId('god-btn').click(); await page.waitForTimeout(500);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[NATION]);
  await page.waitForTimeout(800);
  await page.locator('.panel-tabs button', { hasText: 'God' }).first().click();
  await page.waitForTimeout(800);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('.god-row')].map((r) => r.innerText.replace(/\s+/g, ' ')).filter((s) => s.includes('⚔')));
  out.notes = await page.evaluate(() => [...document.querySelectorAll('[data-testid=god-ends-track],[data-testid=take-ends-track]')].map((e) => e.innerText));
  const row = page.locator('.god-row', { hasText: FOE }).filter({ hasText: '⚔' }).first();
  await row.scrollIntoViewIfNeeded();
  out.tabShot = await shot(page, `c73gp_${label}_0tab.png`);
  await row.locator('button[data-testid^=god-peace-]').click();
  await stepH(2);
  await page.waitForTimeout(1500);
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 12).map((e) => e.innerText.replace(/\n/g, ' ')));
  out.tickerShot = await shot(page, `c73gp_${label}_1ticker.png`);
  await page.keyboard.press('Escape');
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  await page.waitForTimeout(800);
  out.history = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\s+/g, ' ')).filter((s) => /peace|course|replay/i.test(s)).slice(0, 20));
  out.historyShot = await shot(page, `c73gp_${label}_2history.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); console.log(out.fatal); }
out.errors = errors;
save(`c73_gp_${label}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
