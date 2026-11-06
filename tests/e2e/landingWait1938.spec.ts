import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R22c AT, the page's part (the worker's is `landingWait1938.test.ts`; critic run 34,
// R34-N1): Japan's four divisions nearest Tokyo sent to Shanghai by one click; the first boards at
// Tokyo and waits for the rest. Its panel says how many of the landing are aboard and how many
// days off the last is, at a desk's size and a phone's.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

async function waiting(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.goto('/?scenario=1938&paused=1&seed=1');
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
  for (const id of four) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: SHANGHAI[0], y: SHANGHAI[1], n: JAP });
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, four[0]!);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(four[0]!), { timeout: 10_000 });
  for (let h = 0; h < 48; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    if ((await page.getByTestId('formation-wait').count()) > 0) break;
  }
}

for (const [label, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`at Tokyo, the panel says how many and how far the last (${label})`, async ({ page }) => {
    test.setTimeout(300_000);
    await waiting(page, width, height);
    await expect(page.getByTestId('formation-status')).toHaveAttribute('data-voyage', 'gathering', { timeout: 10_000 });
    await expect(page.getByTestId('formation-wait')).toHaveText(/^1 of 4 at the port; the last \d+ days from it$/, { timeout: 10_000 });
    // ROADMAP R22e (R34-N2): a long value wraps in its own column; its label ends before it begins.
    for (const id of ['formation-status', 'formation-wait']) {
      const gap = await page.getByTestId(id).evaluate((el) => {
        const row = el.closest('.panel-row')!;
        // The leftmost of the value's lines, as drawn.
        const range = document.createRange();
        range.selectNodeContents(row.lastElementChild!);
        let left = row.lastElementChild!.getBoundingClientRect().left;
        for (const r of range.getClientRects()) left = Math.min(left, r.left);
        return left - row.firstElementChild!.getBoundingClientRect().right;
      });
      expect(gap, `${id}: label and value apart`).toBeGreaterThanOrEqual(4);
    }
    await page.getByTestId('formation-panel').screenshot({ path: `test-results/landingWait1938-${label}.png` });
  });
}
