import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { FLASH_MS } from '../../src/render/fx/flashes';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R90b (ADR-1079): land that changes hands flashes once, a soft white patch for FLASH_MS; nothing flashes at a
// start or at a load. Swept over how much land is taken and the zoom it is looked at from.

const { w: W, h: H } = SIZE_1938;
const nation = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [GER, POL] = [nation('GER'), nation('POL')];

/** The names' canvas at `age` ms after the view's last flash began (or now, with none): white pixels in the square of `r` cells about (cx, cy), and the cells flashing. */
function flashAt(page: Page, cx: number, cy: number, r: number, at: number): Promise<{ white: number; cells: number }> {
  return page.evaluate(({ cx, cy, r, at }) => {
    const v = window.__warsim!.view!;
    v.draw(at);
    const c = document.querySelector('canvas.map-cities') as HTMLCanvasElement;
    const k = c.width / c.clientWidth;
    const cam = v.controller.cam;
    const [sx, sy] = [((cx - cam.cx) * cam.scale + c.clientWidth / 2) * k, ((cy - cam.cy) * cam.scale + c.clientHeight / 2) * k];
    const half = Math.max(2, Math.ceil(r * cam.scale * k));
    const px = c.getContext('2d')!.getImageData(Math.round(sx - half), Math.round(sy - half), 2 * half, 2 * half).data;
    let white = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 3]! > 12 && px[i]! > 240 && px[i + 1]! > 240 && px[i + 2]! > 240) white++;
    return { white, cells: v.flashes.count(at) };
  }, { cx, cy, r, at });
}

test('land that changes hands flashes once and fades; nothing flashes at a start or at a load', async ({ page }, info) => {
  test.setTimeout(240_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R90b') : info.outputPath();
  mkdirSync(out, { recursive: true });
  // Open country in western Poland, no city's name on it.
  const [cx, cy] = cellOf(17.2, 52.9, W, H);
  await lookAt(page, cx, cy, 1500);
  // The start: nothing flashes, though every cell has just come.
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.waitForFunction(() => window.__warsim!.view!.lastTick >= 2, null, { timeout: 60_000 });
  expect((await flashAt(page, cx, cy, 3, await page.evaluate(() => performance.now()))).cells, 'no flash at the start').toBe(0);

  let turn = 0;
  for (const r of [1, 3]) {
    for (const m of [8000, 1500, 600]) {
      // Germany's and Poland's by turns, so that each paint changes hands.
      const to = turn++ % 2 === 0 ? GER : POL;
      await lookAt(page, cx, cy, m);
      // What is white there with no flash (a city's dot): the flash is what is white beyond it.
      const base = (await flashAt(page, cx, cy, r + 1, await page.evaluate(() => performance.now() + 1e6))).white;
      const t0 = await page.evaluate(async ({ to, from, cx, cy, r }) => {
        const w = window.__warsim!;
        const paint = async (nation: number): Promise<void> => {
          const tick = w.view!.lastTick;
          w.sim.command({ kind: 'paintControl', nation, x: Math.floor(cx), y: Math.floor(cy), r });
          await w.sim.step(1);
          await new Promise<void>((done) => { const wait = (): void => void (w.view!.lastTick > tick ? done() : setTimeout(wait, 5)); wait(); });
        };
        // The whole of the disc the other's first, its flash put out: then all of it changes hands.
        await paint(from);
        w.view!.flashes.clear();
        await paint(to);
        return performance.now();
      }, { to, from: to === GER ? POL : GER, cx, cy, r });
      const fresh = await flashAt(page, cx, cy, r + 1, t0 + 30);
      const mid = await flashAt(page, cx, cy, r + 1, t0 + FLASH_MS * 0.5);
      const late = await flashAt(page, cx, cy, r + 1, t0 + FLASH_MS - 60);
      const over = await flashAt(page, cx, cy, r + 1, t0 + FLASH_MS + 60);
      process.stderr.write(`paint r ${r} at ${m} m/px: ${fresh.cells} cells flash; white px at 30 ms ${fresh.white}, half way ${mid.white}, 60 ms before its end ${late.white}, after ${over.white} (${base} with no flash)\n`);
      expect(fresh.cells, `r ${r}, ${m} m/px: the cells taken flash`).toBeGreaterThanOrEqual(r === 1 ? 3 : 20);
      expect(fresh.white, `r ${r}, ${m} m/px: the patch at its start`).toBeGreaterThan(base + (m >= 8000 ? 3 : 30));
      expect(mid.white, `r ${r}, ${m} m/px: fading`).toBeLessThanOrEqual(fresh.white);
      expect(mid.cells, 'still flashing half way').toBe(fresh.cells);
      expect(over.cells, `r ${r}, ${m} m/px: over after FLASH_MS`).toBe(0);
      expect(over.white, `r ${r}, ${m} m/px: nothing left of it`).toBe(base);
      if (r === 3 && m === 1500) {
        // A picture of it: taken again, and shot while it fades (the page draws at its own time).
        await page.evaluate(async ({ to, from, cx, cy, r }) => {
          const w = window.__warsim!;
          for (const nation of [from, to]) {
            const tick = w.view!.lastTick;
            w.sim.command({ kind: 'paintControl', nation, x: Math.floor(cx), y: Math.floor(cy), r });
            await w.sim.step(1);
            await new Promise<void>((done) => { const wait = (): void => void (w.view!.lastTick > tick ? done() : setTimeout(wait, 5)); wait(); });
          }
        }, { to, from: to === GER ? POL : GER, cx, cy, r });
        await page.screenshot({ path: path.join(out, 'flash-1500.png') });
        await page.waitForTimeout(FLASH_MS + 100);
      }
    }
  }
  // Painted again as it is: nothing changes hands, nothing flashes.
  const again = await page.evaluate(async ({ to, cx, cy }) => {
    const w = window.__warsim!;
    const tick = w.view!.lastTick;
    w.sim.command({ kind: 'paintControl', nation: to, x: Math.floor(cx), y: Math.floor(cy), r: 3 });
    await w.sim.step(1);
    await new Promise<void>((done) => { const wait = (): void => void (w.view!.lastTick > tick ? done() : setTimeout(wait, 5)); wait(); });
    return w.view!.flashes.count(performance.now());
  }, { to: (turn - 1) % 2 === 0 ? GER : POL, cx, cy });
  expect(again, 'the same holder again: no flash').toBe(0);

  // A load: the world of the save comes with other holders there (the paint undone), and nothing flashes.
  const cells = await page.evaluate(async ({ to, cx, cy }) => {
    const w = window.__warsim!;
    const save = await w.sim.save();
    const tick = w.view!.lastTick;
    w.sim.command({ kind: 'paintControl', nation: to, x: Math.floor(cx), y: Math.floor(cy), r: 3 });
    await w.sim.step(1);
    await new Promise<void>((done) => { const wait = (): void => void (w.view!.lastTick > tick ? done() : setTimeout(wait, 5)); wait(); });
    const painted = w.view!.flashes.count(performance.now());
    await w.sim.load(save);
    await new Promise((done) => setTimeout(done, 400));
    return { painted, loaded: w.view!.flashes.count(performance.now()) };
  }, { to: (turn - 1) % 2 === 0 ? POL : GER, cx, cy });
  expect(cells.painted, 'the paint before the load flashed').toBeGreaterThan(20);
  expect(cells.loaded, 'no flash at a load').toBe(0);
});
