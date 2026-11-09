// Critic run 55 (new): the batch's new UI, driven as a player would.
//  build <seed> <w> <h>   : play Poland, the Build tab by kind: tiles whole in the panel / on screen, a tile builds.
//  mine  <seed> <w> <h> <TAG> <days> : play TAG, run days, History "My wars only": counts, rows, kinds.
//  filter <seed> <w> <h>  : the editor's nation filter on awkward words.
//  corridor <seed> <w> <h>: Germany on Poland, God's Breakthrough Berlin→Warsaw, the corridor at several zooms, days 0–12.
// Usage: node critic/scripts/c55_new.mjs <section> <seed> <w> <h> [...]
import { launch, open1938, lookAt, shot, save, hours, CELLS, screenOf } from './c55_lib.mjs';
const [section, seedS, wS, hS, ...rest] = process.argv.slice(2);
const seed = Number(seedS), W = Number(wS ?? 1600), H = Number(hS ?? 900);
const T = CELLS.tags;
const label = `${section}_${seed}_${W}x${H}`;
const out = { section, seed, W, H, steps: [] };
const { browser, page, errors } = await launch(W, H);
const offscreen = () => page.evaluate(() => [...document.querySelectorAll('button, select, input, [role=menuitem], [role=menuitemradio]')]
  .filter((b) => b.offsetParent !== null)
  .filter((b) => { const r = b.getBoundingClientRect(); return r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || r.left < -1 || r.top < -1; })
  .map((b) => (b.innerText || b.title || b.tagName).trim().slice(0, 30)));
