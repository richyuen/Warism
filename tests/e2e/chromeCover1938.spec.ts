import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R94a (ADR-1084): how much of the map the panels cover. Open from the start the ranking was 8 % of a
// 1600 × 900 view, the panels 13.3 % together (17.6 % with a year and a half of news and wars). The ranking is closed
// on a desk until asked for: 5.4 % at the start.

const PANELS = ['topbar', 'topclock', 'bottombar', 'map-legend', 'war-banners', 'ticker', 'stats-ranking'] as const;

/** The share of the view under the panels' painted boxes (each panel and what it holds), counted on a grid of 4 px, and each panel's own. */
function cover(page: Page): Promise<{ share: number; by: Record<string, number> }> {
  return page.evaluate((PANELS) => {
    const [W, H] = [innerWidth, innerHeight];
    const gw = Math.ceil(W / 4);
    const gh = Math.ceil(H / 4);
    const grid = new Uint8Array(gw * gh);
    const by: Record<string, number> = {};
    for (const id of PANELS) {
      let n = 0;
      for (const root of document.querySelectorAll(`[data-testid="${id}"]`)) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if ((cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent') && cs.backgroundImage === 'none') continue;
          const r = el.getBoundingClientRect();
          for (let y = Math.max(0, Math.floor(r.top / 4)); y < Math.min(gh, Math.ceil(r.bottom / 4)); y++) {
            for (let x = Math.max(0, Math.floor(r.left / 4)); x < Math.min(gw, Math.ceil(r.right / 4)); x++) {
              if (grid[y * gw + x]) continue;
              grid[y * gw + x] = 1;
              n++;
            }
          }
        }
      }
      by[id] = (100 * n) / grid.length;
    }
    return { share: (100 * grid.reduce((a, b) => a + b, 0)) / grid.length, by };
  }, PANELS);
}

for (const [W, H, bar] of [[1600, 900, 6], [1920, 1080, 5], [1280, 800, 8]] as const) {
  test(`at ${W} × ${H} the panels cover at most ${bar} % of the map at the start; the ranking is what a player opens`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: W, height: H });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await expect(page.getByTestId('bottombar')).toBeVisible();
    const start = await cover(page);
    process.stderr.write(`${W} × ${H}: the panels cover ${start.share.toFixed(2)} % at the start (${Object.entries(start.by).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')})\n`);
    expect(start.by['stats-ranking'], 'no ranking until asked for').toBe(0);
    expect(start.by['bottombar'], 'the bar is there').toBeGreaterThan(1);
    expect(start.share, 'the panels at the start').toBeLessThanOrEqual(bar);
    // Asked for: the ranking is the largest of the panels, and the measure sees it.
    await page.getByTestId('stats-btn').click();
    await expect(page.getByTestId('rank-row')).toHaveCount(15);
    const open = await cover(page);
    process.stderr.write(`${W} × ${H}: with the ranking ${open.share.toFixed(2)} % (the ranking ${open.by['stats-ranking']!.toFixed(2)})\n`);
    expect(open.by['stats-ranking']!, 'the ranking, open').toBeGreaterThan(4);
    expect(open.share).toBeGreaterThan(start.share + 4);
  });
}

// ROADMAP R94c (ADR-1086): on a desk pause, the speed and the date are the clock, a plate at the top's middle; the bar
// keeps the rest in its order. On a phone they are in the bar as they were (ADR-763, PLAN 7.169).
const CLOCK = ['pause-btn', 'speed-down', 'speed-label', 'speed-up', 'date-label'] as const;
const BAR = ['god-btn', 'mapmode-btn', 'stats-btn', 'history-btn', 'relations-btn', 'editor-btn', 'settings-btn'] as const;

for (const [W, H] of [[1600, 900], [1920, 1080], [1280, 800], [1024, 600]] as const) {
  test(`at ${W} × ${H} the clock is a plate at the top's middle, one row, clear of the title and the alert's place; it works`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: W, height: H });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    const clock = page.getByTestId('topclock');
    await expect(clock).toBeVisible();
    for (const id of CLOCK) await expect(clock.getByTestId(id), `${id} in the clock`).toHaveCount(1);
    for (const id of CLOCK) await expect(page.getByTestId('bottombar').getByTestId(id), `${id} not in the bar`).toHaveCount(0);
    for (const id of BAR) await expect(page.getByTestId('bottombar').getByTestId(id), `${id} in the bar`).toHaveCount(1);
    // In the bar, the user's order (ADR-763) of what is left.
    const order = await page.getByTestId('bottombar').evaluate((bar, BAR) => [...bar.querySelectorAll('[data-testid]')].map((e) => e.getAttribute('data-testid')!).filter((id) => (BAR as readonly string[]).includes(id)), BAR);
    expect(order).toEqual([...BAR]);
    const c = (await clock.boundingBox())!;
    const title = (await page.getByTestId('topbar').boundingBox())!;
    // At the middle, at the top, one row, in the view, and clear of the title's plate.
    expect(Math.abs(c.x + c.width / 2 - W / 2), 'at the middle').toBeLessThanOrEqual(1);
    expect(c.y).toBeLessThan(16);
    expect(c.height, 'one row').toBeLessThan(44);
    expect(c.x, 'clear of the title').toBeGreaterThan(title.x + title.width + 4);
    expect(c.x + c.width).toBeLessThanOrEqual(W);
    // The alert of a strike stands below it (3.4rem from the top).
    const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    expect(c.y + c.height, 'above the alert\'s place').toBeLessThanOrEqual(3.4 * rem);
    // The two bars together are no more of the view than the one bar was (2.93 % of 1600 × 900; the same buttons).
    const share = await cover(page);
    process.stderr.write(`${W} × ${H}: the clock ${share.by['topclock']!.toFixed(2)} %, the bar ${share.by['bottombar']!.toFixed(2)} %\n`);
    if (W === 1600) expect(share.by['topclock']! + share.by['bottombar']!).toBeLessThanOrEqual(2.95);
    // It works: the game runs and pauses, the speed goes up and down, the date moves.
    const date = await page.getByTestId('date-label').textContent();
    await page.getByTestId('speed-up').click();
    await page.getByTestId('pause-btn').click();
    await expect(page.getByTestId('pause-btn')).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => page.getByTestId('date-label').textContent(), { timeout: 30_000 }).not.toBe(date);
    await page.getByTestId('pause-btn').click();
    await expect(page.getByTestId('pause-btn')).toHaveAttribute('aria-pressed', 'true');
    // The clock's width is kept as its words change (the reserved widths of ADR-763): it does not jump.
    const after = (await clock.boundingBox())!;
    expect(Math.abs(after.width - c.width), 'the clock keeps its width').toBeLessThanOrEqual(1);
  });
}

test('on a phone pause, the speed and the date are in the bar as they were; no clock', async ({ page }) => {
  test.setTimeout(120_000);
  for (const [W, H] of [[390, 844], [844, 390]] as const) {
    await page.setViewportSize({ width: W, height: H });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await expect(page.getByTestId('topclock'), `${W} × ${H}`).toHaveCount(0);
    for (const id of [...CLOCK, ...BAR]) await expect(page.getByTestId('bottombar').getByTestId(id), `${W} × ${H}: ${id} in the bar`).toHaveCount(1);
  }
});
