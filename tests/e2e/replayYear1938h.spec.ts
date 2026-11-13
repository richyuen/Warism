import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { STATE_FORMAT } from '../../src/shared/saveFormat';

// ROADMAP R68b (ADR-983): a game of the historical replay started from a year: its world of 1 January (built at deploy;
// here a world saved two days in, served as 1939's) loaded into the new game, the replay going on (`mode=replay`) or
// left at once (`mode=free`); a year not built goes to the title's notice of its own (R73).

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

  // A year the site has not built: the title's notice names it (R73, critic run 65 B1).
  await page.goto('/?scenario=1938h&paused=1&after=9&year=1950&mode=replay');
  await page.waitForURL(/failed=start&year=1950/, { timeout: 60_000 });
  await expect(page.getByTestId('title-start-error')).toContainText('1 January 1950');
  expect(errors).toEqual([]);
});

// ROADMAP R73 (critic run 65, B1): a refused start is told on the 1938 card, naming its year, and leaves the player's
// saved game alone (its card, its Continue); moving the slider clears the notice.
test('a start that cannot be loaded is told by its year, and the saved game keeps its Continue', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // A saved game: the toy world a day in, Settings > Main menu.
  await page.goto('/?scenario=toy&paused=1&seed=7');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.worker.value !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await page.getByTestId('settings-btn').click();
  await Promise.all([page.waitForURL((u) => u.search === ''), page.getByTestId('settings-menu').click()]);
  await expect(page.getByTestId('title-continue')).toBeVisible();
  // 1960 in the index, its file missing (a 404).
  await page.route('**/data/scenarios/1938h/start/years.json', (r) =>
    r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1938, tick: 0, hash: 0 }, { year: 1960, tick: 1, hash: 1 }] } }),
  );
  await page.route('**/data/scenarios/1938h/start/1960.sav', (r) => r.fulfill({ status: 404, body: 'no' }));
  for (const sizes of [
    { width: 1400, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(sizes);
    await page.goto('/?scenario=1938h&paused=1&after=9&year=1960&mode=replay');
    await page.waitForURL(/failed=start&year=1960/, { timeout: 60_000 });
    await expect(page.getByTestId('title-chosen')).toHaveText('World, 1938');
    await expect(page.getByTestId('title-start-error')).toContainText('1 January 1960');
    await page.getByTestId('title-start-error').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('title-start-error')).toBeVisible();
    await expect(page.getByTestId('title-continue')).toBeVisible();
    await expect(page.getByTestId('title-save-error')).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath(`start-failed-${sizes.width}.png`), fullPage: true });
  }
  // The slider moved: the notice is gone.
  await page.getByTestId('title-start-year').fill('1938');
  await expect(page.getByTestId('title-start-error')).toHaveCount(0);
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
  await page.route('**/data/scenarios/1938h/start/years.json', (r) =>
    r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1938, tick: 0, hash: 0, nations: 102 }, { year: 1941, tick: 1, hash: 0, nations: 77 }] } }),
  );
  await page.route('**/data/scenarios/1938h/start/1941.sav', (r) => r.abort());
  // 1941's map: the random world's preview stands in for it.
  await page.route('**/data/scenarios/1938h/start/1941.png', (r) => r.fulfill({ path: 'public/data/scenarios/random/preview.png', contentType: 'image/png' }));
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
  // 1941, replayed and free: the card shows 1941's world (R74b): its map, its nations, its name, the year on the thumb.
  for (const mode of ['replay', 'free'] as const) {
    await card();
    await expect(page.getByTestId('title-year-thumb')).toHaveText('1938');
    await slider.fill('1941');
    await expect(page.getByTestId('title-start-date')).toHaveText('1 January 1941');
    await expect(page.getByTestId('title-chosen')).toHaveText('World, 1941');
    await expect(page.getByTestId('title-nations')).toHaveText('77');
    await expect(page.getByTestId('title-year-thumb')).toHaveText('1941');
    await expect(page.getByTestId('title-preview')).toHaveAttribute('src', /start\/1941\.png$/);
    await page.waitForFunction(() => (document.querySelector('[data-testid=title-preview]') as HTMLImageElement).complete);
    await page.getByTestId(`title-mode-${mode}`).click();
    if (mode === 'replay') await page.screenshot({ path: test.info().outputPath('card-replay-1941.png') });
    q = await started(/year=1941/);
    expect([q.get('scenario'), q.get('mode')]).toEqual(['1938h', mode]);
  }
  expect(errors).toEqual([]);
});

// ROADMAP R74b: a site whose starts were built before their maps and counts (an index without `nations`, no PNG) shows
// the 1938 card's own map and count at a later year, its name and date the year's.
test('the 1938 card at a later year of an older index: the map and count of 1938', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/data/scenarios/1938h/start/years.json', (r) => r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years: [{ year: 1938, tick: 0, hash: 0 }, { year: 1960, tick: 1, hash: 0 }] } }));
  await page.route('**/data/scenarios/1938h/start/1960.png', (r) => r.fulfill({ status: 404, body: 'no' }));
  await page.goto('/');
  await page.getByTestId('title-start-year').fill('1960');
  await expect(page.getByTestId('title-chosen')).toHaveText('World, 1960');
  await expect(page.getByTestId('title-nations')).toHaveText('102');
  await expect(page.getByTestId('title-preview')).toHaveAttribute('src', /scenarios\/1938\/preview\.png$/);
  // No great powers in an index built before them (R75b): no row.
  await expect(page.getByTestId('title-powers')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ROADMAP R75b (critic run 65's idea, as Paradox's bookmarks): the card names each start's great powers, strongest
// first, from the index (`cardPowers` in tools/data/replaySaves.ts; the lists here are its own on the starts of 1938,
// 1960 and 1975 built on 2026-11-13).
test("the 1938 card names the year's great powers", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const years = [
    { year: 1938, tick: 0, hash: 0, nations: 102, powers: ['USA', 'SOV', 'GER', 'ENG', 'FRA', 'ITA', 'JAP'] },
    { year: 1960, tick: 1, hash: 0, nations: 124, powers: ['USA', 'ENG', 'SOV', 'FRA', 'FRG', 'PRC', 'ITR'] },
    { year: 1975, tick: 2, hash: 0, nations: 154, powers: ['USA', 'ENG', 'SOV', 'FRA', 'PRC', 'FRG', 'ITR'] },
  ];
  await page.route('**/data/scenarios/1938h/start/years.json', (r) => r.fulfill({ json: { format: STATE_FORMAT, seed: 1938, years } }));
  await page.route('**/data/scenarios/1938h/start/*.png', (r) => r.fulfill({ path: 'public/data/scenarios/random/preview.png', contentType: 'image/png' }));
  await page.goto('/');
  const powers = page.getByTestId('title-powers');
  await expect(powers).toHaveText('United States, Soviet Union, Germany, United Kingdom, France, Italy, Japan');
  await page.screenshot({ path: test.info().outputPath('card-powers-1938.png') });
  await page.getByTestId('title-start-year').fill('1960');
  await expect(page.getByTestId('title-chosen')).toHaveText('World, 1960');
  await expect(powers).toHaveText("United States, United Kingdom, Soviet Union, France, West Germany, People's China, Italy");
  await page.getByTestId('title-start-year').fill('1975');
  await expect(powers).toHaveText("United States, United Kingdom, Soviet Union, France, People's China, West Germany, Italy");
  await page.screenshot({ path: test.info().outputPath('card-powers-1975.png') });
  // The row stays inside the card, wrapped: nothing beyond the screen.
  const box = await powers.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(1400);
  expect(errors).toEqual([]);
});
