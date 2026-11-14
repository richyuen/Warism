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
const FUZHOU = cellOf(119.3, 26.08, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

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
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
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

// R39-N2: a touch screen has no hover, and a tap over the sea ordered at once, the landing never shown. Now the first
// tap on a cell shows the mark and the tooltip and orders nothing; a second on it orders; a tap whose order does
// not go by sea orders at once (ADR-849). Fuzhou: no division of Japan's near it (Shanghai has some, and a tap
// there picks one).
test.describe('a touch screen', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  test('a tap over the sea shows the landing; a second orders; a march by land orders at once', async ({ page }, info) => {
    test.setTimeout(180_000);
    const id = await japanOne(page);
    const ordered = (): Promise<boolean> => page.evaluate((id) => window.__warsim!.hud.orderedAt.value.has(id), id);
    // Panels closed: the map's middle free.
    await page.evaluate(() => {
      window.__warsim!.hud.selectFormation(0);
      window.__warsim!.view!.select(0);
    });
    await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), FUZHOU);
    await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
    const box = (await page.locator('canvas').first().boundingBox())!;
    const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
    expect(await page.evaluate(() => window.__warsim!.player!.selectedCount.value)).toBe(1);
    await page.touchscreen.tap(cx, cy);
    await expect.poll(() => marks(page), { timeout: 5000 }).toBeGreaterThan(0);
    await expect(page.getByTestId('tooltip-by-sea')).toBeVisible();
    expect(await ordered(), 'the first tap orders nothing').toBe(false);
    await expect(page.getByTestId('tooltip-tap-again')).toBeVisible();
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.screenshot({ path: path.join(out, 'landing-mark-touch-first-tap.png') });
    await page.touchscreen.tap(cx, cy);
    await expect.poll(ordered, { timeout: 5000 }).toBe(true);
    await expect(page.getByTestId('tooltip-tap-again')).toHaveCount(0);
    // A march by land: at once.
    await page.evaluate((id) => {
      const p = window.__warsim!.player!;
      p.clearSelection();
      p.boxSelect([id], false);
      window.__warsim!.hud.selectFormation(0);
      window.__warsim!.hud.orderedAt.value = new Map();
    }, id);
    // The map's tap at a land cell near Tokyo, by the page's own handler (a tap's point off the canvas: no formation
    // picked there, whatever is drawn).
    const [tx, ty] = cellOf(138.9, 36.4, W, H).map(Math.floor) as [number, number];
    expect(await page.evaluate(([x, y]) => window.__warsim!.view!.onPick!(x, y, -9999, -9999, false, true), [tx, ty] as const)).toBe(true);
    await expect.poll(ordered, { timeout: 5000 }).toBe(true);
  });
});

// ROADMAP R34l (critic run 40, R40-N2): all of Japan's land divisions selected, the cursor on Shanghai: most of them
// stand on the mainland and march; the tooltip says how many go by sea of how many, and that the rest march.
test("desk: all of Japan's divisions selected over Shanghai: the tooltip says how many go by sea", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await japanOne(page);
  const n = await page.evaluate((nat) => {
    const v = window.__warsim!.view!;
    const p = window.__warsim!.player!;
    const ids = v.formationsOf(nat).filter((f) => !v.formationAfloat(f));
    p.clearSelection();
    p.boxSelect(ids, false);
    return ids.length;
  }, JAP);
  await page.evaluate(([x, y]) => window.__warsim!.view!.showPlace(x, y), SHANGHAI);
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 15_000 });
  const box = (await page.locator('canvas').first().boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 3, cy + 3);
  await page.mouse.move(cx, cy);
  const part = page.getByTestId('tooltip-by-sea-part');
  await expect(part).toBeVisible({ timeout: 5000 });
  const [sea, all] = [Number(await part.getAttribute('data-sea')), Number(await part.getAttribute('data-all'))];
  process.stderr.write(`R34l: ${n} selected; ${sea} of ${all} by sea\n`);
  expect(all).toBeGreaterThan(sea);
  expect(sea).toBeGreaterThan(0);
  await expect(part).toContainText(`${sea} of the ${all} selected go by sea; the rest march`);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'landing-part-by-sea.png') });
});
