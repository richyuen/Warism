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

// R39-N4: at a unit's zoom (30 m/px) the landing the cursor's cell is for lies off the screen: an arrow at the
// screen's edge points the way to it, in the screen, towards its land.
for (const [dx, dy] of [[0, 2], [-3, 3], [2, -2]] as const) {
  test(`desk, 30 m/px, the cursor ${dx},${dy} cells from Shanghai: the mark, or an arrow the way to it`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    await japanOne(page);
    const [x, y] = [SHANGHAI[0] + dx, SHANGHAI[1] + dy];
    await page.evaluate(([x, y]) => {
      const v = window.__warsim!.view!;
      v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 30 });
    }, [x, y] as const);
    await page.waitForTimeout(500);
    const box = (await page.locator('canvas').first().boundingBox())!;
    const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(cx + 3, cy + 3);
    await page.mouse.move(cx, cy);
    await expect.poll(() => marks(page), { timeout: 5000 }).toBeGreaterThan(0);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const v = window.__warsim!.view!;
      const k = v.landingMarks[0]!;
      const w = v.geo.w;
      const c = v.controller.cam;
      const land = [(k.land % w) + 0.5, Math.floor(k.land / w) + 0.5];
      return { edge: v.landingEdges[0] ?? null, land: [(land[0]! - c.cx) * c.scale + innerWidth / 2, (land[1]! - c.cy) * c.scale + innerHeight / 2] };
    });
    process.stderr.write(`R34k2 ${dx},${dy}: land at ${r.land.map((v) => v.toFixed(0))}, edge ${JSON.stringify(r.edge)}\n`);
    const onScreen = r.land[0]! >= 0 && r.land[0]! <= 1600 && r.land[1]! >= 0 && r.land[1]! <= 900;
    if (onScreen) expect(r.edge, 'on the screen: no arrow').toBeNull();
    else {
      expect(r.edge, 'off the screen: an arrow').not.toBeNull();
      expect(r.edge!.x).toBeGreaterThanOrEqual(0);
      expect(r.edge!.x).toBeLessThanOrEqual(1600);
      expect(r.edge!.y).toBeGreaterThanOrEqual(0);
      expect(r.edge!.y).toBeLessThanOrEqual(900);
      // Towards the land: the arrow is on the line from the middle to it.
      const [ax, ay] = [r.edge!.x - 800, r.edge!.y - 450];
      const [bx, by] = [r.land[0]! - 800, r.land[1]! - 450];
      expect((ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))).toBeGreaterThan(0.99);
    }
    await page.screenshot({ path: info.outputPath(`r34k2-${dx}-${dy}.png`) });
  });
}
