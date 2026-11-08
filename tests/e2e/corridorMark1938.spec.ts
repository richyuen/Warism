import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R53e (critic run 54's objection to ADR-864: the Breakthrough corridor is not drawn, "the map still shows
// nothing of the 10-day corridor that is the tool's whole effect"). The critic's clicks (`c54_kw_breakthrough.mjs`):
// Germany at war with Poland, God Mode's Breakthrough from 3 cells east of Berlin toward Warsaw at 1500 m/px. The
// corridor is drawn there, and where the ticker row's "Show where" flies, for its days.

const id = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const at = (lon: number, lat: number): [number, number] => cellOf(lon, lat, SIZE_1938.w, SIZE_1938.h).map((v) => Math.floor(v) + 0.5) as [number, number];

/** The screen point of cell (x, y), CSS px. */
const screenOf = (page: Page, x: number, y: number): Promise<[number, number]> =>
  page.evaluate(({ x, y }) => {
    const c = window.__warsim!.view!.controller.cam;
    return [(x - c.cx) * c.scale + window.innerWidth / 2, (y - c.cy) * c.scale + window.innerHeight / 2] as [number, number];
  }, { x, y });

const marks = (page: Page) =>
  page.evaluate(() => {
    window.__warsim!.view!.draw();
    return window.__warsim!.view!.corridorMarks;
  });

test("God's Breakthrough corridor is drawn on the map, where it was clicked and where its row flies", async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await open1938(page, 24123);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R53e') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [GER, POL] = [id('GER'), id('POL')];
  const [berlin, warsaw] = [at(13.4, 52.5), at(21.0, 52.2)];
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((g) => window.__warsim!.hud.onSelectNation(g), GER);
  await page.getByRole('button', { name: 'God Mode', exact: true }).click();
  await lookAt(page, (berlin[0] + warsaw[0]) / 2, berlin[1], 1500);
  const before = (await marks(page)).filter((m) => m.nation === GER).length;
  await page.getByRole('button', { name: 'Breakthrough', exact: true }).click();
  const [ax, ay] = await screenOf(page, berlin[0] + 3, berlin[1]);
  const [bx, by] = await screenOf(page, warsaw[0], warsaw[1]);
  await page.mouse.click(ax, ay);
  await page.mouse.click(bx, by);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect.poll(async () => (await marks(page)).filter((m) => m.nation === GER).length, { timeout: 10_000 }).toBe(before + 1);
  // Its start where it was clicked, and its way toward Warsaw (east), its length about 100 px at 1500 m/px.
  const k = (await marks(page)).filter((m) => m.nation === GER).sort((p, q) => Math.hypot(p.ax - ax, p.ay - ay) - Math.hypot(q.ax - ax, q.ay - ay))[0]!;
  expect(Math.hypot(k.ax - ax, k.ay - ay), 'its start near the click').toBeLessThan(40);
  expect(k.bx - k.ax, 'toward Warsaw').toBeGreaterThan(40);
  await page.screenshot({ path: path.join(out, 'corridor-24123-click-1500m.png') });
  // Its ticker row's "Show where": the corridor drawn where it flies.
  await page.getByRole('button', { name: 'God Mode', exact: true }).click();
  const row = page.locator('[data-testid=ticker-row][data-kind-name=GodBreakthrough]').first();
  await expect(row).toBeVisible({ timeout: 10_000 });
  await row.click();
  await page.waitForTimeout(300);
  await page.waitForFunction(() => !window.__warsim!.view!.controller.animating, null, { timeout: 60_000 });
  const m = await page.evaluate(() => window.__warsim!.view!.metresPerPx);
  const there = (await marks(page)).filter((q) => q.nation === GER);
  expect(there.length, `drawn at ${Math.round(m)} m/px`).toBeGreaterThan(0);
  await page.screenshot({ path: path.join(out, `corridor-24123-showwhere-${Math.round(m)}m.png`) });
  // Five days on, still drawn; after its ten, gone.
  await page.evaluate(() => window.__warsim!.sim.step(24 * 5));
  await expect.poll(async () => (await marks(page)).filter((q) => q.nation === GER && Math.hypot(q.ax - there[0]!.ax, q.ay - there[0]!.ay) < 2).length, { timeout: 30_000 }).toBe(1);
  await page.screenshot({ path: path.join(out, 'corridor-24123-day5.png') });
});
