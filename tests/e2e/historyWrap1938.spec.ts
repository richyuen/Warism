import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// ROADMAP R34c (critic run 32, R32-N3, carried to run 50: "...Soviet Union lost 42 aircraft, / Iraq 18", the
// second line under the dates): a History row's text wraps in its own column. Seed 20429 (run 50's) eighteen months
// on, desk and phone: every line of every row's text starts right of its date, and the rows that wrap are counted.
// (R32-N3's other half, a refusal cut beside a panel, is R43b's `orderRowsBrief1938`.)

for (const [name, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`${name}: a History row's text wraps beside its date, never under it`, async ({ page }, info) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=20429');
    await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
    await page.evaluate(() => window.__warsim!.sim.step(24 * 547));
    await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) >= 24 * 547, null, { timeout: 240_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
    mkdirSync(out, { recursive: true });
    const btn = page.getByTestId('history-btn');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.getByTestId('history-panel')).toBeVisible();
    await expect.poll(() => page.getByTestId('history-row').count()).toBeGreaterThan(20);
    const rows = await page.getByTestId('history-row').evaluateAll((els) =>
      els.map((li) => {
        const date = li.querySelector('.history-date')!;
        const dr = date.getBoundingClientRect();
        // Every line box of what follows the date, whatever holds it.
        const range = document.createRange();
        range.setStartAfter(date);
        range.setEnd(li, li.childNodes.length);
        const lines = [...range.getClientRects()].filter((r) => r.width > 0.5);
        // Lines by the height they take, at the row's line height.
        const lh = parseFloat(getComputedStyle(li).lineHeight) || 20;
        const span = Math.max(...lines.map((r) => r.bottom)) - Math.min(...lines.map((r) => r.top));
        return { text: li.textContent ?? '', dateRight: dr.right, left: Math.min(...lines.map((r) => r.left)), lines: Math.round(span / lh) };
      }),
    );
    const under = rows.filter((r) => r.left < r.dateRight - 1).map((r) => r.text);
    const wrapped = rows.filter((r) => r.lines > 1).length;
    process.stderr.write(`R34c ${name}: ${rows.length} rows, ${wrapped} of two lines or more, ${under.length} under the date\n`);
    expect(wrapped, 'rows that wrap (the case is there)').toBeGreaterThan(0);
    expect(under.slice(0, 5), `${under.length} rows with a line under the date`).toEqual([]);
    await page.screenshot({ path: path.join(out, `history-wrap-${name}.png`) });
  });
}
