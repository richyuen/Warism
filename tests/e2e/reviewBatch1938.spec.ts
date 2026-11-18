import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import en from '../../src/ui/i18n/en.json' with { type: 'json' };

// ROADMAP Batch 38 (the review of the game's pictures; ADR-1101 to ADR-1104): what a player is told of what is on
// the screen. R110 and R115 the war banners (their rows: `warBannerRows1938`), R111 the units' signs, R113 the first
// cue, R114 a tag's bar, R116 the settings' two parts, R119 the phone's top bar, R120 a file's input.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const ready = (): boolean => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null;

test('a war banner says who fights whom and how it stands; the legend says what the units\' signs are', async ({ page }, info) => {
  test.setTimeout(180_000);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R110') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  // No cue on a game opened by its link (R113).
  await expect(page.getByTestId('first-cue')).toHaveCount(0);
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(24 * 6));
  await page.waitForFunction(() => window.__warsim!.view!.lastTick >= 24 * 6, null, { timeout: 120_000 });
  // The newest war's banner first, in the one row (R110); its title in words, its score in figures (R115).
  // (The banners follow the stats, which come once a second.)
  await expect(page.locator('[data-testid="war-banner"][title*="Germany"]')).toBeVisible({ timeout: 20_000 });
  const first = page.getByTestId('war-banner').first();
  const title = (await first.getAttribute('title'))!;
  expect(title).toContain('Germany');
  expect(title).toContain('(attacking) against Poland');
  expect(title).toMatch(/War score (even|\d+ to the (attackers|defenders))/);
  await expect(first.getByTestId('war-score-n')).toHaveText(/^[+-]?\d+$/);
  const tops = await page.getByTestId('war-banner').evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
  expect(tops, 'one row of banners').toHaveLength(1);
  // The units' signs behind the legend's "?" (R111): not there until asked, so the legend covers no more of the map.
  await expect(page.getByTestId('legend-units')).toHaveCount(0);
  await page.getByTestId('legend-signs').click();
  await expect(page.getByTestId('legend-units')).toHaveText(en['legend.units']);
  await page.screenshot({ path: path.join(out, 'banners-legend.png') });
  await page.getByTestId('legend-signs').click();
  await expect(page.getByTestId('legend-units')).toHaveCount(0);
  // A nation's panel says what the second figure of its army is (R111).
  await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
  await expect(page.getByTestId('stat-army')).toContainText(/\d · \d+ formations/);
  await page.keyboard.press('Escape');
  // A tag at a battle has the bar of its men (R114): each tag its share, between none and all.
  const tagged = await page.evaluate((n) => {
    const v = window.__warsim!.view!;
    const f = v.formationsOf(n).find((x) => v.formationEngaged(x)) ?? v.formationsOf(n)[0]!;
    const p = v.formationPos(f)!;
    v.controller.set({ cx: p[0], cy: p[1], scale: (v.geo.kmPerCell * 1000) / 100 });
    return f;
  }, id('GER'));
  expect(tagged).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
  const shares = await page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.draw();
    return v.tagRects.map((t) => t.share ?? -1);
  });
  expect(shares.length, 'tags in view').toBeGreaterThan(2);
  for (const s of shares) {
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(1.5);
  }
  await page.getByTestId('legend-signs').click();
  await expect(page.getByTestId('legend-units')).toHaveText(en['legend.unitsClose']);
  await page.screenshot({ path: path.join(out, 'tags-bars.png') });
});

test('the first cue: once, for a game started from the title screen; closed by Resume', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  // As the title screen leaves it as a game is started.
  await page.addInitScript(() => {
    if (localStorage.getItem('warsim.cueSeen') === null) sessionStorage.setItem('warsim.cueAsked', '1');
  });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  const cue = page.getByTestId('first-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toContainText(en['cue.resume']);
  // The map under it takes the click: only its button is the cue's.
  const box = (await cue.boundingBox())!;
  const under = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, { x: box.x + 20, y: box.y + 12 });
  expect(under).toBe('CANVAS');
  await page.evaluate(() => window.__warsim!.hud.togglePause());
  await expect(cue).toHaveCount(0);
  await page.evaluate(() => window.__warsim!.hud.togglePause());
  await page.reload();
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  await expect(page.getByTestId('first-cue')).toHaveCount(0);
});

test('the settings in two headed parts; a file\'s input in the game\'s look; the date in a phone\'s top bar', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  await expect(page.getByTestId('topbar-date')).toBeHidden();
  await page.getByTestId('settings-btn').click();
  const heads = await page.locator('[data-testid="settings-panel"] .settings-part').allTextContents();
  expect(heads).toEqual([en['settings.display'], en['settings.newGame']]);
  // The panel's foot clear of its last row.
  const pad = await page.getByTestId('settings-panel').evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(pad).toBeGreaterThan(8);
  await page.getByTestId('settings-btn').click();
  await page.getByTestId('editor-btn').click();
  const file = page.getByTestId('editor-import-file');
  await expect(file).toBeVisible();
  const button = await file.evaluate((el) => {
    const s = getComputedStyle(el, '::file-selector-button');
    return { radius: s.borderTopLeftRadius, cursor: s.cursor, font: s.fontFamily === getComputedStyle(el).fontFamily };
  });
  expect(button.radius).not.toBe('0px');
  expect(button.cursor).toBe('pointer');
  expect(button.font).toBe(true);
  await page.getByTestId('editor-btn').click();
  // A phone: the date and "Paused" in the top bar.
  await page.setViewportSize({ width: 390, height: 844 });
  const date = page.getByTestId('topbar-date');
  await expect(date).toBeVisible();
  await expect(date).toContainText('1938');
  await expect(date).toContainText(en['bar.paused']);
  const [bar, d] = [(await page.getByTestId('topbar').boundingBox())!, (await date.boundingBox())!];
  expect(d.x + d.width, 'the date inside the bar').toBeLessThanOrEqual(bar.x + bar.width + 0.5);
  expect(d.y).toBeGreaterThanOrEqual(bar.y);
});

