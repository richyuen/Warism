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

/** A case: the played nation, its foe, its divisions nearest `from` (cells) ordered by one click to `to` (cells). */
interface Case { seed: number; nat: number; foe: number; from: [number, number]; to: [number, number]; n: number }
const JAP_SHANGHAI: Case = { seed: 3517, nat: JAP, foe: CHI, from: [TOKYO[0], TOKYO[1]], to: SHANGHAI, n: 1 };

/** Japan played (or the case's nation), at war with China, its `n` divisions nearest Tokyo ordered to Shanghai by one click; the first. */
async function ordered(page: Page, w: number, h: number, c: Case = JAP_SHANGHAI): Promise<number> {
  const { nat: JAPN, foe: CHIN, n } = c;
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`/?scenario=1938&paused=1&seed=${c.seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAPN, d: CHIN });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), JAPN);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('release-control')).toBeVisible();
  await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
  const divs = await page.evaluate(({ nat, x, y, k }) => {
    const v = window.__warsim!.view!;
    return v.formationsOf(nat).filter((f) => !v.formationAfloat(f)).map((f) => [f, Math.hypot(v.formationPos(f)![0] - x, v.formationPos(f)![1] - y)] as const).sort((a, b) => a[1] - b[1]).slice(0, k).map((d) => d[0]);
  }, { nat: JAPN, x: c.from[0], y: c.from[1], k: n });
  const div = divs[0]!;
  await expect(page.getByTestId('landings-bar'), 'no landing, no bar').toHaveCount(0);
  await page.evaluate(({ ids, to }) => {
    const p = window.__warsim!.player!;
    p.clearSelection();
    p.boxSelect(ids, false);
    p.click(to[0], to[1], -9999, -9999, false);
    p.clearSelection();
  }, { ids: divs, to: c.to });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  if (n === 1) await expect(page.getByTestId('landing-row')).toHaveCount(1);
  else await expect(page.getByTestId('landing-row').first()).toBeVisible();
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

// ROADMAP R47c, R48a: the row's cancel. Gathering at Tokyo, the cancel stops its division where it stands (critic run 51,
// R51-N1: it marched a week on to the port while the row said "back at"): over in the hour, "cancelled: stopped where
// they stood"; the division in no landing, ashore, where it was. (At sea it turns back: `landingRow1938`.)
test("a landing's cancel from its row: over, cancelled, its division ashore and free", async ({ page }, info) => {
  test.setTimeout(240_000);
  const div = await ordered(page, 1600, 900);
  const row = page.getByTestId('landing-row');
  await expect(row).toHaveAttribute('data-state', 'gathering');
  await page.getByTestId('landing-toggle').click();
  await expect(page.getByTestId('landing-cancel')).toBeVisible();
  const before = await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div);
  await expect(page.getByTestId('landing-cancel')).toHaveAttribute('title', /those ashore stop where they stand/);
  await page.getByTestId('landing-cancel').click();
  for (let h = 0; h < 48 && (await row.getAttribute('data-state')) !== 'over'; h++) {
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.waitForTimeout(100);
  }
  await expect(row).toHaveAttribute('data-outcome', 'cancelled');
  await expect(page.getByTestId('landing-status')).toHaveText('cancelled: stopped where they stood; the AI commands them again');
  await expect(page.getByTestId('landing-cancel'), 'no cancel for one over').toHaveCount(0);
  await expect(page.getByTestId('landing-division-voyage'), "over: the landing's words gone").toHaveText('');
  await page.screenshot({ path: path.join(shotDir(info), 'landings-desk-cancelled.png') });
  await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), div);
  await expect(page.getByTestId('formation-panel')).toHaveAttribute('data-formation', String(div));
  await expect(page.getByTestId('formation-status')).not.toHaveAttribute('data-voyage', /gathering|waiting|toPort|ready|atSea/);
  const after = await page.evaluate((id) => window.__warsim!.view!.formationPos(id), div);
  expect(Math.hypot(after![0] - before![0], after![1] - before![1]), 'where it stood').toBeLessThan(0.6);
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

// ROADMAP R48c (critic run 51, R51-N3): at 844 × 390 the bar's 40 vh hid an open row's last division and its cancel in
// its scroll. The critic's three in one click: the open row's cancel (in its head) and each of its divisions on the screen,
// none clipped by the bar.
test("a landing's open row on a landscape phone: its cancel and every division on the screen", async ({ page }, info) => {
  test.setTimeout(240_000);
  // The critic's case (`c51_lbar.mjs 21107 GER ENG …`): Germany's three nearest Hamburg to Norwich, one landing.
  const GER = NATIONS_1938.findIndex((x) => x.tag === 'GER') + 1;
  const ENG = NATIONS_1938.findIndex((x) => x.tag === 'ENG') + 1;
  await ordered(page, 844, 390, { seed: 21107, nat: GER, foe: ENG, from: [1100.5, 267.5], to: [1031.5, 266.5], n: 3 });
  const row = page.getByTestId('landing-row').first();
  await row.getByTestId('landing-toggle').click();
  const divisions = row.getByTestId('landing-division');
  expect(await divisions.count(), 'divisions in the open row').toBeGreaterThan(1);
  const bar = (await page.locator('.landings-bar > ol').boundingBox())!;
  const inside = async (box: { x: number; y: number; width: number; height: number } | null, what: string): Promise<void> => {
    expect(box, what).not.toBeNull();
    expect(box!.y, `${what}: under the bar's top`).toBeGreaterThanOrEqual(bar.y - 1);
    expect(box!.y + box!.height, `${what}: above the bar's foot`).toBeLessThanOrEqual(bar.y + bar.height + 1);
    expect(box!.y + box!.height, `${what}: on the screen`).toBeLessThanOrEqual(390);
  };
  await inside(await row.getByTestId('landing-cancel').boundingBox(), 'the cancel');
  for (let k = 0; k < (await divisions.count()); k++) await inside(await divisions.nth(k).boundingBox(), `division ${k + 1}`);
  await page.screenshot({ path: path.join(shotDir(info), 'landings-landscape-open3.png') });
});
