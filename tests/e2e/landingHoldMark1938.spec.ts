import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R53e (critic run 54's objection to ADR-873): on 21105, Italy's two nearest Rome ordered to Valletta one by
// one as the critic's clicks, the row read "at sea: under attack by United Kingdom, held up" while the British fleet
// shelled the transports from 14–19 cells off, and nothing on the map joined them (its shot at h60, 1500 m/px on the
// first division). Now a red ring on the transports and a dashed line in the foe's colour from the fleet to them.

const id = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;

test("a held landing's transports are joined to the fleet that holds them, at the critic's camera", async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await open1938(page, 21105);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R53e') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [ITA, ENG] = [id('ITA'), id('ENG')];
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ITA, d: ENG });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), ITA);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10_000 });
  const sel = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(n).filter((f) => !v.formationAfloat(f)).map((f) => [f, Math.hypot(v.formationPos(f)![0] - x, v.formationPos(f)![1] - y)] as [number, number]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
  }, { n: ITA, x: 1095.5, y: 344.5 });
  for (const f of sel) await page.evaluate(({ f, n }) => window.__warsim!.hud.command({ kind: 'moveFormation', id: f, x: 1106.5, y: 383.5, nation: n }), { f, n: ITA });
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  // To the critic's hour (h60 after the clicks), the landing held by then.
  const start = await page.evaluate(() => window.__warsim!.view!.lastTick);
  await page.evaluate(() => window.__warsim!.sim.step(60));
  await page.waitForFunction((t) => window.__warsim!.view!.lastTick >= t + 60, start, { timeout: 120_000 });
  await expect(page.getByTestId('landing-status').first()).toHaveText('at sea: under attack by United Kingdom, held up');
  const p = await page.evaluate((f) => window.__warsim!.view!.formationPos(f), sel[0]!);
  expect(p, 'the first division').not.toBeNull();
  for (const m of [1500, 250]) {
    await lookAt(page, p![0], p![1], m);
    const marks = await page.evaluate(() => {
      window.__warsim!.view!.draw();
      return window.__warsim!.view!.holdMarks;
    });
    expect(marks.length, `${m} m/px: a hold mark`).toBe(1);
    const k = marks[0]!;
    expect(k.foe, 'the foe drawn is the one named').toBe(ENG);
    expect(k.gx >= 0 && k.gx <= 1600 && k.gy >= 0 && k.gy <= 900, `${m} m/px: the transports' ring on the screen`).toBe(true);
    // At 1500 m/px both ends on the screen: the fleet is 14–19 cells off.
    if (m === 1500) expect(k.fx >= 0 && k.fx <= 1600 && k.fy >= 0 && k.fy <= 900, 'the fleet on the screen').toBe(true);
    await page.screenshot({ path: path.join(out, `landingHoldMark-21105-h60-${m}m.png`) });
  }
});