// ROADMAP R121 (critic run 73, R73-N1): with one row of banners, newest first, the wars a played nation led were
// behind "+n". The row is the played nation's wars first, then the largest by their sides' men.
test("the played nation's war is on the row of banners, however small; with none played, the largest wars", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  // Three wars more than the two of the start; Bulgaria's on Albania the smallest of the five.
  const pairs = [['GER', 'POL'], ['ITA', 'YUG'], ['BUL', 'ALB']].map(([a, d]) => [id(a!), id(d!)] as const);
  await page.evaluate((pairs) => {
    for (const [attacker, defender] of pairs) window.__warsim!.sim.command({ kind: 'declareWar', attacker, defender });
  }, pairs);
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('war-banner')).toHaveCount(3);
  // The war of the fewest men of its two sides, and the one of the most.
  const wars = await page.evaluate(() => {
    const st = window.__warsim!.hud.stats.value!;
    const men = new Map(st.nations.map((n) => [n.id, n.men]));
    return st.wars.map((w) => ({ id: w.id, lead: w.attackers[0]!, men: [...w.attackers, ...w.defenders].reduce((s, n) => s + (men.get(n) ?? 0), 0) })).sort((a, b) => a.men - b.men);
  });
  expect(wars.length).toBeGreaterThanOrEqual(5);
  const [least, most] = [wars[0]!, wars[wars.length - 1]!];
  const banner = (war: number) => page.locator(`[data-testid="war-banner"][data-war="${war}"]`);
  await expect(banner(least.id), 'the smallest war behind "+n" with none played').toHaveCount(0);
  await expect(page.getByTestId('war-banner').first()).toHaveAttribute('data-war', String(most.id));
  // Its leader played: its war first.
  await page.evaluate((n) => window.__warsim!.view!.select(n), least.lead);
  await page.getByTestId('take-control').click();
  await expect(page.getByTestId('player-label')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('war-banner').first()).toHaveAttribute('data-war', String(least.id), { timeout: 20_000 });
  await expect(page.getByTestId('war-banner')).toHaveCount(3);
});

// ROADMAP R126 (critic run 73, R73-N6): on a phone the opened banners stood on the ticker's rows, and the first cue on
// the ranking's toggle.
test('a phone: the ticker gives way to the opened banners; the first cue stands under the toggles', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (localStorage.getItem('warsim.cueSeen') === null) sessionStorage.setItem('warsim.cueAsked', '1');
  });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(ready, null, { timeout: 60_000 });
  const cue = (await page.getByTestId('first-cue').boundingBox())!;
  for (const toggle of ['legend-toggle', 'topbar']) {
    const b = (await page.getByTestId(toggle).boundingBox())!;
    expect(cue.y, `the cue under ${toggle}`).toBeGreaterThanOrEqual(b.y + b.height);
  }
  // A phone's words (R156, critic run 75-76's phone nits): tap and pinch, not click and scroll.
  const words = await page.getByTestId('first-cue').innerText();
  expect(words).toContain('Tap a nation');
  expect(words).toContain('Pinch to zoom');
  expect(words).not.toMatch(/\bClick\b|\bScroll\b/);
  await page.getByTestId('first-cue-close').click();
  const pairs = [['GER', 'POL'], ['ITA', 'YUG'], ['BUL', 'ALB'], ['SOV', 'FIN']].map(([a, d]) => [id(a!), id(d!)] as const);
  await page.evaluate((pairs) => {
    for (const [attacker, defender] of pairs) window.__warsim!.sim.command({ kind: 'declareWar', attacker, defender });
  }, pairs);
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('ticker')).toBeVisible();
  await page.getByTestId('war-more').click();
  // Opened, the banners stand on none of the ticker's rows (R73-N6): R126 hid the ticker; R156 (critic run 76: the news
  // gone while they were open) stands it above them.
  await expect(page.getByTestId('ticker')).toBeVisible();
  await page.waitForTimeout(300);
  const boxes = async (id: string): Promise<{ x: number; y: number; w: number; h: number }[]> =>
    page.evaluate((id) => [...document.querySelectorAll(`[data-testid=${id}]`)].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })), id);
  const rows = await boxes('ticker-row');
  const banners = await boxes('war-banner');
  expect(banners.length).toBeGreaterThan(2);
  const over = rows.filter((r) => banners.some((b) => r.x < b.x + b.w && b.x < r.x + r.w && r.y < b.y + b.h && b.y < r.y + r.h));
  expect(over, 'ticker rows under the opened banners').toEqual([]);
  for (const r of rows) expect(r.y, 'a ticker row on the screen').toBeGreaterThanOrEqual(0);
  await page.getByTestId('war-more').click();
  await expect(page.getByTestId('ticker')).toBeVisible();
});
