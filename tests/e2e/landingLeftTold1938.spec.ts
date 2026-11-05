import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R25b AT, the page's part (the worker's is `landingLeftTold1938.test.ts`; critic run 37,
// R37-B1): Japan's two divisions nearest Tokyo sent to Shanghai; the first boards at Tokyo and waits.
// Sent to Fuzhou while other transports have room, it is taken and put on them: a row and its
// panel's notice say it leaves its landing. Before, nothing: its panel named a port far off.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

test('the one aboard sent to another landing, other transports free: a row and a notice say it leaves its landing', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, JAP, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAP, d: CHI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAP);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const two = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map((d) => d[0]);
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  for (const id of two) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: SHANGHAI[0], y: SHANGHAI[1], n: JAP });
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, two[0]!);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(two[0]!), { timeout: 10_000 });
  const status = page.getByTestId('formation-status');
  for (let h = 0; h < 48; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    if ((await status.getAttribute('data-voyage')) === 'aboard') break;
  }
  await expect(status).toHaveAttribute('data-voyage', 'aboard', { timeout: 10_000 });

  await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id: two[0]!, x: FUZHOU[0], y: FUZHOU[1], n: JAP });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('which stay with the landing it had', { timeout: 10_000 });
  await expect(page.locator('[data-testid="order-news"][data-order="leftLanding"]')).toHaveCount(1);
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/landingLeftTold1938.png' });
});
