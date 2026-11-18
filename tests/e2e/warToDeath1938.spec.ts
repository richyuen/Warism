import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { open1938 } from './mapView';

// ROADMAP R135 (critic run 75: `c75_warAt100.ts 7019 5 off`, Japan's war in China at −100 for 738 days; China and both
// Spains fight to the death, and only the refusal of a peace the player offers said so). The banner's title says which
// side fights to the death and what that means; a war with neither says nothing of it. The critic's seed, at the start:
// the war in China and the Spanish war are the start's, with their flags.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const ENDS = "no peace is made, whatever the score; the war ends when one side holds three quarters of the other's land, or after five years";

test('a war banner says which side fights to the death and why the war goes on (ROADMAP R135)', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await open1938(page, 7019);
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }, true), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await expect(page.getByTestId('war-banner')).toHaveCount(3, { timeout: 20_000 });
  const titleOf = async (who: string): Promise<string> => (await page.locator(`[data-testid="war-banner"][title*="${who}"]`).getAttribute('title'))!;
  const china = await titleOf('Japan');
  expect(china).toContain(`China fights to the death: ${ENDS}`);
  expect(china).not.toContain('Japan fights to the death');
  const spain = await titleOf('Spanish Republic');
  expect(spain).toMatch(new RegExp(`(Nationalist Spain and Spanish Republic|Spanish Republic and Nationalist Spain) fight to the death: `));
  const poland = await titleOf('Poland');
  expect(poland).not.toContain('to the death');
  await expect(page.locator('[data-testid="war-banner"][data-death="1"]')).toHaveCount(2);

  // R156 (critic run 76): on a phone there is no hover. The two are marked on their banners; opened, each says it in words.
  await page.setViewportSize({ width: 390, height: 844 });
  // Closed, the row shows two and "+n" (one may be behind it): each to the death on the row has its mark.
  await page.waitForTimeout(500);
  const onRow = await page.locator('[data-testid="war-banner"][data-death="1"]').count();
  expect(onRow).toBeGreaterThan(0);
  await expect(page.locator('[data-testid="war-banner"][data-death="1"] [data-testid="war-death"]')).toHaveCount(onRow);
  await expect(page.getByTestId('war-death-line')).toHaveCount(0);
  await page.getByTestId('war-more').click();
  await expect(page.getByTestId('war-death')).toHaveCount(2);
  const lines = await page.getByTestId('war-death-line').allInnerTexts();
  expect(lines).toHaveLength(2);
  expect(lines.join(' | ')).toContain(`China fights to the death: ${ENDS}`);
  for (const line of await page.getByTestId('war-death-line').all()) await expect(line).toBeVisible();
});
