import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { RANK_METRICS } from '../../src/shared/ranking';

// ROADMAP R34b (the critic, carried to run 50: "French Equatorial…" and "Anglo-Egyptian S…" cut in every desk
// shot): the ranking is as wide as its longest row up to 20rem, so every name of the 1938 start is whole in every
// list of the present, at a desk and on a phone; the panel stays inside the view; each name's title is the name.

const rows = (page: Page): Promise<{ text: string; title: string; cut: boolean }[]> =>
  page.locator('.rank-name').evaluateAll((els) =>
    els.map((e) => ({ text: (e.firstChild?.textContent ?? '').trim(), title: e.getAttribute('title') ?? '', cut: e.scrollWidth > e.clientWidth + 1 })),
  );

for (const [name, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`${name}: every name of the 1938 start whole in every list, the panel in view`, async ({ page }, info) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=20895');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
    mkdirSync(out, { recursive: true });
    // On a phone the ranking is folded to its title (ADR-760): opened.
    const toggle = page.getByTestId('ranking-toggle');
    if (await toggle.isVisible()) await toggle.click();
    await expect(page.getByTestId('rank-row').first()).toBeVisible();
    const seen = new Set<string>();
    for (const metric of RANK_METRICS) {
      await page.getByTestId('rank-metric').selectOption(metric);
      await expect(page.getByTestId('stats-ranking')).toHaveAttribute('data-metric', metric);
      const rs = await rows(page);
      for (const r of rs) seen.add(r.text);
      expect(rs.filter((r) => r.cut).map((r) => r.text), `${metric}: names cut`).toEqual([]);
      expect(rs.filter((r) => r.title !== r.text).map((r) => r.text), `${metric}: each title its name`).toEqual([]);
      const box = (await page.getByTestId('stats-ranking').boundingBox())!;
      expect(box.x, `${metric}: in view`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${metric}: in view`).toBeLessThanOrEqual(width);
      expect(box.width, `${metric}: at most 20rem and its rim`).toBeLessThanOrEqual(20 * 16 + 1);
      if (metric === 'land') await page.screenshot({ path: path.join(out, `ranking-names-${name}.png`) });
    }
    // The long ones the critic named among them.
    expect([...seen].filter((t) => t.length >= 20).length, 'long names seen').toBeGreaterThan(1);
    expect(seen.has('French Equatorial Africa') || seen.has('Anglo-Egyptian Sudan'), 'the critic\'s names').toBe(true);
  });
}
