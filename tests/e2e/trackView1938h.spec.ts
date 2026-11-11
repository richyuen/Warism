import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R62j1 (ADR-946): while the historical track runs, a line under the date names its next event and its date;
// its events are told in the ticker by their historical names; the first intervention ends it and the line goes.
// Screenshots at world zoom on a phone's and a desktop's sizes.

/** Steps the sim to `tick` and waits for the view's snapshot and the stats of that hour or after. */
async function stepTo(page: Page, tick: number): Promise<void> {
  await page.evaluate(async (tick) => {
    const { sim, view, hud } = window.__warsim!;
    const now = (await sim.step(0)).tick;
    const t = (await sim.step(Math.max(0, tick - now))).tick;
    await new Promise<void>((done) => {
      const wait = (): void => (view!.lastTick >= t && (hud.stats.value?.tick ?? -1) >= t ? done() : void setTimeout(wait, 20));
      wait();
    });
  }, tick);
}

const SIZES = [
  { name: 'desktop', width: 1400, height: 800 },
  { name: 'phone', width: 390, height: 844 },
];

for (const size of SIZES) {
  test(`the track's next event under the date, its events in the ticker, gone at the intervention (${size.name})`, async ({ page }, info) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: size.width, height: size.height });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R62j') : info.outputPath();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/?scenario=1938h&paused=1&after=7');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    // Past the first hour's events: the next named one is the Anschluss, on 12 March 1938.
    await stepTo(page, 2);
    const line = page.getByTestId('track-next');
    await expect(line).toContainText('The Anschluss');
    await expect(line).toContainText('12 March 1938');
    await page.screenshot({ path: path.join(out, `track-next-${size.name}.png`) });
    // A day after it: the ticker tells it by its name, and the line names the next.
    await stepTo(page, (31 + 28 + 12) * 24 + 2);
    await expect(page.getByTestId('ticker')).toContainText('The Anschluss');
    await expect(line).not.toContainText('The Anschluss');
    await page.screenshot({ path: path.join(out, `track-event-${size.name}.png`) });
    // The first intervention ends the track: the line goes.
    const tick = await page.evaluate(() => window.__warsim!.hud.stats.value!.tick);
    await page.evaluate(() => window.__warsim!.hud.command({ kind: 'setGold', nation: 1, value: 1000 }));
    await stepTo(page, tick + 2);
    await expect(line).toHaveCount(0);
    await page.screenshot({ path: path.join(out, `track-ended-${size.name}.png`) });
    expect(errors).toEqual([]);
  });
}

// ROADMAP R64a (critic run 62, R62-N1): while the track runs, the form, Take control, the God Mode bar and the editor
// say that an act ends the replay; taking a nation ends it, told in the ticker; the warnings go with it.
test('what ends the replay is said before; the end is told in the ticker', async ({ page }, info) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R64') : info.outputPath();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('title-scenario-1938h').click();
  await expect(page.getByTestId('settings-fixed')).toContainText(/ends the replay/i);
  await page.goto('/?scenario=1938h&paused=1&after=7');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await stepTo(page, 30);
  await page.getByTestId('god-btn').click();
  await expect(page.getByTestId('god-ends-track')).toContainText(/ends the replay/i);
  await page.screenshot({ path: path.join(out, 'god-ends-track.png') });
  await page.getByTestId('god-btn').click();
  await page.getByTestId('editor-btn').click();
  await expect(page.getByTestId('editor-ends-track')).toContainText(/ends the replay/i);
  await page.getByTestId('editor-close').click();
  const ger = await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.find((n) => n.name === 'nation.GER')?.id ?? 0);
  expect(ger).toBeGreaterThan(0);
  await page.evaluate((n) => window.__warsim!.view!.select(n), ger);
  await expect(page.getByTestId('take-ends-track')).toContainText(/ends the replay/i);
  await page.screenshot({ path: path.join(out, 'take-ends-track.png') });
  await page.getByTestId('take-control').click();
  await stepTo(page, 32);
  await expect(page.getByTestId('ticker')).toContainText('ended at your first intervention');
  await expect(page.getByTestId('track-next')).toHaveCount(0);
  await expect(page.getByTestId('take-ends-track')).toHaveCount(0);
  await page.screenshot({ path: path.join(out, 'ended-in-ticker.png') });
  expect(errors).toEqual([]);
});
