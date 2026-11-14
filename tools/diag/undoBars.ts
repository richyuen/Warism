/**
 * ROADMAP R81b's bars (ADR-1032): the one-step undo of a God Mode act, read on the page on the GPU, on a loaded world.
 * The act is a power of the God tab (a nation's command efficiency set, `setEfficiency`), sent as an act (the world saved
 * before it) or as no act (nothing saved): both arms alternate from one loaded world, so they differ by the save alone.
 *
 * 1. The act: from the command to its stats on the page and the frame after (as a panel shows it), p95 of N each arm;
 *    the bar: an act at most 100 ms more than no act.
 * 2. The frames: the gaps between the page's frames while the acts are made; the bar: none over 50 ms in the acts'
 *    windows (the save is the worker's; the page's thread is not held).
 * 3. The undo: from the bar's Undo (`hud.undoGod`) to the loaded world's first stats and the frame after, p95 of N;
 *    the bar: 500 ms.
 * 4. The tick: `sim.step` of K ticks with an undo held and with none, from one saved world, alternated, six pairs
 *    after one to warm up; the bar: the mean ratio within ±3 % (the
 *    held save is bytes in the worker; no tick reads it).
 *
 * Usage: `npm run build`, `npx vite preview --port 5355 --host 127.0.0.1`, then
 * `npx tsx tools/diag/undoBars.ts <seed> <save.bin> [N = 20] [K = 2000]` (the bars' world: 7019 at year 20).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { GPU_ARGS } from '../gate/render';

const seed = Number(process.argv[2] ?? 7019);
const bin = process.argv[3] ?? '.cache/r81b/7019y20.bin';
const N = Number(process.argv[4] ?? 20);
const K = Number(process.argv[5] ?? 2000);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5355';

const browser = await chromium.launch({ args: GPU_ARGS });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
await context.addInitScript({ content: 'window.__name = (f) => f;' });
const page = await context.newPage();
const ev = <T, A>(fn: (a: A) => T | Promise<T>, arg: A): Promise<T> => page.evaluate(fn as never, arg) as Promise<T>;

const bytes = readFileSync(bin);
await page.route('**/__undo.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => ((window as any).__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
await page.waitForFunction(() => { const w = (window as any).__warsim; return w.hud.stats.value !== null && w.sim.mapLayers !== null; }, null, { timeout: 120_000 });
await ev(async () => { const w = (window as any).__warsim; await w.sim.load(new Uint8Array(await (await fetch('/__undo.bin')).arrayBuffer())); }, null);
await page.waitForTimeout(3000);
const gpu = await ev(() => { const c = document.createElement('canvas').getContext('webgl2')!; const x = c.getExtension('WEBGL_debug_renderer_info'); return x ? String(c.getParameter(x.UNMASKED_RENDERER_WEBGL)) : '?'; }, null);

// The page's frames: every rAF's time from here on.
await ev(() => {
  const w = window as any;
  w.__gaps = [] as number[];
  let last = performance.now();
  const f = (t: number): void => { w.__gaps.push([t, t - last]); last = t; requestAnimationFrame(f); };
  requestAnimationFrame(f);
}, null);

/** One act (or no act) on the largest nation; ms from the command to its stats and the frame after. */
const actOnce = (asAct: boolean, raw: number): Promise<{ ms: number; from: number; to: number }> =>
  ev(async ({ asAct, value }) => {
    const w = (window as any).__warsim;
    const n = [...w.hud.stats.value.nations].sort((a: any, b: any) => b.cells - a.cells)[0].id;
    const t0 = performance.now();
    w.hud.command({ kind: 'setEfficiency', nation: n, value }, asAct ? 'act' : undefined);
    await new Promise<void>((done) => {
      const look = (): void => {
        const s = w.hud.stats.value.nations.find((x: any) => x.id === n);
        if (s && Math.abs(s.efficiency - value) < 1e-6) requestAnimationFrame(() => done());
        else requestAnimationFrame(look);
      };
      look();
    });
    const t1 = performance.now();
    return { ms: t1 - t0, from: t0, to: t1 };
  }, { asAct, value: Math.round(raw * 10) / 10 });

const p95 = (a: number[]): number => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.ceil(a.length * 0.95) - 1)]!;
const median = (a: number[]): number => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]!;

