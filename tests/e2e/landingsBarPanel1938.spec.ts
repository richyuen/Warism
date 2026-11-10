import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R60a (critic run 61, R61-N1): at landscape sizes, once a landing was ordered, the landings bar (top middle) lay
// over the wide nation panel's head, so a tap on its × opened the landing (21103, England's four nearest Portsmouth sent
// to Bremerhaven; `critic/scripts/c61_x_closeblock.mjs`). The bar stands beside the panel: at each size the element at
// the ×'s centre is the ×, the two boxes do not meet, and a tap on the × closes the panel.

const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;

for (const [width, height] of [[667, 375], [844, 390], [932, 430], [1024, 500]] as const) {
  test(`${width} × ${height}: a landing's bar beside the nation panel, its × in reach`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=21103');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ENG, d: GER });
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
    await page.getByTestId('take-control').click();
    await page.getByTestId('release-control').waitFor();
    // The four nearest Portsmouth, over the sea to Bremerhaven.
    await page.evaluate((n) => {
      const v = window.__warsim!.view!;
      const sel = v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)![0] - 1023.5, v.formationPos(id)![1] - 275.5)] as const).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
      window.__warsim!.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: n })));
    }, ENG);
    await page.evaluate(() => window.__warsim!.sim.step(2));
    await expect(page.getByTestId('landings-bar')).toBeVisible();
    const m = await page.evaluate(() => {
      const box = (s: string): DOMRect => document.querySelector(s)!.getBoundingClientRect();
      const x = box('[data-testid=nation-close]');
      const at = document.elementFromPoint((x.left + x.right) / 2, (x.top + x.bottom) / 2) as HTMLElement | null;
      const p = box('[data-testid=nation-panel]');
      const b = box('[data-testid=landings-bar]');
      return { at: at?.dataset['testid'] ?? at?.className ?? null, panelRight: p.right, barLeft: b.left, barRight: b.right };
    });
    expect(m.at, 'the element at the ×').toBe('nation-close');
    expect(m.barLeft, 'the bar right of the panel').toBeGreaterThanOrEqual(m.panelRight);
    expect(m.barRight).toBeLessThanOrEqual(width);
    if (width === 844) await page.screenshot({ path: 'test-results/landingsBarPanel-844x390.png' });
    await page.getByTestId('nation-close').click({ timeout: 5_000 });
    await expect(page.getByTestId('nation-panel')).toHaveCount(0);
  });
}
