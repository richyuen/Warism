import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R62a (ADR-919): the historical track's scenario opens by its URL, with its own seed and options whatever the
// URL asks (the same state as with its own seed in the URL); its settings' new game offers no seed and no option.

const open = async (page: Page, query: string): Promise<number> => {
  await page.goto(`/?scenario=1938h&paused=1${query}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  return (await page.evaluate(() => window.__warsim!.sim.hash())).hash;
};

test('1938h starts with its own seed; its new game offers no seed or option', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const own = await open(page, '&seed=1938');
  // Another seed and a random option in the URL change nothing.
  expect(await open(page, '&seed=5&aggr=random&traits=random')).toBe(own);
  expect(await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.length)).toBe(102);
  await page.getByTestId('settings-btn').click();
  await expect(page.getByTestId('settings-panel')).toBeVisible();
  await expect(page.getByTestId('settings-fixed')).toContainText('replay of history');
  await expect(page.getByTestId('settings-seed')).toHaveCount(0);
  await expect(page.getByTestId('settings-new-game')).toBeEnabled();
  await page.screenshot({ path: test.info().outputPath('settings-1938h.png') });
  expect(errors).toEqual([]);
});
