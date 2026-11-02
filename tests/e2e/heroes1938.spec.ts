import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// PLAN 7.184b: the heroes drawn. With `?heroes=on` the 1938 world has the 14 heroes of
// data/scenarios/1938/heroes.json (PLAN 7.184a), each a formation of one element.

const EVIDENCE = path.resolve('docs/evidence/7.184b');

/** Opens the 1938 world, paused, with the heroes on. */
async function openWithHeroes(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938&heroes=on');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
}

/** The id of the hero named `name` in the last snapshot. */
async function heroId(page: Page, name: string): Promise<number> {
  return page.evaluate((name) => {
    const v = window.__warsim!.view!;
    return v.heroFormations().find((f) => v.formationTitle(f)?.name === name) ?? 0;
  }, name);
}

/** Centres the view on formation `id` at `mPerPx` metres a CSS px. */
async function lookAt(page: Page, id: number, mPerPx: number): Promise<void> {
  await page.evaluate(({ id, mPerPx }) => {
    const v = window.__warsim!.view!;
    const [x, y] = v.formationPos(id)!;
    v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / mPerPx });
  }, { id, mPerPx });
}

test('PLAN 7.184b1: with heroes=on, 14 hero formations, each tagged by its name alone', async ({ page }) => {
  test.setTimeout(180_000);
  await openWithHeroes(page);
  const heroes = await page.evaluate(() => window.__warsim!.view!.heroFormations().length);
  expect(heroes, 'hero formations in the 1938 world with heroes=on').toBe(14);
  for (const name of ['Yamato', 'Maus']) {
    const id = await heroId(page, name);
    expect(id, `${name}'s formation`).toBeGreaterThan(0);
    await lookAt(page, id, 150);
    await page.waitForFunction(() => window.__warsim!.view!.subscription?.tier === 2 && window.__warsim!.view!.elementCount > 0, null, { timeout: 30_000 });
    await page.waitForFunction((id) => window.__warsim!.view!.tagRects.some((g) => g.id === id) && window.__warsim!.view!.tagOpacity > 0.99, id, { timeout: 15_000 });
    const tag = await page.evaluate((id) => window.__warsim!.view!.tagRects.find((g) => g.id === id)!.name, id);
    expect(tag, `${name}'s tag at T2`).toBe(name);
    await page.screenshot({ path: path.join(EVIDENCE, `b1-tag-${name.toLowerCase()}-150m.png`), clip: { x: 500, y: 250, width: 400, height: 300 } });
  }
});
