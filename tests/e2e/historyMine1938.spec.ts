import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { filterHistory, NO_FILTER, WAR_KINDS } from '../../src/shared/history';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R53f (critic run 54's idea from Europa Universalis' message log): History's "My wars only", offered while a
// nation is played, keeps the war rows naming it. Germany played, at war with Poland, two months on.

const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
const POL = NATIONS_1938.findIndex((n) => n.tag === 'POL') + 1;
const count = async (page: Page): Promise<number> => page.getByTestId('history-row').count();

for (const [name, width, height] of [['desk', 1400, 800], ['phone', 390, 844]] as const) {
  test(`History's "My wars only" keeps the played nation's war rows (${name})`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R53f') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.evaluate(({ g, p }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: g, defender: p }), { g: GER, p: POL });
    await page.evaluate(() => window.__warsim!.sim.step(24 * 60));
    // Not played: no box.
    await page.getByTestId('history-btn').click();
    await expect(page.getByTestId('history-panel')).toBeVisible();
    await expect(page.getByTestId('history-mine')).toHaveCount(0);
    await page.getByTestId('history-close').click();
    // Germany played: the box, and with it ticked its war rows alone.
    await page.evaluate((g) => window.__warsim!.hud.command({ kind: 'setPlayer', nation: g }), GER);
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.waitForFunction((g) => window.__warsim!.hud.stats.value?.player === g, GER, { timeout: 20_000 });
    const rows = await page.evaluate(() => window.__warsim!.sim.history());
    const startDay = await page.evaluate(() => window.__warsim!.hud.startDay);
    const mine = filterHistory(rows, { ...NO_FILTER, mine: GER }, startDay);
    expect(mine.length, "Germany's war rows").toBeGreaterThan(0);
    expect(mine.length, 'fewer than all').toBeLessThan(rows.length);
    await page.getByTestId('history-btn').click();
    const box = page.getByTestId('history-mine');
    await expect(box).toBeVisible();
    await expect(box).toBeInViewport();
    await box.check();
    await expect.poll(() => count(page), { timeout: 20_000 }).toBe(Math.min(mine.length, 400));
    await expect(page.getByTestId('history-count')).toContainText(`${mine.length} of ${rows.length}`);
    const kinds = await page.getByTestId('history-row').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-kind'))));
    expect(kinds.every((k) => WAR_KINDS.has(k)), `kinds ${[...new Set(kinds)].join(',')}`).toBe(true);
    await expect(page.getByTestId('history-row').filter({ hasText: 'Germany declared war on Poland' })).toHaveCount(1);
    await page.screenshot({ path: path.join(out, `history-mine-${name}.png`) });
    await box.uncheck();
    await expect.poll(() => count(page)).toBe(Math.min(rows.length, 400));
  });
}
