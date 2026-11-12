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
  const own = await open(page, '&seed=1938&after=7');
  // Another seed and a random option in the URL change nothing.
  expect(await open(page, '&seed=5&aggr=random&traits=random&after=7')).toBe(own);
  expect(await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.length)).toBe(102);
  await page.getByTestId('settings-btn').click();
  await expect(page.getByTestId('settings-panel')).toBeVisible();
  await expect(page.getByTestId('settings-fixed')).toContainText('replay of history');
  await expect(page.getByTestId('settings-seed')).toHaveCount(0);
  await expect(page.getByTestId('settings-new-game')).toBeEnabled();
  await page.screenshot({ path: test.info().outputPath('settings-1938h.png') });
  // A new game rolls its second seed (R62d): the seed stays the scenario's.
  await page.getByTestId('settings-new-game').click();
  await page.waitForURL(/after=\d+/);
  const url = new URL(page.url());
  expect(url.searchParams.get('scenario')).toBe('1938h');
  expect(Number(url.searchParams.get('after'))).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

// ROADMAP R62m (ADR-948), R68c (the user's decision of 2026-11-12): the historical track is the 1938 card's "Replay
// history", with its own words; its Start opens it, with a seed for after it and none of its own asked.
test('the 1938 card replays history; Start opens it', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByTestId('title-scenario-1938h')).toHaveCount(0);
  await page.getByTestId('title-scenario-1938').click();
  await page.getByTestId('title-mode-replay').click();
  await expect(page.getByTestId('title-chosen')).toHaveText('World, 1938');
  await expect(page.getByTestId('title-detail')).toContainText('the end of 1975');
  await expect(page.getByTestId('title-start-date')).toHaveText('1 January 1938');
  await expect(page.getByTestId('settings-seed')).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('title-1938h.png') });
  await Promise.all([page.waitForURL(/scenario=1938h/), page.getByTestId('settings-new-game').click()]);
  expect(Number(new URL(page.url()).searchParams.get('after'))).toBeGreaterThan(0);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await expect(page.getByTestId('track-next')).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('started-1938h.png') });
  expect(errors).toEqual([]);
});
