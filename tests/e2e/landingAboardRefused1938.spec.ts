import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R23a AT, the page's part (the worker's is `landingAboardRefused1938.test.ts`; critic run 35,
// R35-B2): Japan's four divisions nearest Tokyo sent to Shanghai; the first boards at Tokyo and waits.
// Ordered onto the open sea, it is refused, and its panel says so over "Aboard at Tokyo": it was left
// ashore before, "Holding", out of its landing.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);
const OPEN_SEA = cellOf(150, 30, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

test('the division aboard, ordered onto the open sea: refused, and still aboard', async ({ page }) => {
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
  const status = page.getByTestId('formation-status');
  for (let h = 0; h < 48; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    if ((await status.getAttribute('data-voyage')) === 'gathering') break;
  }
  await expect(status).toHaveAttribute('data-voyage', 'gathering', { timeout: 10_000 });

  await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id: four[0]!, x: OPEN_SEA[0], y: OPEN_SEA[1], n: JAP });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('only sea there', { timeout: 10_000 });
  await expect(status).toHaveAttribute('data-voyage', 'gathering');
  // ROADMAP R33b (ADR-830): a landing's divisions wait at its port ashore and board at the sail hour.
  await expect(status).toContainText('At Tokyo');
  await expect(page.getByTestId('formation-wait')).toContainText('of 4 at the port');
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/landingAboardRefused1938.png' });

  // To another landing, Fuzhou: refused before (ROADMAP R24d, R36-N2: "its transports are loading for
  // another landing"); since R28a its transports, which carry no one else, go with it, and it is told it
  // leaves its landing; aboard, with no one else bound for them, they sail for Fuzhou at once (no escort
  // is asked here: with one, they would wait for it, "aboard"). (The refusal, where they carry another:
  // `landingAboardRefused1938.test.ts`.)
  await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id: four[0]!, x: FUZHOU[0], y: FUZHOU[1], n: JAP });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('formation-notice')).toContainText('leaves the landing it had', { timeout: 10_000 });
  // Since R33b it leaves its landing ashore and takes the transports that landing no longer needs, or others.
  // R37b: all of its new landing at the port reads `ready` (it was `gathering`, "waiting for the rest").
  await expect(status).toHaveAttribute('data-voyage', /^(atSea|gathering|ready|waiting|toPort)$/);
  await page.getByTestId('formation-panel').screenshot({ path: 'test-results/landingAboardRefused1938-fuzhou.png' });
});
