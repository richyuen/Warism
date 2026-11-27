import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R226 (ADR-1157): at Max the worker's next slice of ticks comes by a message to itself, not a timer (a nested
// `setTimeout(0)` waits 4 ms or more, a third of a 12 ms slice). The page's own messages are tasks of the same queue:
// what it sends at Max is handled between two slices, as before, and is not kept waiting by the worker's own. Here: a
// command given at Max is applied, and a pause given at Max is taken within a few slices' ticks and holds the date.
// Counted in ticks and in the view's frames, not in seconds of the wall (ADR-1156): with eight pages at Max on one
// machine the date's last change came 11 to 357 ms after the pause.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
/** The most ticks the worker may run between a pause sent and taken: a game month, some two seconds of Max alone. */
const PAUSE_TICKS = 720;

test('at Max a command is applied and a pause holds the date (R226)', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?scenario=1938&paused=1&seed=99');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  const got = await page.evaluate(async (GER) => {
    const { sim, hud } = window.__warsim!;
    const frame = (): Promise<void> => new Promise((done) => requestAnimationFrame(() => done()));
    const until = async (what: string, ok: () => boolean | Promise<boolean>, ms: number): Promise<void> => {
      const start = performance.now();
      while (!(await ok())) {
        if (performance.now() - start > ms) throw new Error(`waited ${ms} ms for ${what}`);
        await frame();
      }
    };
    sim.setSpeed('max');
    sim.setPaused(false);
    const t0 = hud.tick.value;
    // A game month at Max: the worker is in its slices.
    await until('a month at Max', () => hud.tick.value >= t0 + 720, 120_000);
    // 1. A command given at Max is applied while the game runs on.
    sim.command({ kind: 'renameNation', nation: GER, name: 'Maxland' });
    await until('the command applied', async () => (await sim.inspect()).nations.some((n) => n.id === GER && n.name === '=Maxland'), 30_000);
    await until('the game running on', () => hud.tick.value >= t0 + 720 + 24 * 5, 60_000);
    // 2. A pause given at Max: the worker's tick as it is asked, and as the pause is taken (the next message).
    const asked = (await sim.inspect()).tick;
    const sent = performance.now();
    sim.setPaused(true);
    const taken = (await sim.inspect()).tick;
    const takenMs = performance.now() - sent;
    // The date shown comes to the worker's tick and stands there, twenty frames on.
    await until('the date at the tick the pause was taken', () => hud.tick.value === taken, 30_000);
    for (let i = 0; i < 20; i++) await frame();
    return { asked, taken, takenMs: Math.round(takenMs), shown: hud.tick.value, after: (await sim.inspect()).tick };
  }, id('GER'));
  console.log(JSON.stringify(got));
  // Taken within a few slices of ticks (a worker that kept the page's messages waiting would run on).
  expect(got.taken - got.asked).toBeGreaterThanOrEqual(0);
  expect(got.taken - got.asked).toBeLessThanOrEqual(PAUSE_TICKS);
  // And held: the date shown and the worker's tick are the tick the pause was taken at.
  expect(got.shown).toBe(got.taken);
  expect(got.after).toBe(got.taken);
});
