import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R34k (critic run 39, R39-N2, R39-N3, R39-N4): the landing's mark. Seed 3517, Japan played, its division
// nearest Tokyo selected, the cursor on Shanghai: by sea, the mark. Escape empties the selection: the mark and the
// tooltip go at once, the cursor still (R39-N3: they stayed until the mouse moved).

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

const marks = (page: Page): Promise<number> => page.evaluate(() => window.__warsim!.view!.landingMarks.length);

/** Japan played, its division nearest Tokyo selected by the player's own selection. */
export async function japanOne(page: Page): Promise<number> {
  await page.goto('/?scenario=1938&paused=1&seed=3517');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, JAP, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAP);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const id = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(n).filter((f) => !v.formationAfloat(f)).map((f) => [f, Math.hypot(v.formationPos(f)![0] - x, v.formationPos(f)![1] - y)] as const).sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  await page.evaluate((id) => {
    const p = window.__warsim!.player!;
    p.clearSelection();
    p.boxSelect([id], false);
  }, id);
  await expect.poll(() => page.evaluate(() => window.__warsim!.player!.selectedCount.value)).toBe(1);
  return id;
}

test('desk: Escape empties the selection, and the mark and the tooltip go at once', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await japanOne(page);
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), SHANGHAI);
  await page.waitForTimeout(500);
  const box = (await page.locator('canvas').first().boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
  await expect(page.getByTestId('tooltip-by-sea')).toBeVisible({ timeout: 5000 });
  await expect.poll(() => marks(page), { timeout: 5000 }).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__warsim!.player!.selectedCount.value)).toBe(0);
  await expect.poll(() => marks(page), { timeout: 2000 }).toBe(0);
  await expect(page.getByTestId('tooltip-by-sea')).toHaveCount(0);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'landing-mark-escape.png') });
});
