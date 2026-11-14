import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import type { Command } from '../../src/shared/commands';
import { VoyageState } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';

// ROADMAP R17c AT: a player's order over the sea is shown in each of its states. Britain played,
// its transport groups sent to Gibraltar; a division by London selected: over Belfast the tooltip
// says the order goes by sea; ordered there, its panel says it marches to a port, then waits there
// for the transports called back, then is at sea, then has landed; the map draws its sea leg while
// it is bound for the landing.

const { w: W, h: H } = SIZE_1938;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const TRANSPORT = TEMPLATES_1938.findIndex((t) => t.id === 'transport_group');
const cell = (lon: number, lat: number): [number, number] => cellOf(lon, lat, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const LONDON = cell(-0.12, 51.5);
const BELFAST = cell(-5.93, 54.6);
const GIBRALTAR = cell(-5.35, 36.13);

const command = (page: Page, cmd: Command): Promise<void> => page.evaluate((c) => window.__warsim!.hud.command(c), cmd);
const step = async (page: Page, n: number): Promise<void> => {
  await page.evaluate((k) => window.__warsim!.sim.step(k), n);
};
const status = (page: Page): Promise<string | null> => page.evaluate(() => document.querySelector<HTMLElement>('[data-testid=formation-status]')?.dataset['voyage'] ?? null);

test('an order over the sea: the tooltip says by sea; the panel says to port, waiting, at sea, landed; the map draws the sea leg', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=2207');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, ENG, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();

  // Britain's transports to Gibraltar, under way until they stand there.
  const transports = await page.evaluate(
    async ({ n, tpl }) => {
      const v = window.__warsim!.view!;
      const out: number[] = [];
      for (const id of v.formationsOf(n).filter((f) => v.formationAfloat(f))) if ((await window.__warsim!.sim.formation(id))?.template === tpl) out.push(id);
      return out;
    },
    { n: ENG, tpl: TRANSPORT },
  );
  expect(transports.length).toBeGreaterThan(0);
  for (const id of transports) await command(page, { kind: 'moveFormation', id, x: GIBRALTAR[0], y: GIBRALTAR[1], nation: ENG });
  const away = (): Promise<boolean> =>
    page.evaluate(({ ids, x, y }) => ids.every((id) => Math.hypot(window.__warsim!.view!.formationPos(id)![0] - x, window.__warsim!.view!.formationPos(id)![1] - y) < 12), { ids: transports, x: GIBRALTAR[0], y: GIBRALTAR[1] });
  for (let d = 0; d < 30 && !(await away()); d++) await step(page, 24);
  expect(await away(), 'the transports at Gibraltar').toBe(true);

  // A British land division nearest London, selected.
  const div = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: ENG, x: LONDON[0], y: LONDON[1] });
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div), { timeout: 10_000 });

  // Over Belfast, the tooltip says the order goes by sea.
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), BELFAST);
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
  const box = (await page.locator('canvas').first().boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2 + 3);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId('tooltip-by-sea')).toBeVisible({ timeout: 5000 });

  // Ordered there: each state in turn, and the sea leg drawn while it is bound for the landing.
  await command(page, { kind: 'moveFormation', id: div, x: BELFAST[0], y: BELFAST[1], nation: ENG });
  await step(page, 1);
  await expect.poll(() => status(page), { timeout: 10_000 }).toBe('toPort');
  await expect(page.getByTestId('formation-status')).toContainText('to board transports');
  expect(await page.evaluate((id) => window.__warsim!.view!.voyageState(id), div)).toBe(VoyageState.toPort);
  const seen: string[] = ['toPort'];
  for (let h = 0; h < 24 * 40 && seen[seen.length - 1] !== 'landed'; h += 3) {
    await step(page, 3);
    const now = await page.evaluate(async (id) => (await window.__warsim!.sim.formation(id))?.voyage?.state ?? null, div);
    if (now && now !== seen[seen.length - 1]) {
      seen.push(now);
      if (now === 'waiting' || now === 'atSea') expect(await page.evaluate((id) => window.__warsim!.view!.voyageState(id), div), `${now} drawn`).not.toBeNull();
    }
  }
  expect(seen).toEqual(['toPort', 'waiting', 'atSea', 'landed']);
  await expect.poll(() => status(page), { timeout: 10_000 }).toBe('landed');
  await expect(page.getByTestId('formation-status')).toContainText('Landed');
});
