import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R42b (critic run 49, R49-N3): beside a panel the merged loss row was cut before its names ("2 divisions lost
// at sea with their transports: Squar…"), and the at-port division's "landing is over" row was not on the screen.
// Japan's three in one hour: two lost at sea, one whose landing is over. Beside a panel at a desk both order rows are
// shown, the sea row given way (ADR-754's room); the loss of two by its count, whole on its line, the names in its
// tooltip. On a phone, upright or on its side (ADR-760, the user's: the newest event and the last order), the last.

const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const NEWS = [
  { kind: 'lostAtSea', id: 364, nation: JAP, reason: 0, x: 1790, y: 400, tick: 855, seq: 9001, name: 'Square infantry division 364' },
  { kind: 'lostAtSea', id: 365, nation: JAP, reason: 0, x: 1790, y: 400, tick: 855, seq: 9002, name: 'Square infantry division 365' },
  { kind: 'transportsSunk', id: 367, nation: JAP, reason: 0, x: 1819, y: 387, tick: 855, seq: 9003, name: 'Square infantry division 367' },
];

for (const [name, width, height, rows] of [['desk', 1600, 900, 2], ['land', 844, 390, 1], ['phone', 390, 844, 1]] as const) {
  test(`${name}: beside a panel the loss rows are whole and the last two shown`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    await page.evaluate((news) => {
      const hud = window.__warsim!.hud as unknown as { orderNews: { value: unknown[] } };
      hud.orderNews.value = news;
    }, NEWS);
    const order = page.getByTestId('order-news');
    await expect(order).toHaveCount(rows);
    if (rows === 2) {
      await expect(order.nth(0)).toHaveText('2 divisions lost at sea with their transports');
      await expect(order.nth(0)).toHaveAttribute('title', /Square infantry division 364, Square infantry division 365/);
      await expect(order.nth(1)).toHaveAttribute('data-order', 'transportsSunk');
      await expect(page.getByTestId('sea-battle-row').or(page.getByTestId('carrier-raid-row'))).toHaveCount(0);
    } else {
      await expect(order.nth(0)).toHaveAttribute('data-order', 'transportsSunk');
    }
    // Each on the screen; the loss of two whole on its line (not cut).
    const fit = await order.evaluateAll((els) => els.map((e) => {
      const line = e.querySelector('.ticker-line')!;
      const r = e.getBoundingClientRect();
      return { cut: line.scrollWidth > line.clientWidth + 1, text: line.textContent, top: r.top, bottom: r.bottom, right: r.right };
    }));
    for (const f of fit) {
      expect(f.top, `${f.text} on the screen`).toBeGreaterThanOrEqual(0);
      expect(f.bottom).toBeLessThanOrEqual(height);
      expect(f.right).toBeLessThanOrEqual(width);
    }
    if (rows === 2) expect(fit[0]!.cut, `"${fit[0]!.text}" whole`).toBe(false);
    await page.screenshot({ path: `test-results/orderRowsPanel1938-${name}.png` });
  });
}
