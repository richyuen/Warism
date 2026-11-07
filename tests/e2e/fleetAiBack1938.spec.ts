import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R35d (critic run 43's idea: "a small mark on a fleet the player no longer commands would make R31d readable"):
// a landing's transports are the player's while they carry it, and the AI's again once it is ashore (R31d). Japan
// played (3517), its division nearest Tokyo sent to Shanghai: while at sea, the transports' panel has no line; once
// it has landed and they are released, it says the AI commands them again.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map(Math.floor) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

test("a landing's transports, released once it is ashore: their panel says the AI commands them again", async ({ page }, info) => {
  test.setTimeout(400_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=3517');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAP, d: CHI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAP);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  const div = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(n).filter((f) => !v.formationAfloat(f)).map((f) => [f, Math.hypot(v.formationPos(f)![0] - x, v.formationPos(f)![1] - y)] as const).sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  await page.evaluate(({ id, to }) => {
    const p = window.__warsim!.player!;
    p.clearSelection();
    p.boxSelect([id], false);
    p.click(to[0], to[1], -9999, -9999, false);
  }, { id: div, to: SHANGHAI });
  // The transports held for it while it sails; then until it is ashore and they are let go.
  const held = new Set<number>();
  let landed = false;
  for (let h = 0; h < 24 * 60 && !landed; h += 12) {
    await page.evaluate(() => window.__warsim!.sim.step(12));
    const r = await page.evaluate(async ({ n, id }) => {
      const i = await window.__warsim!.sim.inspect();
      const v = window.__warsim!.view!;
      const fleets = i.playerOrders.filter((f) => v.formationNation(f) === n && v.formationAfloat(f) && f !== id);
      return { fleets, ashore: !v.formationAfloat(id) && !i.playerOrders.includes(id) };
    }, { n: JAP, id: div });
    for (const f of r.fleets) held.add(f);
    if (held.size > 0 && r.fleets.length === 0) landed = r.ashore;
  }
  expect(held.size, 'transports held for the landing').toBeGreaterThan(0);
  expect(landed, 'ashore, the transports let go').toBe(true);
  await page.waitForTimeout(500);
  const fleet = await page.evaluate((ids) => ids.find((f) => window.__warsim!.view!.formationPos(f) !== null) ?? 0, [...held]);
  expect(fleet, 'one of them still afloat').toBeGreaterThan(0);
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), fleet);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(fleet));
  await expect(page.getByTestId('formation-ai-back')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('formation-ai-back')).toContainText('the AI commands it again');
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R35') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'fleet-ai-back.png') });
  // Another of Japan's fleets, never the player's: no line.
  const other = await page.evaluate(({ n, ids }) => window.__warsim!.view!.formationsOf(n).find((f) => window.__warsim!.view!.formationAfloat(f) && !ids.includes(f)) ?? 0, { n: JAP, ids: [...held] });
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), other);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(other));
  await expect(page.getByTestId('formation-ai-back')).toHaveCount(0);
});
