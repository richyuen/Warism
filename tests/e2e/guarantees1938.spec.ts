import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import diplomacy from '../../data/scenarios/1938/diplomacy.json' with { type: 'json' };
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { open1938 } from './mapView';

// PLAN 7.190 (critic run 25's 9): guarantees were shown nowhere, so a pledge, its binding (ADR-797)
// and its lapse were invisible. The nation panel names the nations a nation guarantees and those
// that guarantee it: each guarantee of the 1938 start in both its nations' panels.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;

test("each guarantee of the 1938 start in the guarantor's panel and the target's", async ({ page }) => {
  test.setTimeout(180_000);
  await open1938(page, 3739);
  expect(diplomacy.guarantees.length).toBeGreaterThan(0);
  const chips = async (block: string): Promise<number[]> => (await page.getByTestId(block).getByTestId('nation-chip').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-nation')))));
  for (const g of diplomacy.guarantees) {
    await page.evaluate((n) => window.__warsim!.view!.select(n), id(g.guarantor));
    await expect(page.getByTestId('panel-guarantees')).toBeVisible();
    expect(await chips('panel-guarantees'), `${g.guarantor} guarantees ${g.target}`).toContain(id(g.target));
    await page.evaluate((n) => window.__warsim!.view!.select(n), id(g.target));
    await expect(page.getByTestId('panel-guarantors')).toBeVisible();
    expect(await chips('panel-guarantors'), `${g.target} guaranteed by ${g.guarantor}`).toContain(id(g.guarantor));
  }
});