// 1 and 2: the acts, alternated.
const acts: number[] = [];
const none: number[] = [];
const windows: [number, number][] = [];
for (let i = 0; i < 2 * N; i++) {
  const asAct = i % 2 === 0;
  const r = await actOnce(asAct, 0.6 + (i % 6) * 0.1);
  (asAct ? acts : none).push(r.ms);
  if (asAct) windows.push([r.from, r.to + 50]);
  await page.waitForTimeout(150);
}
const gaps = await ev(() => (window as any).__gaps as [number, number][], null);
const inActs = gaps.filter(([t]) => windows.some(([a, b]) => t >= a && t <= b)).map(([, g]) => g);

// 3: undo, each after an act.
const undos: number[] = [];
for (let i = 0; i < N; i++) {
  await actOnce(true, 0.6 + (i % 6) * 0.1);
  await page.waitForFunction(() => (window as any).__warsim.hud.stats.value.godUndo !== undefined, null, { timeout: 15_000 });
  undos.push(
    await ev(async () => {
      const w = (window as any).__warsim;
      const world = w.hud.stats.value.world;
      const t0 = performance.now();
      w.hud.undoGod(w.hud.stats.value.godUndo);
      await new Promise<void>((done) => {
        const look = (): void => {
          if (w.hud.stats.value.world !== world) requestAnimationFrame(() => done());
          else requestAnimationFrame(look);
        };
        look();
      });
      return performance.now() - t0;
    }, null),
  );
  await page.waitForTimeout(150);
}

// 4: the tick with an undo held and with none, both from one saved world and the same change (the act's value), so
// they step the same ticks.
await ev(async () => { const w = (window as any).__warsim; w.__base = await w.sim.save(); }, null);
const tick: { held: number; none: number }[] = [];
for (let pair = -1; pair < 6; pair++) {
  const one = async (held: boolean): Promise<number> => {
    await ev(async () => { const w = (window as any).__warsim; await w.sim.load(w.__base.slice()); }, null);
    await actOnce(held, 0.8);
    return ev(async (k: number) => { const w = (window as any).__warsim; const t0 = performance.now(); await w.sim.step(k); return (performance.now() - t0) / k; }, K);
  };
  const order = (pair + 2) % 2 === 0 ? [true, false] : [false, true];
  const got: Record<string, number> = {};
  for (const h of order) got[h ? 'held' : 'none'] = await one(h);
  // Pair -1 warms the page's sim after the load (its first steps run ~10 % slower); not counted.
  if (pair >= 0) tick.push({ held: got['held']!, none: got['none']! });
}
await browser.close();

const f = (x: number): string => x.toFixed(1);
console.log(`GPU: ${gpu}; world: seed ${seed}, ${bin}`);
console.log(`1. the act, command to stats drawn: as an act median ${f(median(acts))} ms, p95 ${f(p95(acts))}; as no act median ${f(median(none))}, p95 ${f(p95(none))}; p95 difference ${f(p95(acts) - p95(none))} ms (bar ≤ 100)`);
console.log(`2. the page's frames in the acts' windows: ${inActs.length}, the longest gap ${f(Math.max(0, ...inActs))} ms (bar ≤ 50)`);
console.log(`3. undo to the loaded world drawn: median ${f(median(undos))} ms, p95 ${f(p95(undos))}, max ${f(Math.max(...undos))} (bar ≤ 500)`);
const ratios = tick.map((t) => t.held / t.none);
console.log(`4. the tick over ${K} ticks, held / none: ${tick.map((t) => `${t.held.toFixed(3)}/${t.none.toFixed(3)} ms`).join(', ')}; mean ratio ${(ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(3)} (bar 0.97-1.03)`);
