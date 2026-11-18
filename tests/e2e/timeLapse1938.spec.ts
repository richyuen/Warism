import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// ROADMAP R143b AT: the borders' time-lapse, opened from History. On two seeds its map at each 1 January equals the map
// the page had at that hour (R143a's record played on the page); 60 fps while it plays (frames timed on the GPU).

/** Steps the paused game to `tick` and waits until the view has the snapshot of it. */
async function stepTo(page: Page, tick: number): Promise<void> {
  await page.evaluate((t) => window.__warsim!.sim.step(t - window.__warsim!.hud.tick.value), tick);
  await page.waitForFunction((t) => (window.__warsim!.view?.lastTick ?? -1) >= t, tick, { timeout: 120_000 });
}

for (const seed of [1938, 7]) {
  test(`the time-lapse, seed ${seed}`, async ({ page }, info) => {
    test.setTimeout(400_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    // 1 January 1939 and 1940: the maps the page has an hour after (a run stopped there), kept in the page.
    const jan1 = [365 * 24, 730 * 24];
    for (const [i, t] of jan1.entries()) {
      await stepTo(page, t + 1);
      await page.evaluate((i) => ((window as unknown as { __jan1: Uint16Array[] }).__jan1 ??= [])[i] = window.__warsim!.view!.ownerCopy(), i);
    }
    await stepTo(page, jan1[1]! + 24 * 100);

    // Opened from History: History closes, the game stays paused, the bar shows the map of now.
    await page.evaluate(() => window.__warsim!.hud.toggleHistory());
    await page.getByTestId('history-timelapse').click();
    const bar = page.getByTestId('time-lapse');
    await expect(bar).toBeVisible();
    await expect(page.getByTestId('history-panel')).toHaveCount(0);
    expect(await page.evaluate(() => window.__warsim!.hud.paused.value)).toBe(true);
    const steps = Number(await bar.getAttribute('data-steps'));
    expect(Number(await bar.getAttribute('data-step'))).toBe(steps);
    expect(await page.evaluate(() => window.__warsim!.view!.timeLapseOn)).toBe(true);

    // At each 1 January the map is the one the page had then.
    for (const [i, t] of jan1.entries()) {
      const unlike = await page.evaluate(
        ({ i, t }) => {
          const hud = window.__warsim!.hud;
          const p = hud.timeLapse.value!;
          hud.seekTimeLapse(p.stepAt(t));
          if (p.tick !== t) return -1;
          const then = (window as unknown as { __jan1: Uint16Array[] }).__jan1[i]!;
          let n = 0;
          for (let k = 0; k < then.length; k++) if (then[k] !== p.map[k]) n++;
          return n;
        },
        { i, t },
      );
      expect(unlike, `cells unlike on 1 January ${1939 + i} (-1: no step at its hour)`).toBe(0);
      await expect(page.getByTestId('time-lapse-date')).toHaveText(`January ${1939 + i}`);
    }

    // R149 (critic run 76, R76-N2): on 1 January 1940's map, a cell whose owner is not today's is named for its owner then,
    // by the click's pick and the tooltip.
    const cell = await page.evaluate(() => {
      const v = window.__warsim!.view!;
      const p = window.__warsim!.hud.timeLapse.value!;
      const now = v.ownerCopy();
      for (let k = 0; k < now.length; k++) if (p.map[k] !== 0 && now[k] !== 0 && p.map[k] !== now[k]) return { k, then: p.map[k]!, now: now[k]! };
      return null;
    });
    expect(cell, 'a cell that changed owner since 1 January 1940').not.toBeNull();
    await page.evaluate((k) => {
      const v = window.__warsim!.view!;
      v.showPlace((k % v.geo.w) + 0.5, Math.floor(k / v.geo.w) + 0.5);
    }, cell!.k);
    await page.waitForTimeout(2000);
    await page.mouse.move(800, 450);
    await page.mouse.move(801, 450);
    await page.waitForFunction(() => window.__warsim!.hud.hover.value !== null, null, { timeout: 10_000 });
    const named = await page.evaluate(() => ({ picked: window.__warsim!.view!.nationAt(800, 450), hover: window.__warsim!.hud.hover.value!.owner }));
    expect(named, `the cell's owner on 1 January 1940 (${cell!.then}), not today's (${cell!.now})`).toEqual({ picked: cell!.then, hover: cell!.then });
    // Space plays and pauses the time-lapse, not the game; Escape closes the plate.
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => [window.__warsim!.hud.lapsePlaying.value, window.__warsim!.hud.paused.value])).toEqual([true, true]);
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => [window.__warsim!.hud.lapsePlaying.value, window.__warsim!.hud.paused.value])).toEqual([false, true]);

    // Played from the start: the frames timed as the months go by.
    await page.evaluate(() => window.__warsim!.hud.seekTimeLapse(0));
    await page.getByTestId('time-lapse-play').click();
    const fps = await page.evaluate(async () => {
      const times: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 2500) times.push(await new Promise<number>((done) => requestAnimationFrame(done)));
      const gaps = times.slice(1).map((t, i) => t - times[i]!);
      gaps.sort((a, b) => a - b);
      return { fps: (times.length - 1) / ((times[times.length - 1]! - times[0]!) / 1000), p95: gaps[Math.floor(gaps.length * 0.95)]!, step: window.__warsim!.hud.lapseStep.value };
    });
    process.stderr.write(`time-lapse seed ${seed}: ${steps} steps; playing ${fps.fps.toFixed(1)} fps, p95 ${fps.p95.toFixed(1)} ms, at step ${fps.step}\n`);
    expect(fps.step, 'it played').toBeGreaterThan(10);
    if (info.project.name === 'chromium') {
      expect(fps.fps, 'frames a second while it plays').toBeGreaterThanOrEqual(55);
      expect(fps.p95, 'the 95th frame time').toBeLessThanOrEqual(25);
    }
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R143') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.screenshot({ path: path.join(out, `time-lapse-${seed}.png`) });

    // Closed: the map of the game again.
    await page.getByTestId('time-lapse-close').click();
    await expect(bar).toHaveCount(0);
    expect(await page.evaluate(() => window.__warsim!.view!.timeLapseOn)).toBe(false);
    // Escape closes it too (R149), and Space is the game's again.
    await page.evaluate(() => window.__warsim!.hud.toggleHistory());
    await page.getByTestId('history-timelapse').click();
    await expect(bar).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(bar).toHaveCount(0);
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => window.__warsim!.hud.paused.value)).toBe(false);
  });
}
