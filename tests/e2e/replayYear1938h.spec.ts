import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { STATE_FORMAT } from '../../src/shared/saveFormat';

// ROADMAP R68b (ADR-983): a game of the historical replay started from a year: its world of 1 January (built at deploy;
// here a world saved two days in, served as 1939's) loaded into the new game, the replay going on (`mode=replay`) or
// left at once (`mode=free`); a year not built goes to the title's notice.

const ready = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
};

test('a start from a year: the replay goes on, or is left; a year not built is refused', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // The start to serve: the replay's world two days in, gzipped as the site serves it.
  await page.goto('/?scenario=1938h&paused=1&after=7');
  await ready(page);
  const built = await page.evaluate(async () => {
    const sim = window.__warsim!.sim;
    const status = await sim.step(48);
    const bytes = await sim.save();
    const gz = new Uint8Array(await new Response(new Blob([bytes.slice()]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    return { tick: status.tick, hash: status.hash, gz: Array.from(gz) };
  });
  await page.route('**/data/scenarios/1938h/start/years.json', (r) => r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1939, tick: built.tick, hash: built.hash }] } }));
  await page.route('**/data/scenarios/1938h/start/1939.sav', (r) => r.fulfill({ body: Buffer.from(built.gz), contentType: 'application/octet-stream' }));

  for (const mode of ['replay', 'free'] as const) {
    await page.goto(`/?scenario=1938h&paused=1&after=9&year=1939&mode=${mode}`);
    await ready(page);
    const status = await page.evaluate(() => window.__warsim!.sim.step(0));
    expect(status.tick, mode).toBe(built.tick);
    // The track's next event is shown while it runs: in the replay, not in a free game.
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.waitForFunction((t) => (window.__warsim!.hud.stats.value?.tick ?? 0) > t, built.tick, { timeout: 30_000 });
    const next = await page.evaluate(() => window.__warsim!.hud.stats.value!.trackNext);
    if (mode === 'replay') expect(next, mode).toBeDefined();
    else expect(next, mode).toBeUndefined();
    await page.screenshot({ path: test.info().outputPath(`year-${mode}.png`) });
  }

  // A year the site has not built.
  await page.goto('/?scenario=1938h&paused=1&after=9&year=1950&mode=replay');
  await page.waitForURL(/failed=save/, { timeout: 60_000 });
  expect(errors).toEqual([]);
});

// ROADMAP R68c (ADR-983): the card of the historical replay offers 1938 and the years built for the site, and the
// choice to replay on or play free; the year and the choice reach the game (1938 replayed on is the plain new game).
test('the card: a year and replay or free reach the game', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/data/scenarios/1938h/start/years.json', (r) => r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1938, tick: 0, hash: 0 }, { year: 1941, tick: 1, hash: 0 }] } }));
  await page.goto('/');
  await page.getByTestId('title-scenario-1938h').click();
  const year = page.getByTestId('title-start-year');
  await expect(year.locator('option')).toHaveText(['1 January 1938', '1 January 1941']);
  await expect(page.getByTestId('title-mode-replay')).toHaveAttribute('aria-checked', 'true');
  await page.screenshot({ path: test.info().outputPath('card-years.png') });
  // 1938, replayed on: the new game, no year asked.
  await Promise.all([page.waitForURL(/scenario=1938h/), page.getByTestId('settings-new-game').click()]);
  let url = new URL(page.url());
  expect([url.searchParams.get('year'), url.searchParams.get('mode')]).toEqual([null, null]);
  // 1938, free: the new game, the track left at once.
  await page.goto('/');
  await page.getByTestId('title-scenario-1938h').click();
  await page.getByTestId('title-mode-free').click();
  await Promise.all([page.waitForURL(/mode=free/), page.getByTestId('settings-new-game').click()]);
  url = new URL(page.url());
  expect([url.searchParams.get('year'), url.searchParams.get('mode')]).toEqual(['1938', 'free']);
  await ready(page);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.waitForFunction(() => (window.__warsim!.hud.stats.value?.tick ?? 0) > 0, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__warsim!.hud.stats.value!.trackNext)).toBeUndefined();
  // 1941, replayed on: the year in the URL.
  await page.goto('/');
  await page.getByTestId('title-scenario-1938h').click();
  await page.getByTestId('title-start-year').selectOption('1941');
  await page.route('**/data/scenarios/1938h/start/1941.sav', (r) => r.abort());
  await Promise.all([page.waitForURL(/year=1941/), page.getByTestId('settings-new-game').click()]);
  url = new URL(page.url());
  expect([url.searchParams.get('year'), url.searchParams.get('mode')]).toEqual(['1941', 'replay']);
  expect(errors).toEqual([]);
});
