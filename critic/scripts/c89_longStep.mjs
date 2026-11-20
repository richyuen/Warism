// Critic run 89 (new): R88-B1 off its seed. For each SEED of plain 1938 (EXTRA adds to the URL, e.g. &heroes=on), RUNS
// loads of the page, PAR at once (the compiler's timing chose the world in run 88), each opened paused and stepped HOURS
// in ONE message; the end hash of each load. A seed with more than one end hash is two worlds from one seed. The headless
// hash is read apart (critic/scripts/c88_headHash.ts <seed> <hours> <hours>).
// Usage: [BASE=...] [EXTRA=...] node critic/scripts/c89_longStep.mjs <seed,seed,...> <hours> [RUNS=8] [PAR=4] [WxH=1280x720] [hidden]
import { chromium } from '@playwright/test';
import { BASE, save } from './c85_lib.mjs';
const seeds = (process.argv[2] ?? '88901').split(',').map(Number), HOURS = Number(process.argv[3] ?? 9600);
const RUNS = Number(process.argv[4] ?? 8), PAR = Number(process.argv[5] ?? 4);
const [W, H] = (process.argv[6] ?? '1280x720').split('x').map(Number), hidden = process.argv[7] === 'hidden';
const extra = process.env.EXTRA ?? '';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const errors = [];
const one = async (seed) => {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  try {
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${seed}: ${e.message}`));
    await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}${extra}`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
    if (hidden) {
      // The tab made hidden as a player's background tab is: visibilityState and the event, then the step.
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
        Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    }
    const t0 = Date.now();
    const r = await page.evaluate(async (n) => { const s = await window.__warsim.sim.step(n); return { hash: s.hash, tick: s.tick }; }, HOURS);
    return { ...r, ms: Date.now() - t0 };
  } catch (e) { return { hash: `ERR ${String(e).slice(0, 80)}` }; } finally { await ctx.close(); }
};
const out = { base: BASE, hours: HOURS, W, H, extra, hidden, seeds: {} };
for (const seed of seeds) {
  const ends = [];
  for (let i = 0; i < RUNS; i += PAR) ends.push(...(await Promise.all(Array.from({ length: Math.min(PAR, RUNS - i) }, () => one(seed)))));
  const count = {};
  for (const e of ends) count[e.hash] = (count[e.hash] ?? 0) + 1;
  out.seeds[seed] = { ends, count };
  console.log(`seed ${seed} hours ${HOURS}: ${Object.keys(count).length} end hash(es) ${JSON.stringify(count)} ms ${ends.map((e) => e.ms).join(',')}`);
}
console.log('page errors:', JSON.stringify(errors));
save(`c89_ls_${seeds[0]}_${seeds.length}_${HOURS}${hidden ? '_hidden' : ''}${process.env.TAG ?? ''}.json`, out);
await browser.close();
