import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// PLAN 4.9c (the critic's R4-B2): a refused order said nothing on the screen. Switzerland, played,
// orders a division to London: it has no port, and the ticker says so within a second, as does
// the division's panel; a click on the row flies to the division and forgets the row.

const { w: W, h: H } = SIZE_1938;
const SWI = NATIONS_1938.findIndex((n) => n.tag === 'SWI') + 1;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;

test('a refused order says why, in the ticker and in the formation\'s panel', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 0, SWI, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), SWI);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();

  const div = await page.evaluate((n) => window.__warsim!.view!.formationsOf(n)[0]!, SWI);
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  // At war with Britain: London at peace is refused before the port is sought (ROADMAP R20, `Neutral`).
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: SWI, d: ENG });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('order-news')).toHaveCount(0);
  await page.evaluate(({ div, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: div, x, y, nation: n }), { div, x: Math.floor(lx) + 0.5, y: Math.floor(ly) + 0.5, n: SWI });
  const row = page.getByTestId('order-news');
  await expect(row).toHaveCount(1, { timeout: 1000 });
  await expect(row).toContainText('no port');
  await expect(row).toHaveAttribute('data-order', 'refused');

  // The division's panel says it too.
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-notice')).toContainText('no port');
  // It holds while the division stands as it was refused (ROADMAP R22f, critic run 34, R34-N3).
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('formation-notice')).toContainText('no port');
  await page.evaluate(() => window.__warsim!.hud.selectFormation(0));

  // A click flies to the division and forgets the row.
  await row.click();
  await expect(page.getByTestId('order-news')).toHaveCount(0);
  const [cx, cy] = await page.evaluate(() => [window.__warsim!.view!.controller.cam.cx, window.__warsim!.view!.controller.cam.cy]);
  const at = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div))!;
  await expect.poll(async () => Math.hypot(...(await page.evaluate(() => [window.__warsim!.view!.controller.cam.cx, window.__warsim!.view!.controller.cam.cy])).map((v, i) => v - at[i]!) as [number, number]), { timeout: 5000 }).toBeLessThan(Math.max(2, Math.hypot(cx - at[0], cy - at[1])));
});

// ROADMAP R22f (critic run 34, R34-N3): a refusal stood in the panel for weeks after it stopped being
// true. Switzerland's division, refused London ("no port"), is then marched to Zurich: once it
// marches, the panel's refusal is gone; the ticker's row stays until it is clicked.
test('a refusal in the panel goes when the formation does something else', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 0, SWI, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), SWI);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate((n) => window.__warsim!.view!.formationsOf(n)[0]!, SWI);
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: SWI, d: ENG });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  await page.evaluate(({ div, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: div, x, y, nation: n }), { div, x: Math.floor(lx) + 0.5, y: Math.floor(ly) + 0.5, n: SWI });
  await expect(page.getByTestId('formation-notice')).toContainText('no port', { timeout: 10_000 });

  // Marched to Zurich, in its own land: the refusal no longer holds.
  const [zx, zy] = cellOf(8.54, 47.37, W, H);
  const at = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div))!;
  const far = Math.hypot(at[0] - zx, at[1] - zy) > 2;
  const [tx, ty] = far ? [zx, zy] : cellOf(7.45, 46.95, W, H);
  await page.evaluate(({ div, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: div, x, y, nation: n }), { div, x: Math.floor(tx) + 0.5, y: Math.floor(ty) + 0.5, n: SWI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-status')).toHaveText('On the march', { timeout: 10_000 });
  await expect(page.getByTestId('formation-notice')).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByTestId('order-news')).toHaveCount(1);
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/orderNews1938-stale.png' });
});

// ROADMAP R23c (critic run 35, R35-N1): a refusal given while marching stayed under the next march
// taken, the state "On the march" unchanged. Switzerland's division marching, refused London, then
// sent somewhere else in its land: the refusal holds while the first march goes on, and goes once
// the new order is taken.
test('a refusal given while marching goes with the next order taken', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 0, SWI, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), SWI);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate((n) => window.__warsim!.view!.formationsOf(n)[0]!, SWI);
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: SWI, d: ENG });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  const move = (x: number, y: number): Promise<void> =>
    page.evaluate(({ div, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: div, x, y, nation: n }), { div, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, n: SWI });

  // Marching to the far one of Zurich and Geneva.
  const zurich = cellOf(8.54, 47.37, W, H);
  const geneva = cellOf(6.14, 46.2, W, H);
  const at = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div))!;
  const [far, other] = Math.hypot(at[0] - zurich[0], at[1] - zurich[1]) > Math.hypot(at[0] - geneva[0], at[1] - geneva[1]) ? [zurich, geneva] : [geneva, zurich];
  await move(far[0], far[1]);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-status')).toHaveText('On the march', { timeout: 10_000 });

  // Refused London while marching: the notice holds while the march goes on.
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  await move(lx, ly);
  await expect(page.getByTestId('formation-notice')).toContainText('no port', { timeout: 10_000 });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('formation-notice')).toContainText('no port');

  // Sent elsewhere, taken: the refusal goes, still "On the march".
  await move(other[0], other[1]);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByTestId('formation-status')).toHaveText('On the march');
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/orderNews1938-next.png' });
});

// ROADMAP R24c (critic run 36, R36-N1): a refusal stayed under a re-click of the march's own goal,
// the order taken but the goal unchanged. Switzerland's division marching, refused London, then
// clicked on its own goal again: the refusal goes.
test('a refusal goes with an order taken to the same place', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 0, SWI, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), SWI);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate((n) => window.__warsim!.view!.formationsOf(n)[0]!, SWI);
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: SWI, d: ENG });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });
  const move = (x: number, y: number): Promise<void> =>
    page.evaluate(({ div, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: div, x, y, nation: n }), { div, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, n: SWI });

  const zurich = cellOf(8.54, 47.37, W, H);
  const geneva = cellOf(6.14, 46.2, W, H);
  const at = (await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div))!;
  const far = Math.hypot(at[0] - zurich[0], at[1] - zurich[1]) > Math.hypot(at[0] - geneva[0], at[1] - geneva[1]) ? zurich : geneva;
  await move(far[0], far[1]);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-status')).toHaveText('On the march', { timeout: 10_000 });
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  await move(lx, ly);
  await expect(page.getByTestId('formation-notice')).toContainText('no port', { timeout: 10_000 });

  // Clicked on its own goal again: taken, and the refusal goes.
  await move(far[0], far[1]);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByTestId('formation-status')).toHaveText('On the march');
});
