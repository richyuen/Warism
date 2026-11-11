// Critic run 62 (new): 1938h, the God Mode and Editor panels opened and closed without an act (the track's line must
// stay), then one God Mode act by mouse (a revolt in Bavaria): the line, the ticker and History after it.
// Usage: node critic/scripts/c62_h_god.mjs
import { launch, shot, save, lookAt, screenOf, CELLS, BASE } from './c62_lib.mjs';
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
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await stepH(48);
  await st('day 2');
  await page.getByTestId('editor-btn').click(); await page.waitForTimeout(600);
  out.editorShot = await shot(page, 'c62hg_editor_open.png');
  await page.getByTestId('editor-btn').click();
  await stepH(2);
  await st('editor opened and closed, no edit');
  await page.getByTestId('god-btn').click(); await page.waitForTimeout(600);
  out.godShot = await shot(page, 'c62hg_god_open.png');
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
  out.actShot = await shot(page, 'c62hg_after_revolt.png');
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(800);
  out.history = (await page.evaluate(() => document.querySelector('[data-testid=history-panel]')?.innerText ?? '')).split('My wars only')[1]?.slice(0, 800) ?? null;
  out.historyShot = await shot(page, 'c62hg_history.png');
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save('c62_hg.json', out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 2500));
