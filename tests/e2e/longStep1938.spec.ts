import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R209 (critic run 88, R88-B1; ADR-1143): one `step` of 9,600 hours in the page ended in another world than the
// seed's headless one in 8 loads of 18 (plain 1938, seed 88901: hash 1699438925 for the headless 3723997852), from the
// same messages. `enemyDistance`'s breadth-first loop called a closure that wrote the loop's own `tail` and `left`;
// Chromium 153's Maglev, entering the loop by on-stack replacement, lost those writes, every target read -1 steps, and
// Latvia's field capital went to the cell beside Riga (hour 4,983). The loop writes them itself now.
// The fault showed by the compiler's timing, in about 45 % of the loads: four loads at once, each stepped in one message.

/** `npx tsx critic/scripts/c88_headHash.ts 88901 9600 9600`: the headless world's state hash at hour 9,600. */
const HEADLESS_88901_9600 = 3723997852;

test('one step of 9,600 hours in the page ends in the headless world (seed 88901)', async ({ browser, baseURL }) => {
  test.setTimeout(420_000);
  const one = async (): Promise<number> => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...(baseURL ? { baseURL } : {}) });
    try {
      const page = await context.newPage();
      await page.goto('/?scenario=1938&paused=1&seed=88901');
      await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 120_000 });
      return await page.evaluate(async () => (await window.__warsim!.sim.step(9600)).hash);
    } finally {
      await context.close();
    }
  };
  const ends = await Promise.all([one(), one(), one(), one()]);
  expect(ends, 'each load\'s state hash at hour 9,600').toEqual([HEADLESS_88901_9600, HEADLESS_88901_9600, HEADLESS_88901_9600, HEADLESS_88901_9600]);
});
