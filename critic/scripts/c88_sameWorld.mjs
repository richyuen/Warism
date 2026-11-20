// Critic run 88 (new): is the world of one seed the same at every supported size? c88_sizes showed other wars and other
// sea holders on 5 February 1939 of seed 88901 at 852 x 393 than at 393 x 659. Here: plain 1938 SEED opened paused at
// each size (phones with touch and a pixel ratio of 3), stepped DAYS days in one message (or, with CHUNK, in steps of
// CHUNK days with the hash read after each), then the state hash, the tick, the living nations and the wars read.
// WAITALL=1 waits for the map layers and the elevation before stepping (as c85_lib open1938); WAITMS waits that long.
// Usage: [BASE=...] [CHUNK=50] [WAITALL=1] [WAITMS=5000] [TAG=_x] node critic/scripts/c88_sameWorld.mjs <seed> <days> [sizes=852x393,393x659,852x393,2560x1305]
import { chromium } from '@playwright/test';
import { BASE, save, hours } from './c85_lib.mjs';
const seed = Number(process.argv[2] ?? 88901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '852x393,393x659,852x393,2560x1305').split(',').map((s) => s.split('x').map(Number));
const CHUNK = Number(process.env.CHUNK ?? 0);
const out = { seed, days, runs: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
for (const [W, H] of sizes) {
  const phone = W < 1000;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(phone ? { deviceScaleFactor: 3, isMobile: true, hasTouch: true } : {}) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}${process.env.EXTRA ?? ''}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (process.env.WAITALL) await page.waitForFunction(() => window.__warsim.sim.mapLayers !== null && window.__warsim.sim.elevation !== null, null, { timeout: 120_000 });
  if (process.env.WAITMS) await page.waitForTimeout(Number(process.env.WAITMS));
  const read = () => page.evaluate(async () => {
    const w = window.__warsim;
    const s = await w.sim.hash();
    return { tick: s.tick, hash: s.hash ?? s.stateHash, url: location.search, wars: document.querySelectorAll('[data-testid=war-banner]').length, more: document.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null, date: document.querySelector('[data-testid=topbar-date], [data-testid=date-label]')?.textContent ?? null };
  });
  const r = { W, H, start: await read(), steps: [] };
  if (CHUNK) for (let d = 0; d < days; d += CHUNK) { await hours(page, 24 * Math.min(CHUNK, days - d)); r.steps.push((await read()).hash); }
  else await hours(page, 24 * days);
  await page.waitForTimeout(500);
  r.end = await read();
  r.errors = errors;
  out.runs.push(r);
  console.log(`${W}x${H}: start ${r.start.hash} tick ${r.start.tick} | end ${r.end.hash} tick ${r.end.tick} ${r.end.date} wars ${r.end.wars} ${r.end.more ?? ''} ${r.end.url}${CHUNK ? ' | ' + r.steps.join(' ') : ''} errors ${errors.length}`);
  await ctx.close();
}
console.log('same end hash:', new Set(out.runs.map((r) => r.end.hash)).size === 1);
save(`c88_sw${process.env.TAG ?? ''}_${seed}_${days}${CHUNK ? '_c' + CHUNK : ''}.json`, out);
await browser.close();
