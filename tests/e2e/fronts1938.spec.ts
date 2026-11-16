import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { FRONT_CORE_RGB } from '../../src/render/map/ground';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R90a (ADR-1078): the border between the land two nations at war hold is a front, a hot red line with a glow,
// at every zoom, on the ground of the close tiers too. At the world's zoom a war was a hatched patch and a small burst.

const { w: W, h: H } = SIZE_1938;
const nation = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [GER, POL, CZE] = [nation('GER'), nation('POL'), nation('CZE')];

interface Fronts {
  /** The points of the border of `a` and `b` in the view, and those with the front's line near. */
  points: number;
  lit: number;
  /** The same for the border of `a` and `c`, away from the first border. */
  otherPoints: number;
  otherLit: number;
  /** Pixels of the line's colour in the whole picture. */
  hot: number;
}

/** The map's picture at rest: the front's line along the border of `a` and `b`, and along that of `a` and `c`. */
function fronts(page: Page, a: number, b: number, c: number): Promise<Fronts> {
  return page.evaluate(({ a, b, c, core }) => {
    const v = window.__warsim!.view!;
    const canvas = document.getElementById('map') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2')!;
    v.draw(performance.now() + 1e6);
    const [w, h] = [canvas.width, canvas.height];
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    // The colour of the line's core (`FRONT_CORE_RGB`), read from the bottom row up.
    const isHot = (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      const i = ((h - 1 - y) * w + x) * 4;
      return Math.abs(px[i]! - core[0]!) + Math.abs(px[i + 1]! - core[1]!) + Math.abs(px[i + 2]! - core[2]!) < 50;
    };
    let hot = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (isHot(x, y)) hot++;
    const grid = (v as unknown as { controlGrid: Uint16Array }).controlGrid;
    const gw = v.geo.w;
    const k = w / canvas.clientWidth;
    const cam = v.controller.cam;
    /** The middles of the cell edges between what `p` and `q` hold, on the screen in device px. */
    const border = (p: number, q: number): [number, number][] => {
      const out: [number, number][] = [];
      const [x0, x1] = [Math.floor(cam.cx - canvas.clientWidth / 2 / cam.scale) - 1, Math.ceil(cam.cx + canvas.clientWidth / 2 / cam.scale) + 1];
      const [y0, y1] = [Math.max(0, Math.floor(cam.cy - canvas.clientHeight / 2 / cam.scale) - 1), Math.min(v.geo.h - 2, Math.ceil(cam.cy + canvas.clientHeight / 2 / cam.scale) + 1)];
      for (let y = y0; y <= y1; y++) {
        for (let x = Math.max(0, x0); x <= Math.min(gw - 2, x1); x++) {
          const here = grid[y * gw + x]!;
          for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
            const there = grid[(y + dy) * gw + x + dx]!;
            if (!((here === p && there === q) || (here === q && there === p))) continue;
            const [sx, sy] = [((x + 0.5 + dx / 2 - cam.cx) * cam.scale + canvas.clientWidth / 2) * k, ((y + 0.5 + dy / 2 - cam.cy) * cam.scale + canvas.clientHeight / 2) * k];
            if (sx > 8 && sy > 8 && sx < w - 8 && sy < h - 8) out.push([sx, sy]);
          }
        }
      }
      return out;
    };
    // The border is smoothed and warped by up to a cell from the cells' edges: the line is looked for that far, and 3 px.
    const reach = Math.ceil(cam.scale * k * 0.75) + 3;
    const near = (x: number, y: number): boolean => {
      for (let dy = -reach; dy <= reach; dy++) for (let dx = -reach; dx <= reach; dx++) if (isHot(Math.round(x) + dx, Math.round(y) + dy)) return true;
      return false;
    };
    const first = border(a, b);
    const other = border(a, c).filter(([x, y]) => first.every(([fx, fy]) => Math.hypot(fx - x, fy - y) > 2 * reach + 12 * k));
    return { points: first.length, lit: first.filter(([x, y]) => near(x, y)).length, otherPoints: other.length, otherLit: other.filter(([x, y]) => near(x, y)).length, hot };
  }, { a, b, c, core: FRONT_CORE_RGB.map((x) => Math.round(255 * x)) });
}

test('a front: the border between two nations at war glows red, a border at peace does not, and it is gone at the peace', async ({ page }, info) => {
  test.setTimeout(240_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R90a') : info.outputPath();
  mkdirSync(out, { recursive: true });
  // Where Germany, Poland and Czechoslovakia meet: Silesia.
  const [cx, cy] = cellOf(17.5, 51, W, H);
  const ZOOMS = [20_000, 8000, 4000, 1500, 600, 150];
  const peace: Record<number, Fronts> = {};
  for (const m of ZOOMS) {
    await lookAt(page, cx, cy, m);
    peace[m] = await fronts(page, GER, POL, CZE);
    expect(peace[m]!.points, `${m} m/px: the German-Polish border in view`).toBeGreaterThan(8);
    expect(peace[m]!.lit, `${m} m/px: no front in peace`).toBe(0);
    if (m === 4000) await page.screenshot({ path: path.join(out, 'peace-4000.png') });
  }
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  // From the war's first hour, before the armies have moved the border, and as they do.
  for (const hour of [1, 6, 48]) {
    await page.evaluate((h) => window.__warsim!.sim.step(h - window.__warsim!.view!.lastTick), hour);
    await page.waitForFunction((h) => window.__warsim!.view!.lastTick >= h, hour, { timeout: 60_000 });
    for (const m of ZOOMS) {
      await lookAt(page, cx, cy, m);
      const f = await fronts(page, GER, POL, CZE);
      process.stderr.write(`hour ${hour}, ${m} m/px: front on ${f.lit} of ${f.points} points of the German-Polish border, ${f.otherLit} of ${f.otherPoints} of the German-Czech; ${f.hot} px of the line (${peace[m]!.hot} in peace)\n`);
      expect(f.points, `hour ${hour}, ${m} m/px: the border in view`).toBeGreaterThan(8);
      expect(f.lit / f.points, `hour ${hour}, ${m} m/px: the front along the border at war`).toBeGreaterThanOrEqual(0.9);
      if (f.otherPoints > 0) expect(f.otherLit / f.otherPoints, `hour ${hour}, ${m} m/px: no front along a border at peace`).toBeLessThanOrEqual(0.05);
      expect(f.hot, `hour ${hour}, ${m} m/px: the line's pixels`).toBeGreaterThan(peace[m]!.hot + 40);
      if (hour === 6) await page.screenshot({ path: path.join(out, `war-${m}.png`) });
    }
  }
  // The peace: the line is gone at every zoom.
  const war = await page.evaluate(({ a, d }) => window.__warsim!.hud.stats.value!.wars.find((w) => w.attackers.includes(a) && w.defenders.includes(d))!.id, { a: GER, d: POL });
  await page.evaluate((w) => window.__warsim!.sim.command({ kind: 'forcePeace', war: w }), war);
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.waitForFunction(() => window.__warsim!.view!.lastTick >= 50, null, { timeout: 60_000 });
  for (const m of ZOOMS) {
    await lookAt(page, cx, cy, m);
    const f = await fronts(page, GER, POL, CZE);
    expect(f.lit, `${m} m/px: no front after the peace`).toBe(0);
  }
});