const cellAt = (lon, lat) => [Math.floor(((lon + 180) / 360) * 2048) + 0.5, Math.floor(((90 - lat) / 180) * 1024) + 0.5];
try {
  await open1938(page, seed);
  if (section === 'build') {
    await page.evaluate((n) => window.__warsim.view.select(n), T.POL);
    await page.getByTestId('take-control').click();
    await page.getByTestId('tab-build').click();
    out.panel = await page.evaluate(() => { const r = document.querySelector('[data-testid=nation-panel]')?.getBoundingClientRect(); return r ? [r.left, r.top, r.right, r.bottom] : null; });
    for (const kind of ['infantry', 'armour', 'sea', 'air']) {
      await page.getByTestId(`build-kind-${kind}`).click();
      await page.waitForTimeout(200);
      const t = await page.evaluate(() => {
        const box = document.querySelector('[data-testid=nation-panel]').getBoundingClientRect();
        const tiles = [...document.querySelectorAll('[data-testid^=act-build-]')].filter((b) => b.offsetParent !== null);
        return tiles.map((b) => { const r = b.getBoundingClientRect(); return { text: b.innerText.replace(/\n/g, ' | ').slice(0, 90), disabled: b.disabled, whole: !(r.top < Math.max(0, box.top) - 1 || r.bottom > Math.min(innerHeight, box.bottom) + 1 || r.left < box.left - 1 || r.right > box.right + 1), r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }; });
      });
      out.steps.push({ kind, tiles: t, offscreen: await offscreen() });
      await shot(page, `c55new_${label}_${kind}.png`);
    }
    await page.getByTestId('build-kind-infantry').click();
    const tile = page.locator('[data-testid^=act-build-]:not([disabled])').first();
    out.built = await tile.innerText().catch(() => null);
    await tile.click({ timeout: 5000 });
    await page.evaluate(() => window.__warsim.sim.step(1));
    await page.waitForTimeout(1500);
    out.queueRows = await page.getByTestId('act-queue-row').allInnerTexts().catch(() => []);
    out.panelText = (await page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.innerText ?? '')).slice(0, 1500);
    await shot(page, `c55new_${label}_queued.png`);
    await page.getByTestId('tab-actions').click().catch(() => {});
    await page.waitForTimeout(300);
    out.actionsQueue = await page.getByTestId('act-queue-row').allInnerTexts().catch(() => []);
    out.actionsOffscreen = await offscreen();
    await shot(page, `c55new_${label}_actions.png`);
  } else if (section === 'mine') {
    const tagName = rest[0] ?? 'GER';
    const days = Number(rest[1] ?? 365);
    const me = T[tagName];
    await page.evaluate((g) => window.__warsim.hud.command({ kind: 'setPlayer', nation: g }), me);
    for (let d = 0; d < days; d += 30) await hours(page, 24 * Math.min(30, days - d));
    await page.getByTestId('history-btn').click();
    await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
    out.countAll = await page.getByTestId('history-count').innerText().catch(() => null);
    const box = page.getByTestId('history-mine');
    out.mineVisible = await box.isVisible().catch(() => false);
    out.mineLabel = await page.evaluate(() => document.querySelector('[data-testid=history-mine]')?.closest('label')?.innerText ?? null);
    await box.check();
    await page.waitForTimeout(800);
    out.countMine = await page.getByTestId('history-count').innerText().catch(() => null);
    out.rowsMine = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\n/g, ' ')));
    out.rowsMineN = out.rowsMine.length;
    out.rowsMine = out.rowsMine.slice(0, 60);
    out.offscreen = await offscreen();
    await shot(page, `c55new_${label}_${tagName}_mine.png`);
    // the same with a kind filter on top
    const opts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-kind] option')].map((o) => [o.value, o.textContent]));
    out.byKindMine = [];
    for (const [v, l] of opts) {
      if (!v) continue;
      await page.selectOption('[data-testid=history-kind]', v);
      await page.waitForTimeout(120);
      out.byKindMine.push({ l, count: await page.getByTestId('history-count').innerText().catch(() => null) });
    }
    await page.selectOption('[data-testid=history-kind]', '');
    await box.uncheck();
    await page.waitForTimeout(500);
    out.countAfter = await page.getByTestId('history-count').innerText().catch(() => null);
    // switch the played nation while History is open
    await page.getByTestId('history-close').click();
    await page.evaluate((n) => window.__warsim.view.select(n), me);
    await page.getByTestId('release-control').click({ timeout: 10000 }).catch((e) => { out.releaseErr = String(e).slice(0, 200); });
    await hours(page, 1);
    out.playerAfter = await page.evaluate(() => window.__warsim.hud.stats.value?.player ?? null);
    if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
    await page.getByTestId('history-btn').click();
    await page.waitForTimeout(800);
    out.mineAfterUnplay = await page.getByTestId('history-mine').count();
  } else if (section === 'filter') {
    await page.getByTestId('editor-btn').click();
    await page.waitForTimeout(500);
    const opts = () => page.getByTestId('editor-nation').locator('option').allInnerTexts();
    out.all = (await opts()).length;
    const f = page.getByTestId('editor-nation-filter');
    out.filterInView = await f.isVisible();
    for (const word of ['cote', 'côte', 'ivory', 'united', 'korea', 'soviet', 'ussr', 'great britain', 'uk', 'free', 'germ', 'nationalist', ' fra', 'FRANCE']) {
      await f.fill(word);
      await page.waitForTimeout(150);
      out.steps.push({ word, options: (await opts()).slice(0, 20), n: (await opts()).length, count: await page.getByTestId('editor-nation-count').innerText().catch(() => null), value: await page.getByTestId('editor-nation').inputValue() });
    }
    await f.fill('ger');
    await shot(page, `c55new_${label}_ger.png`);
    out.offscreen = await offscreen();
  } else if (section === 'corridor') {
    const berlin = CELLS.berlin, warsaw = CELLS.warsaw;
    await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T.GER, d: T.POL });
    const t0 = await page.evaluate(() => window.__warsim.view.lastTick);
    await hours(page, 1);
    await page.evaluate((g) => window.__warsim.hud.onSelectNation(g), T.GER);
    await page.getByRole('button', { name: 'God Mode', exact: true }).click();
    await lookAt(page, (berlin[0] + warsaw[0]) / 2, berlin[1], 1500);
    await page.getByRole('button', { name: 'Breakthrough', exact: true }).click();
    if (process.env.CLOSEPANEL && (await page.getByTestId('nation-close').count()) > 0) { await page.getByTestId('nation-close').click(); out.closedPanel = true; }
    out.hint = await page.evaluate(() => document.body.innerText.match(/Click the start[^
]*/)?.[0] ?? null);
    const [ax, ay] = await screenOf(page, berlin[0] + 3, berlin[1]);
    const [bx, by] = await screenOf(page, warsaw[0], warsaw[1]);
    await page.mouse.click(ax, ay);
    await page.mouse.click(bx, by);
    await hours(page, 1);
    await page.waitForTimeout(600);
    const marks = () => page.evaluate(() => { window.__warsim.view.draw(); return window.__warsim.view.corridorMarks; });
    out.marks0 = await marks();
    await shot(page, `c55new_${label}_h1_1500m.png`);
    await page.getByRole('button', { name: 'God Mode', exact: true }).click();
    const mid = [(berlin[0] + warsaw[0]) / 2, (berlin[1] + warsaw[1]) / 2];
    for (const m of [6000, 3000, 600, 250, 60]) {
      await lookAt(page, mid[0], mid[1], m);
      out.steps.push({ h: 1, m, marks: (await marks()).length });
      await shot(page, `c55new_${label}_h1_${m}m.png`);
    }
    for (const d of [3, 6, 9, 10, 11, 13]) {
      const now = await page.evaluate(() => window.__warsim.view.lastTick);
      await hours(page, Math.max(1, t0 + d * 24 - now));
      await lookAt(page, mid[0], mid[1], 1500);
      const mk = await marks();
      out.steps.push({ day: d, tick: await page.evaluate(() => window.__warsim.view.lastTick), marks: mk.length, ger: mk.filter((q) => q.nation === T.GER).length, ticker: (await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 6).map((r) => r.innerText.replace(/\n/g, ' ')))) });
      await shot(page, `c55new_${label}_d${d}_1500m.png`);
    }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c55_new_${label}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
