/**
 * ROADMAP R53m's measure (ADR-890): the critic's frame-rate probe (`c54_pf_lookfps.mjs`) with the fight picked again
 * before each measure. The critic's probe picks its fight once, at load; at Max (about 8 days a second) it has moved on by
 * the unit zooms, and an idle view is not drawn again (`MapView.frameAt`), so its draws there are of an empty map.
 *
 * A save loaded, Max: at 3,000, 1,200, 600, 120 and 30 m/px, three pairs of the two looks (order alternated), each
 * 4 s after the camera is put on the busiest fight of that moment (the engaged formation with most engaged within 6
 * cells). A row: the view's draws a second (`view.frames`, as the critic's) over 4 s, then 4 s more with a draw forced
 * on every frame (`dirty`): the browser's frames a second, the frame gaps' p95 and worst, and the draw's mean and
 * longest. At Max a snapshot has no tick length, so nothing moves between snapshots (about 33 a second) and the
 * unforced draws read their cadence; the forced read what a frame costs. And what was on the screen at the start.
 *
 * Usage: `npm run build`, `npx vite preview --port 5354 --host 127.0.0.1`, then
 * `npx tsx tools/diag/lookFps.ts <seed> <save.bin> [out.json]` (the critic's: 7019 critic/c54_seed7019_y20.bin).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const seed = Number(process.argv[2] ?? 7019);
const bin = process.argv[3] ?? 'critic/c54_seed7019_y20.bin';
const outFile = process.argv[4] ?? `.cache/lookFps_${seed}.json`;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5354';
const ZOOMS = [3000, 1200, 600, 120, 30];

interface Seen { on: number; engaged: number; el: number }
interface Window { draws: number; frames: number; p95: number; worst: number; drawMs: number; drawMax: number }
interface Row { m: number; look: string; k: number; seen: Seen; idle: Window; forced: Window }

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
// tsx names the functions declared inside an evaluated one with esbuild's `__name`, which the page lacks.
await context.addInitScript({ content: 'window.__name = (f) => f;' });
const page = await context.newPage();
const ev = <T, A>(fn: (a: A) => T | Promise<T>, arg: A): Promise<T> => page.evaluate(fn as never, arg) as Promise<T>;

const bytes = readFileSync(bin);
await page.route('**/__lookfps.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => ((window as any).__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
await page.waitForFunction(() => { const w = (window as any).__warsim; return w.hud.stats.value !== null && w.sim.mapLayers !== null && w.sim.elevation !== null; }, null, { timeout: 120_000 });
await ev(async () => { const w = (window as any).__warsim; await w.sim.load(new Uint8Array(await (await fetch('/__lookfps.bin')).arrayBuffer())); }, null);
await page.waitForTimeout(3000);
await ev(() => {
  const w = (window as any).__warsim;
  try { w.settings.nukePause.value = false; } catch { /* an older build */ }
  w.hud.setSpeedLevel(99);
  if (w.hud.paused.value) w.hud.togglePause();
}, null);

/** The camera on the busiest fight now, at `m` m/px. */
const onFight = (m: number): Promise<void> => ev((m: number) => {
  const v = (window as any).__warsim.view;
  const pts: [number, number][] = [];
  for (let n = 1; n < 400; n++) {
    let fs: number[];
    try { fs = v.formationsOf(n); } catch { continue; }
    for (const f of fs) if (v.formationEngaged(f)) { const p = v.formationPos(f); if (p) pts.push(p); }
  }
  let best = pts[0] ?? [v.controller.cam.cx, v.controller.cam.cy], bn = -1;
  for (const p of pts) { let k = 0; for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 6) k++; if (k > bn) { bn = k; best = p; } }
  v.controller.set({ cx: best[0], cy: best[1], scale: (v.metresPerPx * v.controller.cam.scale) / m });
}, m);

