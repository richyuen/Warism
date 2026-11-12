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

// ROADMAP R68c (ADR-983; the user's decision of 2026-11-12: one card for 1938, a slider of years under its map): the
// 1938 card offers 1938 and the years built for the site, and replay history or play free. Free from 1938 is the plain
// 1938 game (its seed and options); the replay, or a later year free, the historical world with year and choice.
test('the 1938 card: a slider of years, replay or free, reach the game', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/data/scenarios/1938h/start/years.json', (r) => r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1938, tick: 0, hash: 0 }, { year: 1941, tick: 1, hash: 0 }] } }));
  await page.route('**/data/scenarios/1938h/start/1941.sav', (r) => r.abort());
  const card = async (): Promise<void> => {
    await page.goto('/');
    await expect(page.getByTestId('title-scenario-1938h')).toHaveCount(0);
    await expect(page.getByTestId('title-chosen')).toHaveText('World, 1938');
  };
  const started = async (want: RegExp): Promise<URLSearchParams> => {
    await Promise.all([page.waitForURL(want), page.getByTestId('settings-new-game').click()]);
    return new URL(page.url()).searchParams;
  };
  // Free from 1938 (the card's own default): the plain 1938 game, its seed offered.
  await card();
  const slider = page.getByTestId('title-start-year');
  await expect(slider).toHaveAttribute('min', '1938');
  await expect(slider).toHaveAttribute('max', '1941');
  await expect(page.getByTestId('title-mode-free')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('settings-seed')).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('card-free-1938.png') });
  let q = await started(/scenario=1938&/);
  expect([q.get('year'), q.get('mode')]).toEqual([null, null]);
  // Replay from 1938: the historical world, no seed offered, no year asked.
  await card();
  await page.getByTestId('title-mode-replay').click();
  await expect(page.getByTestId('settings-seed')).toHaveCount(0);
  await expect(page.getByTestId('settings-fixed')).toContainText('replay of history');
  q = await started(/scenario=1938h/);
  expect([q.get('year'), q.get('mode')]).toEqual([null, null]);
  // 1941, replayed and free.
  for (const mode of ['replay', 'free'] as const) {
    await card();
    await slider.fill('1941');
    await expect(page.getByTestId('title-start-date')).toHaveText('1 January 1941');
    await page.getByTestId(`title-mode-${mode}`).click();
    if (mode === 'replay') await page.screenshot({ path: test.info().outputPath('card-replay-1941.png') });
    q = await started(/year=1941/);
    expect([q.get('scenario'), q.get('mode')]).toEqual(['1938h', mode]);
  }
  expect(errors).toEqual([]);
});
