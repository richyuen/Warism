import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R81b (ADR-1032, ADR-1034): each God Mode tool's act undone from the bar's Undo, by its own buttons and clicks
// on the map: after the act the world is another and Undo is offered; after Undo the world's hash is the one before
// the act to the bit, the bar says to which date, and Undo is gone until the next act.

const { w: W, h: H } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;

async function lookAt(page: Page, lon: number, lat: number, scale = 8): Promise<void> {
  const [x, y] = cellOf(lon, lat, W, H);
  await page.evaluate(({ x, y, scale }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale }), { x, y, scale });
  await page.waitForTimeout(200);
}

const hash = (page: Page): Promise<number> => page.evaluate(() => window.__warsim!.sim.hash().then((s) => s.hash));

/** `act` through the page; then Undo: the world before it, to the bit. */
async function undone(page: Page, name: string, act: () => Promise<void>): Promise<void> {
  await expect(page.getByTestId('god-undo'), `${name}: nothing to undo before`).toHaveCount(0);
  const before = await hash(page);
  await act();
  await expect(page.getByTestId('god-undo'), `${name}: Undo offered`).toBeVisible({ timeout: 15_000 });
  expect(await hash(page), `${name}: the act changed the world`).not.toBe(before);
  await page.getByTestId('god-undo').click();
  await expect.poll(() => hash(page), { message: `${name}: the world before the act` }).toBe(before);
  await expect(page.getByTestId('god-undone'), name).toBeVisible();
  await expect(page.getByTestId('god-undo'), name).toHaveCount(0);
  // Alerts of the act's strike go with it.
  if (await page.getByTestId('nuke-close').count()) await page.getByTestId('nuke-close').click();
}

/** Selects the nation under (lon, lat) with no tool armed. */
async function select(page: Page, lon: number, lat: number, tag: string): Promise<void> {
  await lookAt(page, lon, lat);
  await page.mouse.click(800, 450);
  await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', String(id(tag)));
}

test('each God Mode tool undone from the bar: the world before the act to the bit', async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.getByTestId('god-btn').click();
  await expect(page.getByTestId('god-tools')).toBeVisible();

  const onMap = async (tool: string, lon: number, lat: number): Promise<void> => {
    await page.getByTestId(`god-tool-${tool}`).click();
    await lookAt(page, lon, lat);
    await page.mouse.click(800, 450);
  };
  await undone(page, 'nuke', async () => {
    await page.getByTestId('god-tool-nuke').click();
    await page.getByTestId('god-nuke-size').selectOption('thermonuclear');
    await lookAt(page, 21.01, 52.23);
    await page.mouse.click(800, 450);
    await expect(page.getByTestId('nuke-alert-text')).toContainText('a hydrogen bomb', { timeout: 15_000 });
  });
  await page.screenshot({ path: path.join(info.outputPath(), 'undone-nuke.png') });
  await undone(page, 'revolt', () => onMap('revolt', 21.01, 52.23));
  await undone(page, 'nation', () => onMap('nation', 23.0, 52.5));
  await undone(page, 'city', () => onMap('city', 19.0, 51.0));
  await undone(page, 'raze', () => onMap('raze', 21.01, 52.23));
  await page.getByTestId('god-tool-raze').click();

  // The nation's tools: Germany selected.
  await select(page, 10.5, 51, 'GER');
  await undone(page, 'brush', async () => {
    await page.getByTestId('god-tool-brush').click();
    await lookAt(page, 18.0, 52.0);
    await page.mouse.move(800, 450);
    await page.mouse.down();
    await page.mouse.move(830, 455, { steps: 6 });
    await page.mouse.move(860, 450, { steps: 6 });
    await page.mouse.up();
  });
  await page.screenshot({ path: path.join(info.outputPath(), 'undone-brush.png') });
  await page.getByTestId('god-tool-brush').click();
  // Breakthrough wants a war: Germany's on Poland, set up first (no act of the bar's).
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }, true), { a: id('GER'), d: id('POL') });
  await expect.poll(() => page.evaluate(() => window.__warsim!.hud.stats.value!.wars.length)).toBeGreaterThan(0);
  await select(page, 10.5, 51, 'GER');
  await undone(page, 'battle', async () => {
    await page.getByTestId('god-tool-battle').click();
    await lookAt(page, 16.5, 52.4);
    await page.mouse.click(800, 450);
    await lookAt(page, 19.5, 52.2);
    await page.mouse.click(800, 450);
  });
  // A power of the God tab, and a division placed from it.
  await select(page, 10.5, 51, 'GER');
  await page.getByTestId('tab-god').click();
  await undone(page, 'efficiency', () => page.getByTestId('god-ce-up').click());
  await undone(page, 'place', async () => {
    await page.getByTestId('god-place-0').click();
    await lookAt(page, 12.0, 50.5);
    await page.mouse.click(800, 450);
  });
  await page.screenshot({ path: path.join(info.outputPath(), 'undone-place.png') });
});

test('a player order after an act leaves nothing to undo', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.getByTestId('god-btn').click();
  await select(page, 10.5, 51, 'GER');
  await page.getByTestId('tab-god').click();
  await page.getByTestId('god-ce-up').click();
  await expect(page.getByTestId('god-undo')).toBeVisible({ timeout: 15_000 });
  await page.evaluate((n) => window.__warsim!.hud.command({ kind: 'setPlayer', nation: n }), id('GER'));
  await expect(page.getByTestId('god-undo')).toHaveCount(0, { timeout: 15_000 });
});