/** Formations and elements on the screen now. */
const seen = (): Promise<Seen> => ev(() => {
  const v = (window as any).__warsim.view;
  const cam = v.controller.cam; let on = 0, engaged = 0;
  for (let n = 1; n < 400; n++) {
    let fs: number[];
    try { fs = v.formationsOf(n); } catch { continue; }
    for (const f of fs) {
      const p = v.formationPos(f); if (!p) continue;
      const x = (p[0] - cam.cx) * cam.scale + innerWidth / 2, y = (p[1] - cam.cy) * cam.scale + innerHeight / 2;
      if (x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight) { on++; if (v.formationEngaged(f)) engaged++; }
    }
  }
  return { on, engaged, el: v.elementCount };
}, null);

/** 4 s of the view: its draws, the browser's frames, the gaps and the draw's time; `force` draws every frame. */
const measure = (force: boolean): Promise<Window> => ev(async (force: boolean) => {
  const v = (window as any).__warsim.view;
  const own = Object.prototype.hasOwnProperty.call(v, 'draw');
  const draw = v.draw; const fa = v.frameAt;
  let ms = 0, n = 0, max = 0;
  v.draw = function (...a: unknown[]) { const s = performance.now(); try { return draw.apply(this, a); } finally { const d = performance.now() - s; ms += d; n++; max = Math.max(max, d); } };
  if (force) v.frameAt = function (now: number) { this.dirty = true; return fa.call(this, now); };
  const f0 = v.frames; const t0 = performance.now(); let last = t0; let raf = 0; const gaps: number[] = [];
  await new Promise<void>((done) => {
    const tick = (): void => { const x = performance.now(); gaps.push(x - last); last = x; raf++; if (x - t0 > 4000) done(); else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const el = performance.now() - t0;
  if (own) v.draw = draw; else delete v.draw;
  delete v.frameAt;
  gaps.sort((a, b) => a - b);
  return { draws: +(((v.frames - f0) * 1000) / el).toFixed(1), frames: +((raf * 1000) / el).toFixed(1), p95: +gaps[Math.floor(gaps.length * 0.95)]!.toFixed(1), worst: Math.round(gaps.at(-1)!), drawMs: +(ms / Math.max(1, n)).toFixed(2), drawMax: +max.toFixed(1) };
}, force);

const rows: Row[] = [];
for (const m of ZOOMS) {
  for (let k = 0; k < 3; k++) {
    for (const look of k % 2 ? ['classic', 'balls'] : ['balls', 'classic']) {
      await ev((l: string) => { (window as any).__warsim.view.unitLook = l; }, look);
      await onFight(m);
      await page.waitForTimeout(500);
      const r: Row = { m, look, k, seen: await seen(), idle: await measure(false), forced: await measure(true) };
      rows.push(r);
      console.log(`${m} m/px ${look}: at the start ${r.seen.on} formations (${r.seen.engaged} engaged), ${r.seen.el} elements; idle ${r.idle.draws} draws/s; forced ${r.forced.frames} frames/s, p95 ${r.forced.p95} ms, worst ${r.forced.worst}, a draw ${r.forced.drawMs} ms (longest ${r.forced.drawMax})`);
    }
  }
}
await browser.close();
const mean = (xs: number[]): number => +(xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(1);
const agg: Record<string, { idle: number; forced: number; least: number; p95: number; drawMs: number; drawMax: number; elements: number }> = {};
for (const m of ZOOMS) for (const look of ['balls', 'classic']) {
  const rs = rows.filter((r) => r.m === m && r.look === look);
  const a = { idle: mean(rs.map((r) => r.idle.draws)), forced: mean(rs.map((r) => r.forced.frames)), least: Math.min(...rs.map((r) => r.forced.frames)), p95: Math.max(...rs.map((r) => r.forced.p95)), drawMs: mean(rs.map((r) => r.forced.drawMs)), drawMax: Math.max(...rs.map((r) => r.forced.drawMax)), elements: Math.max(...rs.map((r) => r.seen.el)) };
  agg[`${m}_${look}`] = a;
  console.log(`${m}_${look}: forced ${a.forced} frames/s (least ${a.least}), p95 ${a.p95} ms, a draw ${a.drawMs} ms (longest ${a.drawMax}); idle ${a.idle} draws/s; most elements at a start ${a.elements}`);
}
writeFileSync(outFile, JSON.stringify({ seed, bin, rows, agg }, null, 1));
console.log(`done: ${outFile}`);
