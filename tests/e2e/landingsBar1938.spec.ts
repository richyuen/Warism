import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R47b (the critic's idea since run 32: "a landing as one row"): the player's landings in a bar, a row each.
// Japan played (3517), its division nearest Tokyo sent to Shanghai: a row "… from Tokyo", gathering, its transports had and needed;
// opened, the division with what its panel says, hour by hour until it is over ("over: 1 landed"). On a landscape
// phone and a phone the bar is on the screen, clear of the top bar.

const { w: W, h: H } = SIZE_1938;
const JAP = NATIONS_1938.findIndex((n) => n.tag === 'JAP') + 1;
const CHI = NATIONS_1938.findIndex((n) => n.tag === 'CHI') + 1;
const SHANGHAI = cellOf(121.47, 31.23, W, H).map(Math.floor) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H);

/** Japan played, at war with China, its division nearest Tokyo ordered to Shanghai; that division. */
async function ordered(page: Page, w: number, h: number): Promise<number> {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('/?scenario=1938&paused=1&seed=3517');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAP, d: CHI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAP);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
  const div = await page.evaluate(({ n, x, y }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(n).filter((f) => !v.formationAfloat(f)).map((f) => [f, Math.hypot(v.formationPos(f)![0] - x, v.formationPos(f)![1] - y)] as const).sort((a, b) => a[1] - b[1])[0]![0];
  }, { n: JAP, x: TOKYO[0], y: TOKYO[1] });
  await expect(page.getByTestId('landings-bar'), 'no landing, no bar').toHaveCount(0);
  await page.evaluate(({ id, to }) => {
    const p = window.__warsim!.player!;
    p.clearSelection();
    p.boxSelect([id], false);
    p.click(to[0], to[1], -9999, -9999, false);
    p.clearSelection();
  }, { id: div, to: SHANGHAI });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('landing-row')).toHaveCount(1);
  return div;
}

const shotDir = (info: { outputPath: () => string }): string => {
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R47') : info.outputPath();
  mkdirSync(out, { recursive: true });
  return out;
};

test("a landing's row: gathering at Tokyo, then at sea, then over; its division says what its panel says each hour", async ({ page }, info) => {
  test.setTimeout(400_000);
  const div = await ordered(page, 1600, 900);
  const row = page.getByTestId('landing-row');
  await expect(row).toHaveAttribute('data-state', 'gathering');
  await expect(page.getByTestId('landing-title')).toContainText('from Tokyo');
  await expect(page.getByTestId('landing-ships')).toContainText(/transports \d+, \d+ needed/);
  await page.getByTestId('landing-toggle').click();
  await expect(page.getByTestId('landing-division')).toHaveCount(1);
  await page.screenshot({ path: path.join(shotDir(info), 'landings-desk-gathering.png') });
  // Hour by hour (12 at a time) until it is over: the division's line in the row is its panel's status.
  const states = new Set<string>();
  for (let h = 0; h < 24 * 40; h += 12) {
    const state = await row.getAttribute('data-state');
    states.add(state ?? '');
    if (state === 'over') break;
    if (state === 'sailing' && !states.has('shot-sea')) {
      states.add('shot-sea');
      await page.screenshot({ path: path.join(shotDir(info), 'landings-desk-sailing.png') });
    }
    await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
    await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div));
    const panel = (await page.getByTestId('formation-status').textContent())!.trim();
    await expect(page.getByTestId('landing-division-voyage'), `hour ${h}`).toHaveText(panel);
    await page.getByTestId('formation-close').click();
    await page.evaluate(() => window.__warsim!.sim.step(12));
    await page.waitForTimeout(150);
  }
  expect([...states], 'it gathered, sailed and was over').toEqual(expect.arrayContaining(['gathering', 'sailing', 'over']));
  await expect(row).toHaveAttribute('data-outcome', 'landed');
  await expect(page.getByTestId('landing-status')).toHaveText('over: 1 landed');
  await page.screenshot({ path: path.join(shotDir(info), 'landings-desk-over.png') });
  // A day on, the row is gone and the bar with it.
  await page.evaluate(() => window.__warsim!.sim.step(25));
  await expect(page.getByTestId('landings-bar')).toHaveCount(0);
});

// ROADMAP R47c: the row's cancel. Gathering at Tokyo, the cancel orders its division to the port: the landing is over,
// "cancelled: back at Tokyo"; the division in no landing, ashore. (At sea it turns back: `landingRow1938`.)
test("a landing's cancel from its row: over, cancelled, its division ashore and free", async ({ page }, info) => {
  test.setTimeout(240_000);
  const div = await ordered(page, 1600, 900);
  const row = page.getByTestId('landing-row');
  await expect(row).toHaveAttribute('data-state', 'gathering');
  await page.getByTestId('landing-toggle').click();
  await expect(page.getByTestId('landing-cancel')).toBeVisible();
  await page.getByTestId('landing-cancel').click();
  for (let h = 0; h < 48 && (await row.getAttribute('data-state')) !== 'over'; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.waitForTimeout(100);
  }
  await expect(row).toHaveAttribute('data-outcome', 'cancelled');
  await expect(page.getByTestId('landing-status')).toHaveText('cancelled: back at Tokyo');
  await expect(page.getByTestId('landing-cancel'), 'no cancel for one over').toHaveCount(0);
  await expect(page.getByTestId('landing-division-voyage'), "over: the landing's words gone").toHaveText('');
  await page.screenshot({ path: path.join(shotDir(info), 'landings-desk-cancelled.png') });
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div));
  await expect(page.getByTestId('formation-status')).not.toHaveAttribute('data-voyage', /gathering|waiting|toPort|ready|atSea/);
});

for (const [name, w, h] of [['landscape', 844, 390], ['phone', 390, 844]] as const) {
  test(`a landing's row on a ${name}: on the screen, clear of the top bar, opened to its division`, async ({ page }, info) => {
    test.setTimeout(240_000);
    await ordered(page, w, h);
    await page.getByTestId('landing-toggle').click();
    await expect(page.getByTestId('landing-division')).toHaveCount(1);
    const bar = (await page.getByTestId('landings-bar').boundingBox())!;
    const top = (await page.locator('.topbar').boundingBox())!;
    expect(bar.x, 'inside the view').toBeGreaterThanOrEqual(0);
    expect(bar.x + bar.width, 'inside the view').toBeLessThanOrEqual(w);
    expect(bar.y, 'under the top bar').toBeGreaterThanOrEqual(top.y + top.height);
    // Clear of the ranking where it shows.
    const ranking = page.getByTestId('stats-ranking');
    if (await ranking.isVisible()) {
      const r = (await ranking.boundingBox())!;
      expect(bar.x + bar.width <= r.x || r.x + r.width <= bar.x || bar.y + bar.height <= r.y, 'clear of the ranking').toBe(true);
    }
    await page.screenshot({ path: path.join(shotDir(info), `landings-${name}.png`) });
  });
}
