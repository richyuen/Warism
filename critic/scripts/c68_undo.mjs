// Critic run 68 (new, R81b): the one-step undo of a God Mode act, attacked where the builder's spec does not go:
// an act followed by 30 days of play, then Undo. Does the world, the date, the history list, the ticker, the charts
// and the map's own effects (the burst's cloud and mark, the ruins) all go back together? Then the replay: an act
// ends the track; Undo after days of play; does the track (its Next line) come back?
// Usage: node critic/scripts/c68_undo.mjs <seed> [days=30]
import { launch, BASE, shot, save, lookAt, CELLS, hours, open1938 } from './c68_lib.mjs';

const seed = Number(process.argv[2] ?? 41201);
const days = Number(process.argv[3] ?? 30);
const out = { seed, days, shots: [], steps: [] };
const { browser, page, errors } = await launch();
const S = async (n) => out.shots.push(await shot(page, `c68u_${seed}_${n}.png`));
const hash = () => page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
const state = async (label) => {
  const s = await page.evaluate(async () => {
    const w = window.__warsim;
    const h = await w.sim.hash();
    const txt = document.body.innerText;
    return {
      hash: h.hash,
      tick: w.view.lastTick,
      date: String(w.hud.date?.() ?? ''),
      undoBtn: !!document.querySelector('[data-testid=god-undo]'),
      undoTitle: document.querySelector('[data-testid=god-undo]')?.getAttribute('title') ?? null,
      undone: document.querySelector('[data-testid=god-undone]')?.innerText ?? null,
      nukeAlert: document.querySelector('[data-testid=nuke-alert-text]')?.innerText ?? null,
      tickerFirst: [...document.querySelectorAll('[data-testid=ticker] li, [data-testid^=ticker-row]')].slice(0, 4).map((e) => e.innerText.slice(0, 120)),
      berlinLines: txt.split('\n').filter((l) => /Berlin|hydrogen|atomic/i.test(l)).slice(0, 8),
    };
  });
  out.steps.push({ label, ...s });
  return s;
};
const historyText = async (label) => {
  await page.evaluate(() => window.__warsim.hud.toggleHistory());
  await page.waitForTimeout(900);
  await S(`hist_${label}`);
  const t = await page.evaluate(() => {
    const el = document.querySelector('[data-testid=history-panel]') ?? document.body;
    return el.innerText;
  });
  await page.evaluate(() => window.__warsim.hud.toggleHistory());
  await page.waitForTimeout(300);
  const lines = t.split('\n');
  out.steps.push({ label: `history ${label}`, lines: lines.length, strikeLines: lines.filter((l) => /hydrogen|atomic|struck/i.test(l)).slice(0, 6), head: lines.slice(0, 25) });
};

await open1938(page, seed);
await hours(page, 240);
await page.getByTestId('god-btn').click();
await page.waitForTimeout(500);
const [bx, by] = CELLS.berlin;
await state('before act');
await historyText('before');
await lookAt(page, bx, by, 937);
await S('00_berlin_937_before');

// The act: an H-bomb on Berlin by the bar.
await page.getByTestId('god-tool-nuke').click();
await page.getByTestId('god-nuke-size').selectOption('thermonuclear');
await page.mouse.click(800, 450);
await page.waitForTimeout(2000);
await state('just after act');
await S('01_berlin_937_act');
// Play on.
await page.getByTestId('god-tool-nuke').click(); // disarm
await hours(page, days * 24);
await state(`after ${days} days`);
await lookAt(page, bx, by, 937);
await S('02_berlin_937_later');
await lookAt(page, bx, by, 150);
await S('03_berlin_150_later');
await historyText('later');

// Undo.
const tUndo = Date.now();
await page.getByTestId('god-undo').click();
await page.waitForFunction(() => !document.querySelector('[data-testid=god-undo]'), null, { timeout: 20_000 }).catch(() => {});
out.undoMs = Date.now() - tUndo;
await page.waitForTimeout(1500);
await state('after undo');
await lookAt(page, bx, by, 937);
await S('04_berlin_937_undone');
await page.waitForTimeout(10_000);
await S('05_berlin_937_undone_10s');
await lookAt(page, bx, by, 150);
await S('06_berlin_150_undone');
await historyText('undone');
await page.evaluate(() => window.__warsim.hud.toggleCharts?.());
await page.waitForTimeout(900);
await S('07_charts_undone');
await page.evaluate(() => window.__warsim.hud.toggleCharts?.());
// Play on after the undo: no stale effect left.
await hours(page, 48);
await state('48 h after undo');
await lookAt(page, bx, by, 937);
await S('08_berlin_937_after_undo_48h');

// The replay: an act ends the track; Undo; is the track back?
const rp = await browser.newPage({ viewport: { width: 1600, height: 900 } });
rp.on('pageerror', (e) => errors.push(`replay pageerror: ${e.message}`));
await rp.goto(`${BASE}/?scenario=1938h&paused=1&seed=1938`);
await rp.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 180_000 });
await rp.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  await new Promise((d) => { const f = () => (w.view.lastTick >= target ? d() : setTimeout(f, 20)); f(); });
}, 24 * 20);
const rtext = async (label) => {
  const t = await rp.evaluate(() => document.body.innerText);
  out.steps.push({ label: `replay ${label}`, next: t.split('\n').filter((l) => /Next|history|track|replay|God/i.test(l)).slice(0, 8), hash: await rp.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash)) });
};
await rtext('day 20');
await rp.screenshot({ path: `critic/shots/c68u_replay_00_day20.png` });
await rp.getByTestId('god-btn').click();
await rp.waitForTimeout(500);
await rp.getByTestId('god-tool-revolt').click();
const [wx, wy] = CELLS.warsaw;
await rp.evaluate(({ x, y }) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: 8 }), { x: wx, y: wy });
await rp.waitForTimeout(300);
await rp.mouse.click(800, 450);
await rp.waitForTimeout(2000);
await rtext('after revolt');
await rp.screenshot({ path: `critic/shots/c68u_replay_01_revolt.png` });
await rp.getByTestId('god-tool-revolt').click();
await rp.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  await new Promise((d) => { const f = () => (w.view.lastTick >= target ? d() : setTimeout(f, 20)); f(); });
}, 24 * 10);
await rtext('10 days after revolt');
await rp.getByTestId('god-undo').click().catch((e) => out.steps.push({ label: 'replay undo click failed', e: String(e).slice(0, 200) }));
await rp.waitForTimeout(2500);
await rtext('after undo');
await rp.screenshot({ path: `critic/shots/c68u_replay_02_undone.png` });

out.errors = errors;
save(`c68_undo_${seed}.json`, out);
await browser.close();
