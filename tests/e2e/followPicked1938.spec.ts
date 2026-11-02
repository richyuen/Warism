import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// PLAN 7.183 (the user's request of 2026-11-01): the camera follows any formation clicked, played
// or not. With no nation played, a German division and a British fleet are clicked in turn, far
// out (T1, its marker) and close in (T2, its tag or elements); each marches 48 ticks, and the
// view's centre stays on the place it is drawn at. A pan ends the follow.

const { w: W, h: H } = SIZE_1938;
const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const T1 = 1500;
const T2 = 150;

/** A CSS-px point of the map where a click picks formation `id` (`formationPick`), near where it stands; null: none. */
function clickPoint(page: Page, id: number): Promise<[number, number] | null> {
  return page.evaluate((id) => {
    const v = window.__warsim!.view!;
    v.draw();
    const [x, y] = v.formationPos(id)!;
    const cam = v.controller.cam;
    const c = document.querySelector('canvas.map-nations') as HTMLCanvasElement;
    const px = (x - cam.cx) * cam.scale + c.clientWidth / 2;
    const py = (y - cam.cy) * cam.scale + c.clientHeight / 2;
    let best: [number, number] | null = null;
    let near = Infinity;
    for (let dy = -60; dy <= 60; dy += 3) {
      for (let dx = -60; dx <= 60; dx += 3) {
        const d = Math.hypot(dx, dy);
        const on = px + dx > 0 && px + dx < c.clientWidth && py + dy > 0 && py + dy < c.clientHeight;
        if (on && d < near && v.formationPick(px + dx, py + dy) === id) [best, near] = [[px + dx, py + dy], d];
      }
    }
    return best;
  }, id);
}

/** How far the followed formation's drawn place is from the view's centre, CSS px. */
const offMiddle = (page: Page): Promise<number> =>
  page.evaluate(() => {
    const v = window.__warsim!.view!;
    const p = v.pickedPoint();
    if (!p) return Infinity;
    return Math.hypot(p[0] - v.controller.cam.cx, p[1] - v.controller.cam.cy) * v.controller.cam.scale;
  });

async function step(page: Page, ticks: number): Promise<void> {
  const to = (await page.evaluate(() => window.__warsim!.view!.lastTick)) + ticks;
  await page.evaluate((n) => window.__warsim!.sim.step(n), ticks);
  await page.waitForFunction((t) => window.__warsim!.view!.lastTick >= t, to, { timeout: 30_000 });
}

/**
 * At `m` metres a px: formation `id` clicked, sent to (`tx`, `ty`), 48 ticks on. Its panel is
 * open, the camera follows it, and the view's centre is within 2 px of where it is drawn.
 */
async function clickAndMarch(page: Page, id: number, m: number, target: [number, number], shot: string): Promise<void> {
  const [x, y] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), id))!;
  await lookAt(page, x, y, m);
  const at = await clickPoint(page, id);
  expect(at, `a point that picks formation ${id} at ${m} m/px`).not.toBeNull();
  await page.mouse.click(at![0], at![1]);
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value)).toBe(id);
  expect(await page.evaluate(() => window.__warsim!.view!.controller.following), 'following after the click').toBe(true);
  await page.evaluate(({ id, x, y }) => window.__warsim!.sim.command({ kind: 'moveFormation', id, x, y }), { id, x: target[0], y: target[1] });
  const cam0 = await page.evaluate(() => [window.__warsim!.view!.controller.cam.cx, window.__warsim!.view!.controller.cam.cy]);
  await step(page, 48);
  const [x1, y1] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), id))!;
  expect(Math.hypot(x1 - x, y1 - y), 'it marched, cells').toBeGreaterThan(0.3);
  expect(await page.evaluate(() => window.__warsim!.view!.controller.following), 'still following after the march').toBe(true);
  await expect.poll(() => offMiddle(page), { timeout: 10_000, message: `the centre on its drawn place at ${m} m/px` }).toBeLessThan(2);
  const cam1 = await page.evaluate(() => [window.__warsim!.view!.controller.cam.cx, window.__warsim!.view!.controller.cam.cy]);
  expect(Math.hypot(cam1[0]! - cam0[0]!, cam1[1]! - cam0[1]!), 'the camera came with it, cells').toBeGreaterThan(0.3);
  await page.screenshot({ path: shot });
}

