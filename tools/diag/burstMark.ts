/**
 * ROADMAP R81c's read on an AI's strike (critic run 67: the Soviet H-bomb of March 1958 on 7019's year-20 world, "a
 * smudge at 937 m/px"): a save loaded, run at Max until a burst reaches the page, then Speed ×1; at 937 and 3,000 m/px
 * on the burst, the effect drawn alone on a clear canvas at 1, 4, 7, 9 and 10.3 s of the page's clock, its extent (pixels
 * at over a quarter's opacity within 120 px), as `tests/e2e/burstMark1938.spec.ts` reads God's; shots at 10.3 s.
 *
 * Usage: `npm run build`, `npx vite preview --port 5355 --host 127.0.0.1`, then
 * `npx tsx tools/diag/burstMark.ts <seed> <save.bin> [out dir = .cache/burstMark]`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the page's debug handle, `window.__warsim`, is read untyped */
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { GPU_ARGS } from '../gate/render';

const seed = Number(process.argv[2] ?? 7019);
const bin = process.argv[3] ?? '.cache/r81b/7019y20.bin';
const outDir = process.argv[4] ?? '.cache/burstMark';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5355';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: GPU_ARGS });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
await context.addInitScript({ content: 'window.__name = (f) => f;' });
const page = await context.newPage();
const ev = <T, A>(fn: (a: A) => T | Promise<T>, arg: A): Promise<T> => page.evaluate(fn as never, arg) as Promise<T>;
const bytes = readFileSync(bin);
await page.route('**/__burst.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => { const w = (window as any).__warsim; return (w?.view?.frames ?? 0) > 0 && w.hud.stats.value !== null && w.sim.mapLayers !== null; }, null, { timeout: 120_000 });
await ev(async () => { const w = (window as any).__warsim; await w.sim.load(new Uint8Array(await (await fetch('/__burst.bin')).arrayBuffer())); }, null);
await page.waitForTimeout(2000);
await ev(() => { const h = (window as any).__warsim.hud; h.setSpeedLevel(99); if (h.paused.value) h.togglePause(); }, null);
await page.waitForFunction(() => (window as any).__warsim.view.nukeFx.bursts.length > 0, null, { timeout: 600_000, polling: 50 });
const at = await ev(() => {
  const w = (window as any).__warsim;
  w.hud.setSpeedLevel(0);
  if (w.hud.paused.value) w.hud.togglePause();
  const b = w.view.nukeFx.bursts[0];
  return { x: b.x, y: b.y, yieldN: b.yieldN, date: w.hud.date() };
}, null);
console.log(`burst at (${at.x}, ${at.y}), class ${at.yieldN}, ${JSON.stringify(at.date)}`);
const ZOOMS = [937, 3000];
const read = (): Promise<string[]> =>
  ev(({ x, y, zooms }) => {
    const v = (window as any).__warsim.view;
    const [vw, vh] = [innerWidth, innerHeight];
    const c = document.createElement('canvas');
    [c.width, c.height] = [vw, vh];
    const ctx = c.getContext('2d')!;
    const lines: string[] = [];
    for (const m of zooms) {
      v.controller.set({ cx: x, cy: y, scale: (v.geo.kmPerCell * 1000) / m });
      ctx.clearRect(0, 0, vw, vh);
      const now = performance.now();
      v.nukeFx.draw(ctx, v.controller.cam, v.geo, vw, vh, now);
      const d = ctx.getImageData(vw / 2 - 120, vh / 2 - 120, 240, 240).data;
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
      for (let j = 0; j < 240; j++) for (let i = 0; i < 240; i++) if (d[4 * (j * 240 + i) + 3]! > 64) [x0, y0, x1, y1] = [Math.min(x0, i), Math.min(y0, j), Math.max(x1, i), Math.max(y1, j)];
      const age = Math.round(now - v.nukeFx.bursts[0].born);
      lines.push(`${age} ms ${m} m/px: ${x1 >= x0 ? x1 - x0 + 1 : 0} x ${y1 >= y0 ? y1 - y0 + 1 : 0} px, mark ${v.nukeFx.shown[3]}`);
    }
    return lines;
  }, { x: at.x, y: at.y, zooms: ZOOMS });
for (const t of [1000, 4000, 7000, 9000, 10_300]) {
  const age = await ev(() => performance.now() - (window as any).__warsim.view.nukeFx.bursts[0].born, null);
  if (t > age) await page.waitForTimeout(t - age);
  for (const l of await read()) console.log(l);
}
for (const m of ZOOMS) {
  await ev(({ x, y, m }) => { const v = (window as any).__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.geo.kmPerCell * 1000) / m }); }, { x: at.x, y: at.y, m });
  await page.screenshot({ path: path.join(outDir, `burst-${seed}-${m}m-10s.png`) });
}
await browser.close();
