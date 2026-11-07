import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R34h (critic run 32, R32-N2: a trait's words only on hover; on a phone the chips were names with no
// meaning): a tap on a trait chip in a nation's panel shows what it does under the chips, a tap again hides it;
// in the God tab the trait touched is said under the list.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;

test("a phone: a trait chip's tap shows what it does", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
  const chip = page.getByTestId('trait-chip').first();
  await expect(chip).toBeVisible();
  const words = (await chip.getAttribute('title'))!;
  expect(words.length).toBeGreaterThan(10);
  await expect(page.getByTestId('trait-desc')).toHaveCount(0);
  await chip.tap();
  const desc = page.getByTestId('trait-desc');
  await expect(desc).toBeVisible();
  await expect(desc).toHaveText(words);
  const [d, p] = await Promise.all([desc.boundingBox(), page.getByTestId('nation-panel').boundingBox()]);
  expect(d!.x + d!.width, 'the words inside the panel').toBeLessThanOrEqual(p!.x + p!.width + 0.5);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'trait-tap-phone.png') });
  await chip.tap();
  await expect(desc).toHaveCount(0);
  // The God tab: the trait touched is said.
  await page.getByTestId('god-btn').tap();
  await page.getByTestId('tab-god').tap();
  const box = page.getByTestId('god-trait-mercantile');
  await box.scrollIntoViewIfNeeded();
  const label = box.locator('xpath=..');
  const said = (await label.getAttribute('title'))!;
  await label.tap();
  await expect(page.getByTestId('god-trait-desc')).toContainText(said);
});
