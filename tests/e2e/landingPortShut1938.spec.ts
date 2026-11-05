import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import type { OrderNews } from '../../src/shared/protocol';
import { RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R22a AT (critic run 34, R34-B1; the worker's part is `serverPortShutNews1938.test.ts`):
// the critic's case in the page. 1938 seed 3517, Britain played at war with France; the three
// divisions nearest London sent to Calais by one click. French bombers shut the port they march
// to, and the sim refuses them there (`PortShut`): a row below the ticker and the refused
// division's panel say the port is bombed shut. Before the fix, nothing reached the page.

const { w: W, h: H } = SIZE_1938;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const FRA = NATIONS_1938.findIndex((n) => n.tag === 'FRA') + 1;
const cell = (lon: number, lat: number): [number, number] => cellOf(lon, lat, W, H).map((v) => Math.floor(v)) as [number, number];
const LONDON = cell(-0.12, 51.5);
const CALAIS = cell(1.86, 50.95);

declare global {
  interface Window {
    __news?: OrderNews[];
  }
}

test('a division refused at the port it marched to, bombed shut, is told so', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=3517');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, ENG, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'forceWar', attacker: a, defender: d }), { a: ENG, d: FRA });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const ids = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map((d) => d[0]);
  }, { n: ENG, x: LONDON[0] + 0.5, y: LONDON[1] + 0.5 });
  await page.evaluate((ids) => {
    window.__news = [];
    window.__warsim!.sim.onOrderNews((n) => window.__news!.push(n));
    const v = window.__warsim!.view!;
    for (const id of ids) v.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(ids[0]!);
  }, ids);
  await page.evaluate(([x, y]) => window.__warsim!.player!.click(x + 0.5, y + 0.5, -9999, -9999, false), CALAIS);

  // Step until the sim refuses one of them at the port (the critic's run: hours 55, 63 and 87).
  let shut: OrderNews | undefined;
  for (let h = 0; h < 150 && shut === undefined; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    shut = await page.evaluate((r) => window.__news!.find((n) => n.kind === 'refused' && n.reason === r), RejectReason.PortShut);
  }
  expect(shut, 'a division refused at its port, bombed shut, is told').toBeDefined();
  expect(ids).toContain(shut!.id);
  await expect(page.locator('[data-testid="order-news"][data-order="refused"]').filter({ hasText: 'bombed shut' }).first()).toBeVisible({ timeout: 10_000 });

  // Its panel says it too.
  await page.evaluate((id) => {
    const v = window.__warsim!.view!;
    v.selectedFormations.clear();
    v.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, shut!.id);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(shut!.id), { timeout: 10_000 });
  await expect(page.getByTestId('formation-notice')).toContainText('bombed shut', { timeout: 10_000 });
  await page.screenshot({ path: 'test-results/landingPortShut1938.png' });
});
