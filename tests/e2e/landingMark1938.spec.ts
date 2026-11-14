import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { tokyoReach } from './tokyoReach';

// ROADMAP R27b AT (ADR-827): the landing an order over the sea is for is marked while it is chosen.
// Japan (seed 3517, the critic's case), its two divisions nearest Tokyo, the first selected. The
// cursor two cells south of Shanghai before any order: by sea, the mark at that click's own landing,
// a new one. The cursor kept still while the two are sent to Shanghai and the first boards: the
// mark is asked again and turns to the landing it has (green, "the landing they already have"), the
// one Shanghai's click marks; Fuzhou's is a new one. ROADMAP R28b (critic run 39, R39-N1): the one
// aboard and the third nearest, never ordered, selected, two cells south: two landings marked, its own
// kept and the click's new, and the tooltip says they will not land together. ROADMAP R33c (R43-N4): with the
// landing at sea, the one selected still has its marks; R36b: over the sea, the tooltip says a click there is refused.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

type Mark = { water: number; land: number; same: boolean } | null;
const mark = (page: Page): Promise<Mark> => page.evaluate(() => window.__warsim!.view!.landingMark);

/** The mouse to the middle of the map with the camera on (`x`, `y`): the cursor over that cell. */
async function hover(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), [x, y] as const);
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
  const box = (await page.locator('canvas').first().boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
}

test('the landing is marked while chosen; under a still cursor it turns to the landing the division has', async ({ page }) => {
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
  // ROADMAP R43a: three more within Tokyo's reach, so that the nearest Tokyo are one landing there (`tokyoReach`).
  await tokyoReach(page, [8]);
  const three = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v
      .formationsOf(n)
      .filter((id) => !v.formationAfloat(id))
      .map((id) => [id, Math.hypot(v.formationPos(id)![0] - x, v.formationPos(id)![1] - y)] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map((d) => d[0]);
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  const two = three.slice(0, 2).sort((a, b) => a - b);
  await page.evaluate((id) => {
    window.__warsim!.view!.selectedFormations.add(id);
    window.__warsim!.hud.selectFormation(id);
  }, two[0]!);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(two[0]!), { timeout: 10_000 });

  // Shanghai itself: the landing its click is for.
  await hover(page, SHANGHAI[0], SHANGHAI[1]);
  await expect(page.getByTestId('tooltip-by-sea')).toBeVisible({ timeout: 5000 });
  await expect.poll(() => mark(page), { timeout: 5000 }).not.toBeNull();
  const shanghai = (await mark(page))!;
  expect(shanghai.same).toBe(false);

  // Two cells south, before any order: another landing, a new one.
  await hover(page, SHANGHAI[0], SHANGHAI[1] + 2);
  await expect.poll(async () => (await mark(page))?.land, { timeout: 5000 }).not.toBe(shanghai.land);
  const south = (await mark(page))!;
  expect(south.same).toBe(false);
  await expect(page.getByTestId('tooltip-by-sea')).not.toHaveAttribute('data-same', '1');
  await page.screenshot({ path: 'test-results/landingMark1938-new.png' });

  // The cursor still: the two to Shanghai, the first boards; the mark turns to its own landing.
  for (const id of two) await page.evaluate(({ id, x, y, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SHANGHAI[0], y: SHANGHAI[1], n: JAP });
  const status = page.getByTestId('formation-status');
  for (let h = 0; h < 48; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    if ((await status.getAttribute('data-voyage')) === 'gathering') break;
  }
  await expect(status).toHaveAttribute('data-voyage', 'gathering', { timeout: 10_000 });
  await expect.poll(async () => (await mark(page))?.same, { timeout: 10_000 }).toBe(true);
  expect(await mark(page)).toEqual({ ...shanghai, same: true });
  await expect(page.getByTestId('tooltip-by-sea')).toHaveAttribute('data-same', '1');
  await expect(page.getByTestId('tooltip-by-sea')).toContainText('already have');
  await page.screenshot({ path: 'test-results/landingMark1938-same.png' });

  // Fuzhou: another landing, marked as new.
  await hover(page, FUZHOU[0], FUZHOU[1]);
  await expect.poll(async () => (await mark(page))?.same, { timeout: 5000 }).toBe(false);
  await expect(page.getByTestId('tooltip-by-sea')).not.toHaveAttribute('data-same', '1');

  // The one aboard and a fresh division, two cells south: two landings, each marked (R28b).
  await page.evaluate((id) => window.__warsim!.view!.selectedFormations.add(id), three[2]!);
  await hover(page, SHANGHAI[0], SHANGHAI[1] + 2);
  await expect(page.getByTestId('tooltip-by-sea')).toHaveAttribute('data-landings', '2', { timeout: 10_000 });
  await expect(page.getByTestId('tooltip-by-sea')).toContainText('2 landings');
  const marks = await page.evaluate(() => window.__warsim!.view!.landingMarks);
  expect(marks.map((k) => k.same).sort()).toEqual([false, true]);
  expect(marks.find((k) => k.same)).toEqual({ ...shanghai, same: true });
  expect(marks.find((k) => !k.same)!.land).toBe(south.land);
  await page.screenshot({ path: 'test-results/landingMark1938-two.png' });

  // ROADMAP R33c (critic run 43, R43-N4: hovering with a division at sea selected, no mark): the one at sea, its
  // landing sailed, asked from its landing's port: Shanghai its own landing, Fuzhou a new one.
  await page.evaluate((id) => window.__warsim!.view!.selectedFormations.delete(id), three[2]!);
  for (let d = 0; d < 60 && (await status.getAttribute('data-voyage')) !== 'atSea'; d++) {
    await page.evaluate(() => window.__warsim!.sim.step(24));
    await page.waitForTimeout(50);
  }
  await expect(status).toHaveAttribute('data-voyage', 'atSea', { timeout: 10_000 });
  await hover(page, FUZHOU[0], FUZHOU[1]);
  await expect.poll(async () => (await page.evaluate(() => window.__warsim!.view!.landingMarks)).length, { timeout: 10_000 }).toBe(1);
  await expect.poll(async () => (await mark(page))?.same, { timeout: 5000 }).toBe(false);
  await page.screenshot({ path: 'test-results/landingMark1938-atSea.png' });
  await hover(page, SHANGHAI[0], SHANGHAI[1]);
  await expect.poll(async () => (await mark(page))?.same, { timeout: 10_000 }).toBe(true);
  // ROADMAP R36b (critic run 44, R44-B2: over the sea a cell off the beach, no tooltip, no mark, and the click
  // a silent cancel): the tooltip says why a click there is refused; no mark.
  await hover(page, 1718.5, 413.5);
  await expect(page.getByTestId('tooltip-sea-open')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('tooltip-sea-open')).toContainText('keeps its course');
  expect(await page.evaluate(() => window.__warsim!.view!.landingMarks)).toEqual([]);
  await page.screenshot({ path: 'test-results/landingMark1938-seaOpen.png' });
});
