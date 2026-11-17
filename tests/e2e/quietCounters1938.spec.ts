import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { QUIET_FROM_M, QUIET_GONE_M } from '../../src/render/units/counters';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R108 (ADR-1099, the user's choice): at the world's zoom the counters of nations at peace are not drawn; they
// fade out between QUIET_FROM_M and QUIET_GONE_M metres a pixel. The nation looked at keeps its own. At the start of
// 1938 (Spain's civil war and Japan's on China the wars going): over Europe at 20,000 m/px the counters were a pile
// over the nations' names.

const { w: W, h: H } = SIZE_1938;
const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;

interface Counters { loud: number[]; quiet: { nation: number; alpha: number }[]; atWar: number[] }

/** The counters of the frame: the nations of the layer drawn whole, those of the fading layer with their opacity, and the nations at war. */
function counters(page: Page): Promise<Counters> {
  return page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.draw(performance.now() + 1e6);
    const wars = window.__warsim!.hud.stats.value!.wars;
    return {
      loud: v.counters.drawn.filter((d) => d.alpha > 0.5 && d.hero === undefined).map((d) => d.nation),
      quiet: v.quietCounters.drawn.map((d) => ({ nation: d.nation, alpha: d.alpha })),
      atWar: [...new Set(wars.flatMap((w) => [...w.attackers, ...w.defenders]))],
    };
  });
}

test('at the world\'s zoom the counters are of the nations at war and the one looked at; nearer, of every nation', async ({ page }, info) => {
  test.setTimeout(240_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R108') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [cx, cy] = cellOf(12, 49, W, H);
  // As before R108, for the shot and the count.
  await page.evaluate(() => (window.__warsim!.view!.quietCountersKept = true));
  await lookAt(page, cx, cy, 20_000);
  await page.waitForTimeout(800);
  const before = await counters(page);
  await page.screenshot({ path: path.join(out, 'world-before.png') });
  await page.evaluate(() => (window.__warsim!.view!.quietCountersKept = false));
  await lookAt(page, cx, cy, 20_000);
  await page.waitForTimeout(800);
  const far = await counters(page);
  await page.screenshot({ path: path.join(out, 'world-after.png') });
  process.stderr.write(`20,000 m/px: ${before.loud.length} counters before, ${far.loud.length} now (${far.quiet.length} of nations at peace, the most opacity ${Math.max(0, ...far.quiet.map((q) => q.alpha)).toFixed(2)}); ${far.atWar.length} nations at war\n`);
  expect(before.loud.length, 'counters in view as before').toBeGreaterThan(10);
  expect(far.loud.length, 'fewer of them').toBeLessThan(before.loud.length / 2);
  expect(far.loud.length, 'those of the wars going').toBeGreaterThan(0);
  for (const n of far.loud) expect(far.atWar, `nation ${n} has a counter: it is at war`).toContain(n);
  for (const q of far.quiet) expect(q.alpha, `nation ${q.nation} at peace`).toBeLessThanOrEqual(0.01);
  // The nation looked at keeps its own.
  await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
  await page.waitForTimeout(600);
  const looked = await counters(page);
  expect(looked.loud, "Germany's counters with Germany looked at").toContain(GER);
  await page.screenshot({ path: path.join(out, 'world-germany.png') });
  await page.evaluate(() => window.__warsim!.view!.select(0));
  // Between the two zooms they fade; nearer than the first they are whole and one layer with the others.
  const mid = Math.sqrt(QUIET_FROM_M * QUIET_GONE_M);
  await lookAt(page, cx, cy, mid);
  await page.waitForTimeout(800);
  const fading = await counters(page);
  expect(fading.quiet.length, 'fading counters half-way').toBeGreaterThan(3);
  for (const q of fading.quiet) {
    expect(q.alpha).toBeGreaterThan(0.2);
    expect(q.alpha).toBeLessThan(0.8);
  }
  await lookAt(page, cx, cy, QUIET_FROM_M - 500);
  await page.waitForTimeout(800);
  const near = await counters(page);
  expect(near.quiet, 'no fading layer nearer than QUIET_FROM_M').toEqual([]);
  expect(near.loud, "Germany's counters at peace, nearer").toContain(GER);
  expect(near.loud.some((n) => !near.atWar.includes(n))).toBe(true);
});
