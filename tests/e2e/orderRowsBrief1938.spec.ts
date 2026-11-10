import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R43b (critic run 50, R50-N2): beside a panel a single order row was cut before its meaning ("Square infantry
// division 366: the transports of its…", a refusal "…365: not done: there is o…"). Each kind of news, and a refusal for
// each of its 20 reasons, of a division (told by its number) beside the longest name that can be told it (the land
// hero's, the sea hero's, an air wing's; a transport group is told by its number): whole on its line beside a panel at
// a desk, a phone on its side and upright, its full words in its tooltip.

const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const LAND = 'P.100 Ercole';
const SEA = 'Sovetsky Soyuz';
const AIR = 'Improved fighters';
// The refusals a fleet's order and a wing's can take (`RejectReason`): the rest are a land formation's.
const SEA_WHY = [2, 8, 9];
const AIR_WHY = [2, 10, 11];
const CASES: [string, number, string | null][] = [];
for (let r = 1; r <= 20; r++) {
  if (r === 19) CASES.push(['refused', r, null]);
  else if (r !== 8 && r !== 9 && r !== 10 && r !== 11) CASES.push(['refused', r, LAND]);
  if (SEA_WHY.includes(r)) CASES.push(['refused', r, SEA]);
  if (AIR_WHY.includes(r)) CASES.push(['refused', r, AIR]);
}
for (const [kind, reason] of [['repulsed', 0], ['landedAway', 0], ['unescorted', 0], ['leftLanding', 0], ['nextVoyage', 0], ['lostAtSea', 0], ['transportsSunk', 0], ['transportsSunk', 1], ['sentHome', 1], ['sentHome', 3]] as const) {
  CASES.push([kind, reason, LAND]);
}

for (const [view, width, height] of [['desk', 1600, 900], ['land', 844, 390], ['phone', 390, 844]] as const) {
  test(`${view}: beside a panel each single order row is whole, its words in the tooltip`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    const order = page.getByTestId('order-news');
    let k = 0;
    for (const [kind, reason, long] of CASES) {
      k++;
      const id = 1000 + k;
      const other = 5000 + k;
      const names = [`Square infantry division ${id}`, long ?? `Transport group ${other}`];
      const tags = [String(id), long ?? String(other)];
      // Two of the kind in different hours (not merged).
      const news = [
        { kind, id, nation: JAP, reason, x: 1790, y: 400, tick: 100 + 2 * k, seq: 2 * k, name: names[0] },
        { kind, id: other, nation: JAP, reason, x: 1790, y: 400, tick: 101 + 2 * k, seq: 2 * k + 1, name: names[1] },
      ];
      await page.evaluate((v) => {
        (window.__warsim!.hud as unknown as { orderNews: { value: unknown[] } }).orderNews.value = v;
      }, news);
      await expect(order.nth(0)).toHaveText(new RegExp(`^${id}(: | and )`));
      const rows = await order.evaluateAll((els) => els.map((e) => {
        const line = e.querySelector('.ticker-line')!;
        const r = e.getBoundingClientRect();
        return { cut: line.scrollWidth > line.clientWidth + 1, text: line.textContent ?? '', title: e.getAttribute('title') ?? '', top: r.top, bottom: r.bottom, right: r.right };
      }));
      expect(rows.length).toBe(2);
      for (const [i, r] of rows.entries()) {
        const what = `${kind} ${reason} "${r.text}"`;
        expect.soft(r.cut, `${what} whole`).toBe(false);
        expect(r.text, what).not.toContain('order.');
        expect(r.text.startsWith(tags[i]!), what).toBe(true);
        // The full words in the tooltip, longer than the row's.
        const full = r.title.split('\n')[0]!;
        expect(full.length, `${what}: ${full}`).toBeGreaterThan(r.text.length);
        expect(full).toContain(names[i]!);
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.bottom).toBeLessThanOrEqual(height);
        expect(r.right).toBeLessThanOrEqual(width);
      }
      if (kind === 'transportsSunk' && reason === 0) await page.screenshot({ path: `test-results/orderRowsBrief1938-${view}.png` });
    }
    // The refusal of the critic's shot (R50-N2): its gist, not "there is o…".
    await page.evaluate((n) => {
      (window.__warsim!.hud as unknown as { orderNews: { value: unknown[] } }).orderNews.value = [n];
    }, { kind: 'refused', id: 365, nation: JAP, reason: 7, x: 1790, y: 400, tick: 900, seq: 900, name: 'Square infantry division 365' });
    await expect(order).toHaveText('365: not done, no coast to land on');
  });
}

// ROADMAP R59c (critic run 60, R60-N3): an order row with a figure from its hour ("next voyage in about 6 days", told on
// 3 January) is dated as an event's row, so on the 5th it does not read as today's; whole beside a panel at each size.
for (const [view, width, height] of [['desk', 1600, 900], ['land', 844, 390], ['phone', 390, 844]] as const) {
  test(`${view}: a next voyage's row with its days is dated, whole beside a panel`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    const order = page.getByTestId('order-news');
    for (const [reason, days] of [[0, 6], [1, 9], [0, 1]] as const) {
      await page.evaluate((v) => {
        (window.__warsim!.hud as unknown as { orderNews: { value: unknown[] } }).orderNews.value = v;
      }, [
        { kind: 'nextVoyage', id: 328, nation: JAP, reason, x: 1790, y: 400, tick: 60, seq: 1, days, name: 'Square infantry division 328' },
        { kind: 'refused', id: 329, nation: JAP, reason: 7, x: 1790, y: 400, tick: 61, seq: 2, name: 'Square infantry division 329' },
      ]);
      await expect(order.nth(0)).toHaveText(new RegExp(`^3 January 1938 328: .*${days === 1 ? 'a day' : `${days} days`}`));
      // A row with no figure from its hour is not dated.
      await expect(order.nth(1)).toHaveText(/^329: /);
      const r = await order.nth(0).evaluate((e) => {
        const line = e.querySelector('.ticker-line')!;
        const b = e.getBoundingClientRect();
        return { cut: line.scrollWidth > line.clientWidth + 1, bottom: b.bottom, right: b.right, title: e.getAttribute('title') ?? '' };
      });
      expect(r.cut, `reason ${reason}, ${days} days: whole`).toBe(false);
      expect(r.bottom).toBeLessThanOrEqual(height);
      expect(r.right).toBeLessThanOrEqual(width);
      if (reason === 0 && days === 6) await page.screenshot({ path: `test-results/orderRowDated-${view}.png` });
    }
  });
}
