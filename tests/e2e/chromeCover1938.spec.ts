import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R94a (ADR-1084): how much of the map the panels cover. Open from the start the ranking was 8 % of a
// 1600 × 900 view, the panels 13.3 % together (17.6 % with a year and a half of news and wars). The ranking is closed
// on a desk until asked for: 5.4 % at the start.

const PANELS = ['topbar', 'bottombar', 'map-legend', 'war-banners', 'ticker', 'stats-ranking'] as const;

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
