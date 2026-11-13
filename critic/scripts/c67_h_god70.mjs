// Critic run 65 (new; from c67_h_god.mjs): the same God act (a revolt in Bavaria) in a replay started from 1970: the line, ticker, History.
// stay), then one God Mode act by mouse (a revolt in Bavaria): the line, the ticker and History after it.
// Usage: node critic/scripts/c67_h_god.mjs
import { launch, shot, save, lookAt, screenOf, CELLS, BASE } from './c67_lib.mjs';
const out = { steps: [] };
const { browser, page, errors } = await launch(1600, 900);
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
    ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-3).join(' // '),
  }));
  out.steps.push({ s, ...r });
  console.log(s, JSON.stringify(r));
};
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=1970&mode=replay&after=4343`);
  await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await stepH(48);
  await st('day 2');
  await page.getByTestId('editor-btn').click(); await page.waitForTimeout(600);
  out.editorShot = await shot(page, 'c67hg70_editor_open.png');
  await page.getByTestId('editor-btn').click();
  await stepH(2);
  await st('editor opened and closed, no edit');
  await page.getByTestId('god-btn').click(); await page.waitForTimeout(600);
  out.godShot = await shot(page, 'c67hg70_god_open.png');
  await stepH(2);
  await st('God Mode open, no act');
  const [bx, by] = CELLS.berlin;
  await lookAt(page, bx - 6, by + 10, 2500);
  await page.locator('[data-testid=god-tool-revolt]').click();
  await page.waitForTimeout(300);
  const [sx, sy] = await screenOf(page, bx - 6, by + 10);
  await page.mouse.click(sx, sy);
  await page.waitForTimeout(600);
  await stepH(2);
  await st('after a revolt by God Mode');
  out.actShot = await shot(page, 'c67hg70_after_revolt.png');
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(800);
  out.history = (await page.evaluate(() => document.querySelector('[data-testid=history-panel]')?.innerText ?? '')).split('My wars only')[1]?.slice(0, 800) ?? null;
  out.historyShot = await shot(page, 'c67hg70_history.png');
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save('c67_hg70.json', out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 2500));
