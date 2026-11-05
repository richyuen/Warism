import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R26a AT (critic run 38, R38-B1): Japan's divisions nearest Tokyo sent to Shanghai (seed 3517, the critic's); at
// hour 26 the one aboard (or all of them) clicked again two cells south. The sim keeps it as the
// same landing (R25a), and they land together; the worker judged "came ashore away from its target"
// against the new click, four cells from the landing's land, and told it. Now no such news.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

for (const [n, all] of [[2, false], [4, true]] as const) {
  test(`${n} to Shanghai, ${all ? 'all' : 'the one aboard'} clicked again two cells south: they land together, and none is told it came ashore away`, async ({ page }) => {
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
    const ids = await page.evaluate(({ n, k, x, y }) => {
      const v = window.__warsim!.view!;
      return v
        .formationsOf(n)
        .filter((id) => !v.formationAfloat(id))
        .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
        .sort((a, b) => a[1] - b[1])
        .slice(0, k)
        .map((d) => d[0]);
    }, { n: JAP, k: n, x: TOKYO[0], y: TOKYO[1] });
    for (const id of ids) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SHANGHAI[0], y: SHANGHAI[1], n: JAP });
    await page.evaluate((id) => {
      window.__warsim!.view!.selectedFormations.add(id);
      window.__warsim!.hud.selectFormation(id);
    }, ids[0]!);
    await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(ids[0]!), { timeout: 10_000 });
    const status = page.getByTestId('formation-status');
    for (let h = 0; h < 48; h++) {
      await page.evaluate(() => window.__warsim!.sim.step(1));
      if ((await status.getAttribute('data-voyage')) === 'aboard') break;
    }
    await expect(status).toHaveAttribute('data-voyage', 'aboard', { timeout: 10_000 });
    const again = all ? ids : [ids[0]!];
    for (const id of again) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SHANGHAI[0], y: SHANGHAI[1] + 2, n: JAP });
    const ashore = (): Promise<number> =>
      page.evaluate(({ ids, x, y }) => {
        const v = window.__warsim!.view!;
        return ids.filter((id) => !v.formationAfloat(id) && Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y) < 8).length;
      }, { ids, x: SHANGHAI[0], y: SHANGHAI[1] });
    for (let d = 0; d < 70 && (await ashore()) < n; d++) await page.evaluate(() => window.__warsim!.sim.step(24));
    // Near Shanghai may still be the transports off its coast: two days more, ashore for sure.
    await page.evaluate(() => window.__warsim!.sim.step(48));
    expect(await ashore(), 'all ashore at Shanghai').toBe(n);
    await expect(page.locator('[data-testid="order-news"][data-order="landedAway"]')).toHaveCount(0);
    await expect(page.getByTestId('formation-notice')).toHaveCount(0);
  });
}
