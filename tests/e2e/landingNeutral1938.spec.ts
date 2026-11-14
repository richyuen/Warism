import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R20 AT (the page's part; the sim's cases are `landingNeutral1938.test.ts`; critic run 32,
// R32-B1): a click over the sea onto the coast of a nation outside the player's wars is refused,
// and the panel says why; a division of the player's set home across the sea (here one put on
// France's ground by the editor) has a row below the ticker that says so.

const { w: W, h: H } = SIZE_1938;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const cell = (lon: number, lat: number): [number, number] => cellOf(lon, lat, W, H).map((v) => Math.floor(v)) as [number, number];
const LONDON = cell(-0.12, 51.5);
const CALAIS = cell(1.86, 50.95);

/** The 1938 world with Britain played, its land division nearest London selected and its panel open. */
async function britain(page: Page): Promise<number> {
  await page.goto('/?scenario=1938&paused=1&seed=2207');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, ENG, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: ENG, x: LONDON[0] + 0.5, y: LONDON[1] + 0.5 });
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  return div;
}

test('a landing on a neutral coast is refused and told; a division set home across the sea is told', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await britain(page);

  // Calais is France's, at peace with Britain: refused, with the reason.
  await page.evaluate(([x, y]) => window.__warsim!.player!.click(x, y, -9999, -9999, false), CALAIS);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('outside its wars', { timeout: 10_000 });

  // A British division on France's ground, no way home by land: at the next day start it is set
  // home, and a row below the ticker says so.
  await page.evaluate(([x, y, n]) => window.__warsim!.hud.command({ kind: 'spawnFormation', nation: n, x: x + 0.5, y: y + 0.5, strength: 10_000 }), [CALAIS[0], CALAIS[1], ENG] as const);
  await page.evaluate(() => window.__warsim!.sim.step(26));
  await expect(page.locator('[data-testid="order-news"][data-order="sentHome"]')).toBeVisible({ timeout: 10_000 });
});

// ROADMAP R21c (critic run 33, R33-N3): with the mouse, as a player does it. Over Calais at peace the
// tooltip says no landing there, not "go by sea"; a real click there is refused, and the formation's
// panel, which the click closed, opens again with the reason in it.
test('with the mouse: the tooltip over a neutral coast says no landing; the refused click keeps the reason in the panel', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const div = await britain(page);
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x + 0.5, y + 0.5), CALAIS);
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
  const box = (await page.locator('canvas').first().boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
  await expect(page.getByTestId('tooltip-sea-refused')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('tooltip-by-sea')).toHaveCount(0);
  await page.mouse.click(cx, cy);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  await expect(page.getByTestId('formation-notice')).toContainText('outside its wars', { timeout: 10_000 });
});

// ROADMAP R22g (critic run 34, R34-N4): a click on the open sea off Bergen with Britain's division
// selected was refused for "a way by land"; the panel now says there is only sea there.
test('a click on the open sea is refused for the sea', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await britain(page);
  await page.evaluate(() => window.__warsim!.player!.click(1048.5, 199.5, -9999, -9999, false));
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('only sea there', { timeout: 10_000 });
  await expect(page.getByTestId('formation-notice')).not.toContainText('way by land');
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/landingOpenSea1938.png' });
});
