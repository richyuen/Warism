import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R81c (critic run 67: "the burst is a smudge at 937 m/px"): a burst read at a world zoom. God's H-bomb on
// Paris, the game run at Speed ×1 on the page's own clock: at 937 and 3,000 m/px the burst's mark (ground zero's ring
// about a dot, `NukeFx`'s fourth part) is at least 16 px across both ways for at least 10 s: the effect drawn alone on a
// clear canvas at the camera of each zoom, its pixels drawn at over a quarter's opacity. Shots at 10.5 s, looked at.

const { w: W, h: H } = SIZE_1938;
const PARIS = cellOf(2.35, 48.86, W, H);
const ZOOMS = [937, 3000];

interface Read { age: number; m: number; w: number; h: number; marks: number }

/** At each zoom, the burst's age and the extent (CSS px) of what it draws within 120 px of it. */
function read(page: Page): Promise<Read[]> {
  return page.evaluate(
    ({ x, y, zooms }) => {
      const v = window.__warsim!.view!;
      const vw = innerWidth;
      const vh = innerHeight;
      const canvas = document.createElement('canvas');
      [canvas.width, canvas.height] = [vw, vh];
      const ctx = canvas.getContext('2d')!;
      const box = 120;
      const out: { age: number; m: number; w: number; h: number; marks: number }[] = [];
      for (const m of zooms) {
        v.controller.set({ cx: x, cy: y, scale: (v.geo.kmPerCell * 1000) / m });
        ctx.clearRect(0, 0, vw, vh);
        const now = performance.now();
        v.nukeFx.draw(ctx, v.controller.cam, v.geo, vw, vh, now);
        const marks = v.nukeFx.shown[3]!;
        const age = now - v.nukeFx.bursts[0]!.born;
        const on = ctx.getImageData(Math.round(vw / 2) - box, Math.round(vh / 2) - box, 2 * box, 2 * box).data;
        const dpr = 1;
        let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
        for (let j = 0; j < 2 * box; j++)
          for (let i = 0; i < 2 * box; i++) {
            const k = 4 * (j * 2 * box + i);
            // Drawn at more than a quarter's opacity (the flash's whitening of the view is under it).
            if (on[k + 3]! <= 64) continue;
            [x0, y0, x1, y1] = [Math.min(x0, i), Math.min(y0, j), Math.max(x1, i), Math.max(y1, j)];
          }
        out.push({ age, m, w: x1 >= x0 ? (x1 - x0 + 1) / dpr : 0, h: y1 >= y0 ? (y1 - y0 + 1) / dpr : 0, marks });
      }
      return out;
    },
    { x: PARIS[0], y: PARIS[1], zooms: ZOOMS },
  );
}

test("a burst at 937 and 3,000 m/px: a mark 16 px across or more for 10 s at Speed ×1", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.evaluate(({ x, y }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: (window.__warsim!.view!.geo.kmPerCell * 1000) / 937 }), { x: PARIS[0], y: PARIS[1] });
  await page.evaluate(({ x, y }) => window.__warsim!.hud.command({ kind: 'godNuke', x, y, thermonuclear: true }, 'act'), { x: PARIS[0], y: PARIS[1] });
  await page.waitForFunction(() => window.__warsim!.view!.nukeFx.bursts.length === 1, null, { timeout: 15_000 });
  await page.getByTestId('nuke-close').click({ timeout: 15_000 });
  // Speed ×1, running.
  await page.evaluate(() => {
    const h = window.__warsim!.hud;
    h.setSpeedLevel(0);
    if (h.paused.value) h.togglePause();
  });

  const reads: Read[] = [];
  for (const at of [1000, 4000, 7000, 9000, 10_300]) {
    const age = await page.evaluate(() => performance.now() - window.__warsim!.view!.nukeFx.bursts[0]!.born);
    if (at > age) await page.waitForTimeout(at - age);
    reads.push(...(await read(page)));
  }
  for (const m of ZOOMS) {
    await page.evaluate(({ x, y, m }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: (window.__warsim!.view!.geo.kmPerCell * 1000) / m }), { x: PARIS[0], y: PARIS[1], m });
    await page.screenshot({ path: path.join(info.outputPath(), `burst-${m}m-10s.png`) });
  }
  console.log(reads.map((r) => `${Math.round(r.age)} ms ${r.m} m/px: ${r.w.toFixed(1)} x ${r.h.toFixed(1)} px`).join('\n'));
  expect(reads.at(-1)!.age).toBeGreaterThanOrEqual(10_000);
  for (const r of reads) {
    expect(r.marks, `${Math.round(r.age)} ms at ${r.m} m/px`).toBe(1);
    expect(Math.min(r.w, r.h), `${Math.round(r.age)} ms at ${r.m} m/px`).toBeGreaterThanOrEqual(16);
  }
});
