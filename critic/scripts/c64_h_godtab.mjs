// Critic run 63 (new): R64a's notes and the nation panel's God tab. 1938h, God Mode on, Germany selected, its God tab:
// what notes does the player see beside the tab's own controls, and does one tick of a checkbox ("World AI") end the
// replay, told how? Shots of the tab before and after, the "Next" line, the ticker.
// Usage: node critic/scripts/c64_h_godtab.mjs [W H] [testid=god-world-ai]
import { launch, shot, save, CELLS, BASE } from './c64_lib.mjs';
const W = Number(process.argv[2] ?? 1600), H = Number(process.argv[3] ?? 900), TID = process.argv[4] ?? 'god-world-ai';
const out = { W, H, TID, steps: [] };
const { browser, page, errors } = await launch(W, H);
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 600000 ? done() : setTimeout(f, 20)); f(); });
}, n);
const st = async (s) => {
  await page.waitForTimeout(1300);
  const r = await page.evaluate(() => ({
    tick: window.__warsim.view.lastTick,
    next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
    notes: [...document.querySelectorAll('[data-testid=take-ends-track],[data-testid=god-ends-track],[data-testid=editor-ends-track]')].map((e) => `${e.dataset.testid}: ${e.innerText}`),
    ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-3).join(' // '),
    godTab: document.querySelector('[data-testid=panel-god]')?.innerText.slice(0, 600) ?? null,
  }));
  out.steps.push({ s, ...r });
  console.log(s, JSON.stringify(r).slice(0, 700));
};
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await stepH(48);
  await page.getByTestId('god-btn').click(); await page.waitForTimeout(500);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.GER);
  await page.waitForTimeout(800);
  const tab = page.locator('.panel-tabs button', { hasText: 'God' });
  out.tabFound = await tab.count();
  await tab.first().click();
  await page.waitForTimeout(600);
  await st('God tab open, no act');
  out.tabShot = await shot(page, `c64hgt_${W}x${H}_tab.png`);
  const box = page.getByTestId(TID);
  await box.scrollIntoViewIfNeeded();
  out.boxShot = await shot(page, `c64hgt_${W}x${H}_box.png`);
  await box.click();
  await stepH(2);
  await st(`after a click on ${TID}`);
  out.afterShot = await shot(page, `c64hgt_${W}x${H}_after.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); console.log(out.fatal); }
out.errors = errors;
save(`c64_hgt_${W}x${H}_${TID}.json`, out);
await browser.close();
