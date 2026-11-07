import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R43c (critic run 50, R50-N3): on a phone the merged loss row said "6 divisions lost at sea with their
// transports" and the names were only in its tooltip, which a phone cannot hover (nor a single row's full words, R43b).
// On a phone the first tap opens the row to its full words, on the screen; the next flies to the place and forgets it.
// At a desk a click flies at once (the tooltip has the words).

const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const LOST = Array.from({ length: 6 }, (_, i) => ({ kind: 'lostAtSea', id: 364 + i, nation: JAP, reason: 0, x: 1790, y: 400, tick: 855, seq: 9001 + i, name: `Square infantry division ${364 + i}` }));
const SUNK = { kind: 'transportsSunk', id: 380, nation: JAP, reason: 0, x: 1819, y: 387, tick: 855, seq: 9010, name: 'Square infantry division 380' };

for (const [view, width, height, panel] of [['phone', 390, 844, true], ['phone-free', 390, 844, false], ['land', 844, 390, true], ['desk', 1600, 900, true]] as const) {
  test(`${view}: an order row's full words where a tap reaches them`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    if (panel) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
      await expect(page.getByTestId('nation-panel')).toBeVisible();
    }
    await page.evaluate((news) => {
      (window.__warsim!.hud as unknown as { orderNews: { value: unknown[] } }).orderNews.value = news;
    }, [...LOST, SUNK]);
    const order = page.getByTestId('order-news');
    await expect(order).toHaveCount(2);
    const lost = order.nth(0);
    const sunk = order.nth(1);
    const cam = (): Promise<[number, number]> => page.evaluate(() => [window.__warsim!.view!.controller.cam.cx, window.__warsim!.view!.controller.cam.cy]);
    const before = await cam();
    if (view === 'desk') {
      // A desk: the brief, and a click flies at once and forgets the row.
      await expect(lost).toHaveText('6 divisions lost at sea with their transports');
      await lost.click();
      await expect(order).toHaveCount(1);
      await expect.poll(async () => Math.hypot((await cam())[0] - before[0], (await cam())[1] - before[1])).toBeGreaterThan(1);
      return;
    }
    // A phone: the first tap opens the merged row to its names, on the screen, and goes nowhere.
    await expect(lost).toHaveText('6 divisions lost at sea with their transports');
    await expect(lost).toHaveAttribute('aria-expanded', 'false');
    await lost.click();
    await expect(lost).toHaveAttribute('aria-expanded', 'true');
    for (let i = 0; i < 6; i++) await expect(lost).toContainText(`Square infantry division ${364 + i}`);
    expect(await cam()).toEqual(before);
    const box = (await lost.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    // Beside a panel, not under it.
    if (panel) {
      const p = (await page.getByTestId('nation-panel').boundingBox())!;
      const under = box.y < p.y + p.height && box.x < p.x + p.width;
      expect(under, `row top ${box.y}, panel bottom ${p.y + p.height}`).toBe(false);
    }
    await page.screenshot({ path: `test-results/orderRowsTap1938-${view}.png` });
    // The single row too (R43b's brief): its full words at a tap.
    await expect(sunk).toHaveText('380: transports sunk, the landing is over');
    await sunk.click();
    await expect(sunk).toContainText('Square infantry division 380: the transports of its landing were sunk');
    // One open at a time (a phone's room): the merged row is its brief again.
    await expect(lost).toHaveText('6 divisions lost at sea with their transports');
    // The next tap on the open row flies to the place and forgets it.
    await sunk.click();
    await expect(order).toHaveCount(1);
    await expect(order).toHaveAttribute('data-order', 'lostAtSea');
    await expect.poll(async () => Math.hypot((await cam())[0] - before[0], (await cam())[1] - before[1])).toBeGreaterThan(1);
  });
}
