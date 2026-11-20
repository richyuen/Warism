import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

// ROADMAP R209 (critic run 88, R88-B1; ADR-1143): one `step` of 9,600 hours in the page ended in another world than the
// seed's headless one in 8 loads of 18 (plain 1938, seed 88901: hash 1699438925 for the headless 3723997852), from the
// same messages. Read: the worlds part at hour 4,983, where Riga falls and Latvia's field capital goes to the cell beside
// it, not to the one farthest from the enemy; with Chromium 153's Maglev kept from `enemyDistance` the fault is gone, with
// Maglev for it alone it is there. Taken from that: the compiled breadth-first loop, entered by on-stack replacement, lost
// what the closure it called wrote to the loop's own `tail` and `left`. The loop writes them itself now.
// The fault showed by the compiler's timing, in about half the loads: four loads at once, each stepped in one message,
// against the headless world stepped here (no hash kept by hand). The case meets that loop only while seed 88901's
// world sends a capital to the field in its first 9,600 hours, as Latvia's at hour 4,983 now.

const SEED = 88901;
const HOURS = 9600;

/** The headless world's state hash after HOURS, stepped a day at a time between the page's messages. */
async function headless(): Promise<number> {
  const sim = new Sim({ scenario: '1938', seed: SEED, assets: loadAssets1938(SIZE_1938.w) });
  for (let h = 0; h < HOURS; h += 24) {
    sim.step(24);
    await new Promise((done) => setImmediate(done));
  }
  return sim.hash() >>> 0;
}

test('one step of 9,600 hours in the page ends in the headless world (seed 88901)', async ({ browser, baseURL }) => {
  test.setTimeout(600_000);
  const one = async (): Promise<number> => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...(baseURL ? { baseURL } : {}) });
    try {
      const page = await context.newPage();
      await page.goto(`/?scenario=1938&paused=1&seed=${SEED}`);
      await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 120_000 });
      return await page.evaluate(async (hours) => (await window.__warsim!.sim.step(hours)).hash, HOURS);
    } finally {
      await context.close();
    }
  };
  const [want, ...ends] = await Promise.all([headless(), one(), one(), one(), one()]);
  expect(ends, 'each load\'s state hash at hour 9,600').toEqual([want, want, want, want]);
});
