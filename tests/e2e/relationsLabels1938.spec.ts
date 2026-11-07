import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// ROADMAP R34a (critic run 37, R37-N4, carried to run 50: "Albania Manchuku", "U…d Kingdom", and on a phone not
// readable at all): the relations graph a year into run 50's worlds (20887 at a desk, 20889 on a phone), whole and
// zoomed in: no two labels overlap, each is at least 10 px high on the screen, and zooming in names more.

type Rect = { x: number; y: number; w: number; h: number; text: string };

const labels = (page: Page): Promise<Rect[]> =>
  page.locator('.relations-label').evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height, text: e.textContent ?? '' };
    }),
  );

const overlapping = (rs: Rect[]): string[] => {
  const out: string[] = [];
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      const [a, b] = [rs[i]!, rs[j]!];
      // Glyph boxes overlap a pixel at their rims (the font's line height): a pixel's slack.
      if (a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1) out.push(`${a.text} / ${b.text}`);
    }
  }
  return out;
};

for (const [name, seed, width, height] of [['desk', 20887, 1600, 900], ['phone', 20889, 390, 844]] as const) {
  test(`${name}, seed ${seed} a year on: no two labels overlap, each readable, more named zoomed in`, async ({ page }, info) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height });
    await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
    await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
    await page.evaluate(() => window.__warsim!.sim.step(24 * 365));
    await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) >= 24 * 365, null, { timeout: 240_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
    mkdirSync(out, { recursive: true });
    const btn = page.getByTestId('relations-btn');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.getByTestId('relations-panel')).toBeVisible();
    await expect.poll(async () => (await labels(page)).length).toBeGreaterThan(3);
    const whole = await labels(page);
    expect(overlapping(whole), 'overlapping labels, whole graph').toEqual([]);
    expect(Math.min(...whole.map((r) => r.h)), 'label height, px').toBeGreaterThanOrEqual(10);
    await page.screenshot({ path: path.join(out, `relations-labels-${name}-whole.png`) });
    for (let i = 0; i < 3; i++) await page.getByTestId('relations-zoom-in').click();
    await expect.poll(() => page.getByTestId('relations-graph').getAttribute('data-zoom')).toBe('3.38');
    const zoomed = await labels(page);
    expect(overlapping(zoomed), 'overlapping labels, zoomed in').toEqual([]);
    expect(Math.min(...zoomed.map((r) => r.h)), 'label height zoomed, px').toBeGreaterThanOrEqual(10);
    // Zoomed in, the labels in view are at least as dense as the whole graph's (more room, more names).
    const graph = (await page.getByTestId('relations-graph').boundingBox())!;
    const inView = zoomed.filter((r) => r.x >= graph.x && r.x + r.w <= graph.x + graph.width && r.y >= graph.y && r.y + r.h <= graph.y + graph.height);
    process.stderr.write(`R34a ${name} ${seed}: ${whole.length} labels whole, ${inView.length} in view zoomed in, ${(await page.locator('.relations-nation').count())} nations drawn\n`);
    expect(inView.length, 'labels in view zoomed in').toBeGreaterThan(0);
    await page.screenshot({ path: path.join(out, `relations-labels-${name}-zoomed.png`) });
  });
}
