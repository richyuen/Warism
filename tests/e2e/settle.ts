import type { Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

/**
 * Draws until a frame leaves nothing animating, and returns with that frame's state in the view.
 *
 * "Wait until nothing animates, then draw" is not the same. The view's own loop may not have
 * drawn since the last animation ended; then the test's draw is the frame that sees the end
 * state, starts what follows from it (a capital flag making way for a counter that has just
 * come to rest) and shows that animation's first frame. `flagsClear1938.spec.ts` failed that
 * way once in a gate run (2026-10-04): three flags still on their counters.
 *
 * The question is asked at the frame's own time, as the view's loop asks it (PLAN 2.7m). Asked
 * at the time after the draw, the answer is "no" for a fade that this frame started when the
 * frame took longer than the fade: a first frame at a new zoom of more than 300 ms left the
 * capital flags at opacity 0, and `loadedWorld1938.spec.ts` read no flag at all (PLAN 2.16Rj).
 *
 * For a paused game. While the game runs the counters never all stand still: a spec that
 * samples a running game says which animation it waits for (`handover1938.spec.ts`) or which
 * frames it reads (`declutter1938.spec.ts`).
 */
export async function settle(page: Page, timeoutMs = 30_000): Promise<void> {
  await page.evaluate(async (timeoutMs) => {
    const v = window.__warsim!.view!;
    const deadline = performance.now() + timeoutMs;
    for (;;) {
      const now = performance.now();
      v.draw(now);
      if (!v.unitsAnimating(now)) return;
      if (performance.now() > deadline) throw new Error(`the view did not come to rest in ${timeoutMs / 1000} s`);
      await new Promise((done) => setTimeout(done, 25));
    }
  }, timeoutMs);
}

/**
 * Waits until the view holds the element section of the camera's own zoom (the snapshot asked
 * for at this zoom has come: `elementsZoom` within 1 % of the camera's m/px), then `settle`s.
 *
 * In place of a wait of the wall's time ("up to 5 s for the section, then 400 ms"; "1.5 s, then
 * draw"): how long a snapshot takes to come, and how many frames a fade takes, hang on the
 * machine. On a software GPU a section could still be on its way when such a wait ran out, and
 * the test measured the figures of the zoom before (shipMarks1938's destroyers at 16.5 px). This
 * waits for the state itself, with a limit only for a section that never comes.
 *
 * For a paused game, as `settle`.
 */
export async function settleAtZoom(page: Page, timeoutMs = 60_000): Promise<void> {
  await page.waitForFunction(() => {
    const v = window.__warsim!.view!;
    return Math.abs(v.elementsZoom / v.metresPerPx - 1) < 0.01;
  }, null, { timeout: timeoutMs });
  await settle(page, timeoutMs);
}
