// Critic run 62 (new): is 1938h's seed its own whatever the URL? Three pages, ?seed= 5, 77 and none, one ?after=,
// 30 days each: their hashes. Then ?after= 11 against 22 at day 30 (the track's own section differs by design).
// Usage: node critic/scripts/c68_h_seed.mjs
import { launch, save, BASE } from './c68_lib.mjs';
const out = {};
const { browser, page, errors } = await launch(1200, 800);
const run = async (q) => {
  await page.goto(`${BASE}/?scenario=1938h&paused=1${q}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  return page.evaluate(async () => { const w = window.__warsim; await w.sim.step(24 * 30); const h = await w.sim.hash(); return { url: location.search, ...h }; });
};
try {
  out.s5 = await run('&seed=5&after=11');
  out.s77 = await run('&seed=77&after=11');
  out.none = await run('&after=11');
  out.a22 = await run('&seed=5&after=22');
  out.sameSeedIgnored = out.s5.hash === out.s77.hash && out.s5.hash === out.none.hash;
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save('c68_hseed.json', out);
await browser.close();
console.log(JSON.stringify(out));
