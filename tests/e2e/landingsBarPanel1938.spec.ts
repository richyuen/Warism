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

// R203 (critic run 87, R87-B1; ADR-1140 (b)): a narrow desk's legend stands at the top left, where the landings' bar is
// (top middle, 18 rem at least). Opened, the legend keeps left of the bar, its lines wrapped; under a nation's panel it is
// gone, as a phone's. R207: beside the panel the bar stands right of it, the panel's × in reach.
for (const width of [601, 640, 700, 800] as const) {
  test(`${width} × 800: a narrow desk's opened legend left of the landings' bar`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/?scenario=1938&paused=1&seed=21103');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ENG, d: GER });
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
    await page.getByTestId('take-control').click();
    await page.getByTestId('release-control').waitFor();
    await page.evaluate((n) => {
      const v = window.__warsim!.view!;
      const sel = v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)![0] - 1023.5, v.formationPos(id)![1] - 275.5)] as const).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
      window.__warsim!.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: n })));
    }, ENG);
    await page.evaluate(() => window.__warsim!.sim.step(2));
    await expect(page.getByTestId('landings-bar')).toBeVisible();
    await expect(page.getByTestId('map-legend'), 'gone under the nation\'s panel').toBeHidden();
    // R207: on a narrow desk the bar stood on the panel's ×, and the click opened a landing. The element at the × is the
    // ×, the bar right of the panel and in the view; the click closes the panel.
    const m = await page.evaluate(() => {
      const box = (s: string): DOMRect => document.querySelector(s)!.getBoundingClientRect();
      const x = box('[data-testid=nation-close]');
      const at = document.elementFromPoint((x.left + x.right) / 2, (x.top + x.bottom) / 2) as HTMLElement | null;
      return { at: at?.dataset['testid'] ?? at?.className ?? null, panelRight: box('[data-testid=nation-panel]').right, barLeft: box('[data-testid=landings-bar]').left, barRight: box('[data-testid=landings-bar]').right };
    });
    expect(m.at, 'the element at the ×').toBe('nation-close');
    expect(m.barLeft, 'the bar right of the panel').toBeGreaterThanOrEqual(m.panelRight);
    expect(m.barRight, 'the bar in the view').toBeLessThanOrEqual(width);
    await page.getByTestId('nation-close').click({ timeout: 5_000 });
    await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    for (const mode of ['fallout', 'seaControl', 'airControl'] as const) {
      await page.evaluate((m) => window.__warsim!.hud.setMapMode(m), mode);
      await page.getByTestId('legend-toggle').click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'true');
      const m = await page.evaluate(() => {
        const l = document.querySelector('[data-testid=map-legend]')!.getBoundingClientRect();
        const b = document.querySelector('[data-testid=landings-bar]')!.getBoundingClientRect();
        const row = document.querySelector('[data-testid=war-banners]')?.getBoundingClientRect();
        return { legendRight: l.right, legendWidth: l.width, legendFoot: l.bottom, barLeft: b.left, rowTop: row?.top ?? innerHeight };
      });
      expect(m.legendRight, `${mode}: the legend left of the bar`).toBeLessThanOrEqual(m.barLeft);
      expect(m.legendWidth, `${mode}: the legend wide enough to read`).toBeGreaterThanOrEqual(130);
      expect(m.legendFoot, `${mode}: the legend above the war row`).toBeLessThanOrEqual(m.rowTop);
      await page.getByTestId('legend-toggle').click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'false');
    }
    if (width === 700) await page.screenshot({ path: 'test-results/landingsBarLegend-700x800.png' });
  });
}

// R207: a desk with room for both keeps the bar on the page's middle beside an open nation's panel, as before.
test('1280 × 800: the landings\' bar on the page\'s middle beside the nation panel', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=21103');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ENG, d: GER });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor();
  await page.evaluate((n) => {
    const v = window.__warsim!.view!;
    const sel = v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)![0] - 1023.5, v.formationPos(id)![1] - 275.5)] as const).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
    window.__warsim!.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: n })));
  }, ENG);
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await expect(page.getByTestId('landings-bar')).toBeVisible();
  const m = await page.evaluate(() => {
    const b = document.querySelector('[data-testid=landings-bar]')!.getBoundingClientRect();
    return { mid: (b.left + b.right) / 2, barLeft: b.left, panelRight: document.querySelector('[data-testid=nation-panel]')!.getBoundingClientRect().right };
  });
  expect(Math.abs(m.mid - 640), 'the bar on the page\'s middle').toBeLessThanOrEqual(1);
  expect(m.barLeft).toBeGreaterThanOrEqual(m.panelRight);
  await page.getByTestId('nation-close').click({ timeout: 5_000 });
  await expect(page.getByTestId('nation-panel')).toHaveCount(0);
});

