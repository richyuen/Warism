import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R42a (critic run 49, R49-N5): a click whose landing waits weeks for a marching division says so in days.
// Japan (seed 1, R22c's case): its four divisions nearest Tokyo sent to Shanghai, the cursor kept on Shanghai: the
// tooltip of the landing they have says it sails from its port in about N days; the panel of the one marching from
// the north says its days to the port. The panel at a desk's width and a phone's; the tooltip at a desk's.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

async function hover(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), [x, y] as const);
  await page.waitForTimeout(500);
  const box = (await page.locator('canvas').first().boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
}

for (const [name, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`${name}: the landing they have says when it sails; the one it waits for, its days`, async ({ page }) => {
    test.setTimeout(300_000);
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
        .map((d) => d[0])
        .sort((a, b) => a - b);
    }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
    for (const id of four) await page.evaluate((id) => window.__warsim!.view!.selectedFormations.add(id), id);
    for (const id of four) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: SHANGHAI[0], y: SHANGHAI[1], n: JAP });
    await page.evaluate(() => window.__warsim!.sim.step(2));
    // The hover's tooltip at a desk (a phone has no hover, and its panel takes the selection: carried R39-N2).
    let days = Infinity;
    if (name === 'desk') {
      await hover(page, SHANGHAI[0], SHANGHAI[1]);
      const tip = page.getByTestId('tooltip-by-sea');
      await expect(tip).toHaveAttribute('data-same', '1', { timeout: 10_000 });
      await expect.poll(async () => Number((await tip.getAttribute('data-days')) ?? 0), { timeout: 10_000 }).toBeGreaterThan(3);
      days = Number(await tip.getAttribute('data-days'));
      await expect(tip).toContainText(`in about ${days} days`);
      const r = (await tip.boundingBox())!;
      expect(r.x + r.width, 'within the screen').toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/landingClickWait1938-${name}-tip.png` });
    }

    // The one furthest off: its panel says its days to the port.
    for (const id of [...four].reverse()) {
      await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), id);
      await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(id), { timeout: 10_000 });
      const text = (await page.getByTestId('formation-status').textContent()) ?? '';
      if (/about \d+ days/.test(text)) {
        expect(text).toMatch(/^Marching to .+ to board transports, about \d+ days; its landing waits for it$/);
        expect(Number(/about (\d+) days/.exec(text)![1])).toBeGreaterThan(3);
        expect(Number(/about (\d+) days/.exec(text)![1])).toBeLessThanOrEqual(days);
        await page.screenshot({ path: `test-results/landingClickWait1938-${name}-panel.png` });
        return;
      }
    }
    throw new Error('no division with its days to the port');
  });
}
