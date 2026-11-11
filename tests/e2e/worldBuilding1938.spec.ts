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
