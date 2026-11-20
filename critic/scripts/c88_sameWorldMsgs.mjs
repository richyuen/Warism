// Critic run 88 (new): what differs between two loads of one seed that end at different hashes (c88_sameWorld)? The same
// load and one step of DAYS days, RUNS times at one size, with every message the page posts to its worker recorded
// (type, a command's kind, the time since load) by a patch of Worker.prototype.postMessage before the page's scripts.
// Printed per run: the end hash, and the messages before the step, while it ran, and after it up to the hash.
// Usage: [BASE=...] node critic/scripts/c88_sameWorldMsgs.mjs <seed> <days> [RUNS=6] [WxH=1600x900] [waitMs=0]
import { chromium } from '@playwright/test';
import { BASE, save } from './c85_lib.mjs';
const seed = Number(process.argv[2] ?? 88901), days = Number(process.argv[3] ?? 400), RUNS = Number(process.argv[4] ?? 6);
const [W, H] = (process.argv[5] ?? '1600x900').split('x').map(Number), waitMs = Number(process.argv[6] ?? 0);
const out = { seed, days, W, H, waitMs, runs: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
for (let i = 0; i < RUNS; i++) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => {
    window.__msgs = [];
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (m, ...rest) {
      try { window.__msgs.push([Math.round(performance.now()), m?.type ?? typeof m, m?.cmd?.kind ?? (m?.type === 'step' ? m.n : m?.type === 'pause' ? m.paused : m?.type === 'speed' ? m.speed : m?.type === 'subscribe' ? JSON.stringify(m.sub).length : '')]); } catch { /* not ours */ }
      return post.call(this, m, ...rest);
    };
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (waitMs) await page.waitForTimeout(waitMs);
  const r = await page.evaluate(async (n) => {
    const w = window.__warsim;
    const h0 = await w.sim.hash();
    const i0 = window.__msgs.length, t0 = Math.round(performance.now());
    await w.sim.step(n);
    const i1 = window.__msgs.length, t1 = Math.round(performance.now());
    const h1 = await w.sim.hash();
    const brief = (a) => { const c = {}; for (const m of a) { const k = `${m[1]}${m[2] !== '' && m[1] !== 'ack' && m[1] !== 'subscribe' ? ':' + m[2] : ''}`; c[k] = (c[k] ?? 0) + 1; } return c; };
    return { start: h0.hash ?? h0.stateHash, end: h1.hash ?? h1.stateHash, tick: h1.tick, t0, t1, before: brief(window.__msgs.slice(0, i0)), during: brief(window.__msgs.slice(i0, i1)), duringList: window.__msgs.slice(i0, i1).filter((m) => m[1] !== 'ack').slice(0, 40), lastBefore: window.__msgs.slice(Math.max(0, i0 - 8), i0) };
  }, days * 24);
  out.runs.push(r);
  console.log(`run ${i}: end ${r.end} tick ${r.tick} step ${r.t0}..${r.t1} ms | before ${JSON.stringify(r.before)} | during ${JSON.stringify(r.during)}`);
  await ctx.close();
}
console.log('end hashes:', JSON.stringify([...new Set(out.runs.map((r) => r.end))]));
save(`c88_swm_${seed}_${days}_${W}x${H}_${waitMs}.json`, out);
await browser.close();
