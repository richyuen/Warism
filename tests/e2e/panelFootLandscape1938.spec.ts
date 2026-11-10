import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R59d (critic run 60, R60-N4): at landscape sizes from 667 × 375 to 1024 × 500 the nation panel's foot ran under
// the bottom bar, its last row half hidden (`c58_peacebtn` 30403, Germany at war with Poland, the Actions tab). Playing
// Germany, at each of the critic's sizes and on each tab: the panel's box ends above the bar's top, so its last row is
// whole when scrolled to the end.

const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
const SIZES = [[667, 375], [740, 360], [844, 390], [932, 430], [1024, 500]] as const;

for (const [width, height] of SIZES) {
  test(`${width} × ${height}: the nation panel's foot above the bottom bar, its last row whole`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=30403');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
    await page.getByTestId('take-control').click();
    await page.getByTestId('release-control').waitFor();
    for (const tab of ['overview', 'economy', 'actions', 'build'] as const) {
      await page.getByTestId(`tab-${tab}`).click();
      const m = await page.evaluate(() => {
        const panel = document.querySelector<HTMLElement>('[data-testid=nation-panel]')!;
        panel.scrollTop = panel.scrollHeight;
        const p = panel.getBoundingClientRect();
        const bar = document.querySelector('.bottombar')!.getBoundingClientRect();
        // The last control or row the panel shows, scrolled to the end.
        const rows = [...panel.querySelectorAll<HTMLElement>('button, select, .god-row, tr, li')].filter((e) => e.offsetParent !== null);
        const last = rows.reduce((a, e) => (e.getBoundingClientRect().bottom > a ? e.getBoundingClientRect().bottom : a), 0);
        return { panelBottom: p.bottom, barTop: bar.top, last };
      });
      const what = `${tab}: panel foot ${m.panelBottom.toFixed(1)}, bar top ${m.barTop.toFixed(1)}, last row ${m.last.toFixed(1)}`;
      expect(m.panelBottom, what).toBeLessThanOrEqual(m.barTop);
      expect(m.last, what).toBeLessThanOrEqual(m.barTop);
      if (tab === 'actions') await page.screenshot({ path: `test-results/panelFoot-${width}x${height}.png` });
    }
  });
}