test('a clicked formation of a nation not played is followed at T1 and T2, a division and a fleet; a pan ends it', async ({ page }, info) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await open1938(page, 1938);
  expect(await page.evaluate(() => window.__warsim!.hud.stats.value!.player), 'no nation played').toBe(0);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/7.183') : info.outputPath();
  mkdirSync(out, { recursive: true });

  // A German division that a click at T1 picks (not under another's marker), not in a fight.
  const divisions = await page.evaluate((g) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(g).filter((id) => !v.formationAfloat(id) && !v.formationEngaged(id));
  }, GER);
  expect(divisions.length, 'German divisions').toBeGreaterThan(5);
  let division = 0;
  for (const id of divisions) {
    const [x, y] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), id))!;
    await lookAt(page, x, y, T1);
    if ((await clickPoint(page, id)) !== null) {
      division = id;
      break;
    }
  }
  expect(division, 'a German division a click picks at T1').toBeGreaterThan(0);
  const [dx, dy] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), division))!;
  await clickAndMarch(page, division, T1, [dx - 8, dy], path.join(out, 'division-t1.png'));
  const [ex, ey] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), division))!;
  await clickAndMarch(page, division, T2, [ex - 8, ey + 2], path.join(out, 'division-t2.png'));

  // The British squadron at Gibraltar, sent to Alexandria.
  const [gx, gy] = cellOf(-5.35, 36.13, W, H);
  const fleets = await page.evaluate(({ gx, gy, e }) => {
    const v = window.__warsim!.view!;
    return v
      .formationIds()
      .filter((id) => v.formationAfloat(id) && v.formationNation(id) === e && Math.hypot(v.formationPos(id)![0] - gx, v.formationPos(id)![1] - gy) < 6);
  }, { gx, gy, e: ENG });
  expect(fleets.length, 'British fleets at Gibraltar').toBeGreaterThan(0);
  let fleet = 0;
  for (const id of fleets) {
    const [x, y] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), id))!;
    await lookAt(page, x, y, T1);
    if ((await clickPoint(page, id)) !== null) {
      fleet = id;
      break;
    }
  }
  expect(fleet, 'a British fleet a click picks at T1').toBeGreaterThan(0);
  const alexandria = cellOf(29.9, 31.25, W, H);
  await clickAndMarch(page, fleet, T1, alexandria, path.join(out, 'fleet-t1.png'));
  await clickAndMarch(page, fleet, T2, alexandria, path.join(out, 'fleet-t2.png'));

  // A drag of the map is the user's pan: the follow ends, and the centre stays put the next 24 ticks.
  await page.mouse.move(400, 300);
  await page.mouse.down();
  await page.mouse.move(460, 330, { steps: 5 });
  await page.mouse.up();
  expect(await page.evaluate(() => window.__warsim!.view!.controller.following), 'no follow after a pan').toBe(false);
  const panned = await page.evaluate(() => ({ ...window.__warsim!.view!.controller.cam }));
  await step(page, 24);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => ({ ...window.__warsim!.view!.controller.cam })), 'the camera stayed after the pan').toEqual(panned);
  expect(await page.evaluate(() => window.__warsim!.hud.formation.value), 'its panel still open').toBe(fleet);

  // Clicked again it is followed again; Escape closes its panel, and the follow goes with it.
  // (It has sailed out of the view in the 24 ticks: looked at again first.)
  const [fx, fy] = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), fleet))!;
  await lookAt(page, fx, fy, T1);
  const again = await clickPoint(page, fleet);
  expect(again, 'a point that picks the fleet').not.toBeNull();
  await page.mouse.click(again![0], again![1]);
  await expect.poll(() => page.evaluate(() => window.__warsim!.view!.controller.following)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value)).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__warsim!.view!.controller.following), { message: 'no follow after Escape' }).toBe(false);
});
