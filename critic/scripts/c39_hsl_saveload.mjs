// Critic run 29 (R5a, heroes), HSL: a save with a hero gone, loaded in the page: does its return survive?
// 1938 ?heroes=on seed <seed>: to <tick> (a hero gone), save; run <run> hours, hash and heroes; load the save; the
// Heroes block; run the same hours; hash and heroes again (must match).
// Usage: node critic/scripts/c39_hsl_saveload.mjs <seed> <tick> <run> <nationId>
import { launch, open1938, save, hours, shot } from './c31_lib.mjs';
const [seed, tick, run, nation] = [Number(process.argv[2] ?? 4111), Number(process.argv[3] ?? 2500), Number(process.argv[4] ?? 1500), Number(process.argv[5] ?? 1)];
const out = { seed, tick, run, nation };
const { browser, page, errors } = await launch();
const st = () => page.evaluate(async () => ({ tick: window.__warsim.view.lastTick, hash: await window.__warsim.sim.hash(), heroes: window.__warsim.view.heroFormations().slice().sort((a, b) => a - b) }));
const block = async () => { await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation); await page.waitForTimeout(800); return page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText.replace(/\n/g, ' | ') ?? null); };
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, tick);
  out.atSave = { ...(await st()), block: await block() };
  await page.evaluate(async () => { window.__critSave = await window.__warsim.sim.save(); });
  out.saveBytes = await page.evaluate(() => window.__critSave.byteLength ?? window.__critSave.length);
  await hours(page, run);
  out.runA = { ...(await st()), block: await block() };
  await page.evaluate(async () => window.__warsim.sim.load(window.__critSave));
  await page.waitForTimeout(2500);
  out.loaded = { ...(await st()), block: await block() };
  out.loadedShot = await shot(page, `c39hsl_${seed}_loaded.png`);
  await hours(page, run);
  out.runB = { ...(await st()), block: await block() };
  out.same = out.runA.hash === out.runB.hash && JSON.stringify(out.runA.heroes) === JSON.stringify(out.runB.heroes);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c39_hsl_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 2500));
