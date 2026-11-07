import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// ROADMAP R34g (critic runs 29 and 30, R29-N6 and R30-N4): at T1 a hero's marker, twice the others', hid the
// fleets stacked where it stands: seed 3739, heroes on, two hours in, Bismarck at Kiel over the German fleets
// (1199, 1200, 1202), 1,200 m/px: five clicks opened Bismarck five times. Now the hero's marker steps clear of
// them: no marker under it, a click on the fleets' opens a fleet, a click on the hero's opens it.

const BISMARCK = 1474;

type Rect = { id: number; x: number; y: number; w: number; h: number; members: number[] };

const rects = (page: Page): Promise<Rect[]> =>
  page.evaluate(() => window.__warsim!.view!.markerRects.filter((r) => r.alpha > 0.5).map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, members: [...r.members] })));

test('T1: Bismarck at Kiel covers no fleet, and each opens with a click', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=3739&heroes=on');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) >= 2, null, { timeout: 60_000 });
  const p = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), BISMARCK))!;
  await page.evaluate(([x, y]) => {
    const v = window.__warsim!.view!;
    v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 1200 });
  }, p);
  await page.waitForTimeout(1500);
  const all = await rects(page);
  const hero = all.find((r) => r.id === BISMARCK);
  expect(hero, "Bismarck's marker drawn").toBeDefined();
  const others = all.filter((r) => r.id !== BISMARCK);
  const near = others.filter((r) => Math.hypot(r.x + r.w / 2 - (hero!.x + hero!.w / 2), r.y + r.h / 2 - (hero!.y + hero!.h / 2)) < 120);
  expect(near.length, 'markers beside the hero (the case is there)').toBeGreaterThan(0);
  const under = others.filter((r) => r.x < hero!.x + hero!.w && hero!.x < r.x + r.w && r.y < hero!.y + hero!.h && hero!.y < r.y + r.h).map((r) => r.id);
  process.stderr.write(`R34g: hero at ${hero!.x.toFixed(0)},${hero!.y.toFixed(0)}; ${near.length} markers near, ${under.length} under it\n`);
  expect(under, 'markers under the hero').toEqual([]);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'hero-stack-kiel-1200m.png') });
  // A click on the nearest other marker opens one of its formations; one on the hero's opens it.
  const cb = (await page.locator('canvas').first().boundingBox())!;
  const fleet = near.sort((a, b) => Math.hypot(a.x - hero!.x, a.y - hero!.y) - Math.hypot(b.x - hero!.x, b.y - hero!.y))[0]!;
  await page.mouse.click(cb.x + fleet.x + fleet.w / 2, cb.y + fleet.y + 8);
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value)).not.toBe(0);
  const opened = await page.evaluate(() => window.__warsim!.hud.formation.value);
  expect(fleet.members, 'the click on the fleets opened one of them').toContain(opened);
  await page.keyboard.press('Escape');
  await page.mouse.click(cb.x + hero!.x + hero!.w / 2, cb.y + hero!.y + 10);
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value)).toBe(BISMARCK);
});