// R210, R211 (critic run 88, R88-N1, R88-N2; ADR-1141's sizes): on the iPhone 16 upright the landings' bar lay over the
// whole folded legend and its toggle took no tap; on its side the bar lay over the opened legend, and at 734 × 343 its
// opened row over the war row. The bar stands under the legend's title upright; it gives way while the legend is open
// and is back as it folds; its opened row ends above the war row. One landing, the five supported sizes crossed and back.
test('a phone\'s landings\' bar and its legend: the title in reach, one of the two open at a time', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 393, height: 659 });
  await page.goto('/?scenario=1938&paused=1&seed=21103');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ENG, d: GER });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor();
  await page.evaluate((n) => {
    const v = window.__warsim!.view!;
    const sel = v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)![0] - 1023.5, v.formationPos(id)![1] - 275.5)] as const).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
    window.__warsim!.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: n })));
  }, ENG);
  await page.evaluate(() => window.__warsim!.sim.step(2));
  const bar = page.getByTestId('landings-bar');
  const legend = page.getByTestId('map-legend');
  const toggle = page.getByTestId('legend-toggle');
  const look = () =>
    page.evaluate(() => {
      const box = (s: string): DOMRect | null => document.querySelector(s)?.getBoundingClientRect() ?? null;
      const b = box('[data-testid=landings-bar]')!;
      const l = box('[data-testid=map-legend]')!;
      const t = document.querySelector('[data-testid=legend-toggle]');
      const tb = t?.getBoundingClientRect();
      const row = box('[data-testid=war-banners]');
      return {
        // The element at the middle of the legend's title.
        atToggle: tb ? t!.contains(document.elementFromPoint((tb.left + tb.right) / 2, (tb.top + tb.bottom) / 2)) : null,
        meets: b.width > 0 && l.width > 0 && b.left < l.right - 1 && l.left < b.right - 1 && b.top < l.bottom - 1 && l.top < b.bottom - 1,
        barFoot: b.bottom,
        barRight: b.right,
        barLeft: b.left,
        rowTop: row ? row.top : innerHeight,
      };
    });
  for (const [w, h] of [[393, 659], [393, 852], [734, 343], [852, 393], [2560, 1305], [393, 659]] as const) {
    await page.setViewportSize({ width: w, height: h });
    // A nation's panel opened and closed (the played nation's; upright the bar gives way to it).
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), ENG);
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    const at = `${w} × ${h}`;
    // A phone by its width or its height (`PHONE_QUERY`): its legend folds.
    const folds = w <= 600 || h <= 500;
    for (const mode of ['political', 'seaControl'] as const) {
      await page.evaluate((m) => window.__warsim!.hud.setMapMode(m), mode);
      await page.waitForTimeout(300);
      await expect(bar, `${at} ${mode}: the bar shown`).toBeVisible();
      const folded = await look();
      expect(folded.meets, `${at} ${mode}: the bar and the legend apart`).toBe(false);
      expect(folded.barLeft, `${at} ${mode}: the bar in the view`).toBeGreaterThanOrEqual(0);
      expect(folded.barRight, `${at} ${mode}: the bar in the view`).toBeLessThanOrEqual(w);
      if (!folds) {
        await expect(toggle, `${at}: a desk's legend has no fold`).toHaveCount(0);
        continue;
      }
      expect(folded.atToggle, `${at} ${mode}: the legend's title under the pointer`).toBe(true);
      // Opened by a click on its title: the bar gives way; folded, the bar is back.
      await toggle.click({ timeout: 5_000 });
      await expect(legend).toHaveAttribute('data-open', 'true');
      await expect(bar, `${at} ${mode}: the bar gone while the legend is open`).toBeHidden();
      await toggle.click({ timeout: 5_000 });
      await expect(legend).toHaveAttribute('data-open', 'false');
      await expect(bar, `${at} ${mode}: the bar back`).toBeVisible();
    }
    // The bar's row opened: its foot above the war row, the legend's title still in reach; closed again.
    await page.getByTestId('landing-toggle').first().click({ timeout: 5_000 });
    await page.waitForTimeout(300);
    const opened = await look();
    expect(opened.barFoot, `${at}: the opened bar above the war row`).toBeLessThanOrEqual(opened.rowTop);
    expect(opened.meets, `${at}: the opened bar and the legend apart`).toBe(false);
    if (folds) expect(opened.atToggle, `${at}: the legend's title under the pointer beside the opened bar`).toBe(true);
    await page.getByTestId('landing-toggle').first().click({ timeout: 5_000 });
  }
});
