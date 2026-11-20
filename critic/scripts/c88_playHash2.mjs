// Critic run 88 (new): does a game a player lets run end in the headless world of its seed? Plain 1938 SEED opened
// running (not paused), the speed set to its highest level by the HUD, left alone until the tick passes TICKS, paused
// by the HUD; then the tick and the state hash read. RUNS times at W x H. The hashes are compared with the headless
// ones at the same ticks by c88_headHash.ts (critic/c88_headHash_<seed>_from<TICKS>.log; every tick TICKS to TICKS + 1500).
// BLOCK=<ms>: right after the speed is set the page's main thread is held busy that long (no snapshot acked, no
// message handled) while the worker runs on: the worker then steps thousands of hours with nothing sent.
// Usage: [BASE=...] [BLOCK=22000] node critic/scripts/c88_playHash.mjs <seed> <TICKS> [RUNS=6] [WxH=1600x900]
import { chromium } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { BASE, ROOT, save } from './c85_lib.mjs';
const seed = Number(process.argv[2] ?? 88901), TICKS = Number(process.argv[3] ?? 9600), RUNS = Number(process.argv[4] ?? 6);
const [W, H] = (process.argv[5] ?? '1600x900').split('x').map(Number);
const hf = path.join(ROOT, `critic/c88_headHash_${seed}_from${TICKS}.log`);
const head = new Map(existsSync(hf) ? readFileSync(hf, 'utf8').trim().split('\n').map((l) => l.trim().split(' ').map(Number)) : []);
const out = { seed, TICKS, W, H, runs: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
for (let i = 0; i < RUNS; i++) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/?scenario=1938&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  const t0 = Date.now();
  const r = await page.evaluate(async ([T, BLOCK]) => {
    const w = window.__warsim;
    w.hud.setSpeedLevel(99);
    if (BLOCK) { await new Promise((d) => setTimeout(d, 300)); const b0 = performance.now(); while (performance.now() - b0 < BLOCK) { /* the page stalls: no snapshot is acked */ } }
    await new Promise((done) => { const p = () => (w.view.lastTick >= T ? done() : setTimeout(p, 5)); p(); });
    if (!w.hud.paused.value) w.hud.togglePause();
    await new Promise((d) => setTimeout(d, 1500));
    const a = await w.sim.hash();
    await new Promise((d) => setTimeout(d, 500));
    const b = await w.sim.hash();
    return { tick: a.tick, hash: a.hash ?? a.stateHash, tick2: b.tick, speed: w.hud.speedLevel.value };
  }, [TICKS, Number(process.env.BLOCK ?? 0)]);
  r.secs = Math.round((Date.now() - t0) / 1000);
  r.head = head.get(r.tick) ?? null;
  r.same = r.head === null ? null : r.head === r.hash;
  r.errors = errors;
  out.runs.push(r);
  console.log(`run ${i}: tick ${r.tick} (still ${r.tick2 === r.tick}) hash ${r.hash} headless ${r.head} same ${r.same} in ${r.secs} s, speed level ${r.speed}, errors ${errors.length}`);
  await ctx.close();
}
console.log(`same as headless: ${out.runs.filter((r) => r.same === true).length} of ${out.runs.length}; other: ${out.runs.filter((r) => r.same === false).length}; no headless line: ${out.runs.filter((r) => r.same === null).length}`);
save(`c88_ph${process.env.BLOCK ? "_block" + process.env.BLOCK : ""}_${seed}_${TICKS}_${W}x${H}.json`, out);
await browser.close();
