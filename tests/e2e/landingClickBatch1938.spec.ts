import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R29a AT, the page's part (the worker's is `landingClickBatch1938.test.ts`; critic run 40,
// R40-B2): the map's click sent each selected division's order on its own, applied at once, so the
// four of a landing re-clicked three cells south-west were told, all but the last, "the rest keep the
// old landing". Now a click's orders go together. Seed 3517, Japan's four divisions nearest Tokyo sent
// to Shanghai by a click; two hours after the first boards, re-clicked three cells south-west: no
// row says one leaves the landing. Then one of them alone to Fuzhou: told, the rest keep it.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v)) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v)) as [number, number];

test("a landing re-clicked by one click: nobody told it leaves the landing; one sent away alone: told", async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=3517');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, JAP, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAP, d: CHI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAP);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const four = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 4)
      .map((d) => d[0]);
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  const select = (ids: number[]): Promise<void> =>
    page.evaluate((ids) => {
      const v = window.__warsim!.view!;
      v.selectedFormations.clear();
      for (const id of ids) v.selectedFormations.add(id);
      window.__warsim!.hud.selectFormation(ids[0]!);
    }, ids);
  const click = (x: number, y: number): Promise<boolean> => page.evaluate(([x, y]) => window.__warsim!.player!.click(x, y, -9999, -9999, false), [x, y] as const);

  await select(four);
  await click(...SHANGHAI);
  const status = page.getByTestId('formation-status');
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(four[0]!), { timeout: 10_000 });
  for (let h = 0; h < 48; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    if ((await status.getAttribute('data-voyage')) === 'aboard') break;
  }
  await expect(status).toHaveAttribute('data-voyage', 'aboard', { timeout: 10_000 });
  await page.evaluate(() => window.__warsim!.sim.step(2));

  // The four re-clicked three cells south-west by one click: they keep together, and nobody is told
  // the rest keep the old landing (red: three rows, one for each but the last).
  await select(four);
  await click(SHANGHAI[0] - 3, SHANGHAI[1] + 3);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForTimeout(500);
  await expect(page.locator('[data-testid="order-news"][data-order="leftLanding"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__warsim!.hud.orderNews.value.filter((n) => n.kind === 'leftLanding').length)).toBe(0);
  await page.screenshot({ path: 'test-results/landingClickBatch1938.png' });

  // One of them alone to Fuzhou: the rest keep the landing, and it is told so.
  await select([four[0]!]);
  await click(...FUZHOU);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('leaves the landing it had', { timeout: 10_000 });
  await expect(page.locator('[data-testid="order-news"][data-order="leftLanding"]')).toHaveCount(1);
});
