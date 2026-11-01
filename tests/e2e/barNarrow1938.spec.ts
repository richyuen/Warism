import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// PLAN 7.4f25 (the critic's N8): at 1024 × 600, playing a nation, the bar's "Playing Poland · 0
// selected" was cut to its first letter; it went onto a line of its own in the bar. Since PLAN
// 7.176a (the user's request, ADR-781) the label is in the top bar, in the tagline's place, and a
// click on it opens the played nation's panel: whole at 1024 × 600, at 1400 and at a phone's
// width; the bottom bar as tall playing as not.

const POL = NATIONS_1938.findIndex((n) => n.tag === 'POL') + 1;
const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
const ev = path.resolve('docs/evidence/7.4');

test("a played nation's label is in the top bar, whole, and opens its panel; the bottom bar no taller", async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(ev, { recursive: true });
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(async ([a, d]) => {
    const sim = window.__warsim!.sim;
    sim.command({ kind: 'declareWar', attacker: a!, defender: d! });
    await sim.step(1);
  }, [GER, POL]);
  await expect(page.getByTestId('war-banner').first()).toBeVisible({ timeout: 10_000 });
  const box = (sel: string): Promise<{ left: number; right: number; top: number; bottom: number }> =>
    page.locator(sel).first().evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
  // None played: the tagline.
  await expect(page.locator('.topbar-tagline')).toHaveText('World war simulator');
  const before = await box('[data-testid="bottombar"]');

  await page.evaluate((p) => window.__warsim!.view!.select(p), POL);
  await page.getByTestId('take-control').click();
  await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
  const label = page.getByTestId('player-label');
  await expect(label).toHaveText('Playing Poland · 0 selected');
  await expect(page.locator('.topbar-tagline')).toHaveCount(0);
  await expect(page.getByTestId('bottombar').getByTestId('player-label')).toHaveCount(0);
  // Whole, in the top bar.
  const cut = (): Promise<number> => label.evaluate((e) => e.scrollWidth - e.clientWidth);
  await expect.poll(cut, { message: "the label's text cut by (px)" }).toBeLessThanOrEqual(0);
  const top = await box('[data-testid="topbar"]');
  const l = await box('[data-testid="player-label"]');
  expect(l.left).toBeGreaterThanOrEqual(top.left);
  expect(l.right).toBeLessThanOrEqual(top.right);
  // The bottom bar as tall as with none played.
  const bar = await box('[data-testid="bottombar"]');
  expect(bar.bottom - bar.top, 'the bottom bar no taller').toBeCloseTo(before.bottom - before.top, 0);
  for (const b of await page.getByTestId('war-banner').evaluateAll((es) => es.map((e) => e.getBoundingClientRect().bottom))) expect(b, 'a war banner above the bar').toBeLessThanOrEqual(bar.top);
  await page.screenshot({ path: path.join(ev, 'f25-bar-1024-playing.png') });

  // A click on it opens Poland's panel.
  await label.click();
  await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', String(POL));
  await page.getByTestId('nation-close').click();

  // At 1400 px and at a phone's width: whole.
  for (const [w, h] of [
    [1400, 800],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width: w, height: h });
    await expect(label, `at ${w} px`).toBeInViewport();
    await expect.poll(cut, { message: `cut at ${w} px` }).toBeLessThanOrEqual(0);
  }
});
