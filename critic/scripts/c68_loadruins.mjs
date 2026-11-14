// Critic run 68 (new): does a load of a world with no burst clear the map's ruins and fallout of the world before it?
// The same path as R81b's undo (server.ts `loaded()`). Save at day 10, H-bomb on Berlin by God Mode, 2 days, load the
// day-10 save through the client, shots at Berlin at 937 and 150 m/px.
// Usage: node critic/scripts/c68_loadruins.mjs <seed>
import { launch, shot, save, lookAt, CELLS, hours, open1938 } from './c68_lib.mjs';

const seed = Number(process.argv[2] ?? 41203);
const out = { seed, shots: [] };
const { browser, page, errors } = await launch();
const S = async (n) => out.shots.push(await shot(page, `c68lr_${seed}_${n}.png`));
await open1938(page, seed);
await hours(page, 240);
await page.evaluate(async () => { window.__critSave = await window.__warsim.sim.save(); });
out.hashSaved = await page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
await page.getByTestId('god-btn').click();
const [bx, by] = CELLS.berlin;
await lookAt(page, bx, by, 937);
await page.getByTestId('god-tool-nuke').click();
await page.getByTestId('god-nuke-size').selectOption('thermonuclear');
await page.mouse.click(800, 450);
await page.waitForTimeout(1500);
await page.getByTestId('god-btn').click();
await hours(page, 48);
await lookAt(page, bx, by, 937);
await S('01_nuked_937');
await page.evaluate(async () => { await window.__warsim.sim.load(window.__critSave); });
await page.waitForTimeout(2000);
await hours(page, 24);
out.hashLoadedPlus24 = await page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
await lookAt(page, bx, by, 937);
await S('02_loaded_937');
await lookAt(page, bx, by, 150);
await S('03_loaded_150');
// A fresh page, the same save: the map as it should be.
const p2 = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await p2.goto(page.url());
await p2.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
const bytes = await page.evaluate(() => Array.from(window.__critSave));
await p2.evaluate(async (b) => { await window.__warsim.sim.load(new Uint8Array(b)); }, bytes);
await p2.waitForTimeout(1500);
await p2.evaluate(async (n) => { const w = window.__warsim; const t = w.view.lastTick + n; await w.sim.step(n); await new Promise((d) => { const f = () => (w.view.lastTick >= t ? d() : setTimeout(f, 20)); f(); }); }, 24);
out.hashFreshPlus24 = await p2.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
await p2.evaluate(({ x, y }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 937 }); }, { x: bx, y: by });
await p2.waitForTimeout(1500);
await p2.screenshot({ path: `critic/shots/c68lr_${seed}_04_fresh_937.png` });
out.shots.push(`critic/shots/c68lr_${seed}_04_fresh_937.png`);
out.errors = errors;
save(`c68_loadruins_${seed}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
