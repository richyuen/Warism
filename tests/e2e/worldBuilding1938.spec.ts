import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R65c (critic run 63): at a start the map was grey, no nations and a short bar, for about 2 s while the
// worker built the world (a scenario file's or plain 1938's). Now "Building the world…" is over the map in every
// sample in which the map is drawn and the world's first stats have not come, and it goes with them.
test('a start says the world is being built until its first stats', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?scenario=1938');
  const seen = await page.evaluate(async () => {
    const out = { drawnNoStats: 0, unsaid: 0 };
    const t0 = performance.now();
    for (;;) {
      const w = window.__warsim;
      const drawn = (w?.view?.frames ?? 0) > 0;
      const stats = (w?.hud.stats.value ?? null) !== null;
      if (stats || performance.now() - t0 > 90_000) break;
      if (drawn) {
        out.drawnNoStats++;
        if (!document.querySelector('[data-testid=world-building]')) out.unsaid++;
      }
      await new Promise((r) => setTimeout(r, 25));
    }
    return out;
  });
  expect(seen.drawnNoStats).toBeGreaterThan(0);
  expect(seen.unsaid).toBe(0);
  await expect(page.getByTestId('world-building')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ROADMAP R70c (critic run 64): a paused start (`?paused=1`) after a game left running said "Pause" on its bar while
// the world was built; now "Resume" from the first frame.
test('a paused start says so while the world is built', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.setItem('warsim.paused', '0'));
  await page.goto('/?scenario=1938&paused=1');
  const seen = await page.evaluate(async () => {
    const out = { samples: 0, saidPause: 0 };
    const t0 = performance.now();
    for (;;) {
      const w = window.__warsim;
      if ((w?.hud.stats.value ?? null) !== null || performance.now() - t0 > 90_000) break;
      const b = document.querySelector('[data-testid=pause-btn]') as HTMLElement | null;
      if (b) {
        out.samples++;
        if (b.innerText.trim() === 'Pause') out.saidPause++;
      }
      await new Promise((r) => setTimeout(r, 25));
    }
    return out;
  });
  expect(seen.samples).toBeGreaterThan(0);
  expect(seen.saidPause).toBe(0);
  await expect(page.getByTestId('pause-btn')).toHaveText('Resume');
});

// ROADMAP R74a (critic run 65, R65-N7): Resume pressed while a paused start's world is built held; the start was paused
// again at the first stats. Pressed as the overlay comes up and a second later; and Pause pressed in a running start.
for (const { paused, wait } of [
  { paused: true, wait: 0 },
  { paused: true, wait: 1000 },
  { paused: false, wait: 0 },
]) {
  test(`a choice made while the world is built holds (${paused ? 'paused start, Resume' : 'running start, Pause'}, after ${wait} ms)`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.addInitScript((p) => localStorage.setItem('warsim.paused', p), '0');
    await page.goto(`/?scenario=1938${paused ? '&paused=1' : ''}`);
    await page.getByTestId('world-building').waitFor({ timeout: 60_000 });
    await page.waitForTimeout(wait);
    expect(await page.evaluate(() => window.__warsim!.hud.stats.value), 'still building').toBeNull();
    await page.getByTestId('pause-btn').click();
    await page.waitForFunction(() => window.__warsim!.hud.stats.value !== null, null, { timeout: 90_000 });
    await page.waitForTimeout(3000);
    const want = !paused;
    expect(await page.evaluate(() => window.__warsim!.hud.paused.value)).toBe(want);
    expect(await page.evaluate(() => window.__warsim!.hud.worker.value?.paused)).toBe(want);
    await expect(page.getByTestId('pause-btn')).toHaveText(want ? 'Resume' : 'Pause');
  });
}
