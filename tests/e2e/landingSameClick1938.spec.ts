import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { tokyoReach } from './tokyoReach';

// ROADMAP R34j (critic run 36, R36-N3: a re-click of the same landing was taken in silence, no news, the panel
// unchanged): Japan's four divisions nearest Tokyo sent to Shanghai, then clicked to Shanghai again while they
// gather: told "already bound for this landing; the order changes nothing". The next order to another place
// takes the notice away, and is told nothing of the kind.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v)) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v)) as [number, number];

test('the same landing clicked again: told it changes nothing', async ({ page }, info) => {
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
  await tokyoReach(page);
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
  await page.evaluate((ids) => {
    const v = window.__warsim!.view!;
    v.selectedFormations.clear();
    for (const id of ids) v.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(ids[0]!);
  }, four);
  const click = (x: number, y: number): Promise<boolean> => page.evaluate(([x, y]) => window.__warsim!.player!.click(x, y, -9999, -9999, false), [x, y] as const);
  const same = (): Promise<number> => page.evaluate(() => window.__warsim!.hud.orderNews.value.filter((n) => n.kind === 'sameLanding').length);
  // The first click: a new landing, nothing said of the kind.
  await click(...SHANGHAI);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForTimeout(500);
  expect(await same(), 'the first click is no re-click').toBe(0);
  const status = page.getByTestId('formation-status');
  await expect(status).toHaveAttribute('data-voyage', /gathering|toPort|waiting/, { timeout: 10_000 });
  // Again: told.
  await click(...SHANGHAI);
  await expect.poll(same, { timeout: 5000 }).toBe(1);
  await expect(page.getByTestId('formation-notice')).toContainText('already bound for this landing', { timeout: 5000 });
  await expect(page.getByTestId('formation-notice')).toContainText('3 more');
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'landing-same-click.png') });
  // Another place: the notice goes, and no new one.
  await click(...FUZHOU);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForTimeout(500);
  expect(await same(), 'another place: no new notice').toBe(1);
  await expect(page.getByTestId('formation-notice').filter({ hasText: 'already bound' })).toHaveCount(0);
});
