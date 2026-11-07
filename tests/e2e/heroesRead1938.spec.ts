import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R11 (critic run 29: `mapVisuals` and `uiUxPolish` 6, bar 7): what the heroes and the
// relations graph read. A hurt hero's formation panel, T1 marker and T2 tag read its health, not its
// men, which stay whole (R29-N2, N3: "Men 2,200 of 2,200" at 35 %, the Maus tagged "6"); the heroes
// option says what it is as text (N6); the relations graph names a war line's side, zooms on a
// phone, and the bottom bar stays one row at 1024 px (N8). Shots in `docs/evidence/R11` with EVIDENCE=1.

const tag = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const GER = tag('GER');

const outDir = (info: { outputPath: (...p: string[]) => string }): string => {
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R11') : info.outputPath();
  mkdirSync(out, { recursive: true });
  return out;
};

async function ready(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
}

/** Steps the sim `hours` and waits for the view to have that tick. */
async function step(page: Page, hours: number): Promise<void> {
  await page.evaluate(async (hours) => {
    const { sim, view } = window.__warsim!;
    const tick = (await sim.step(hours)).tick;
    await new Promise<void>((done) => {
      const wait = (): void => (view!.lastTick === tick ? done() : void setTimeout(wait, 5));
      wait();
    });
  }, hours);
}

for (const [label, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`ROADMAP R11: a hurt hero reads its health in its panel, marker and tag (${label})`, async ({ page }, info) => {
    test.setTimeout(240_000);
    const out = outDir(info);
    await page.setViewportSize({ width, height });
    await ready(page, '/?scenario=1938&paused=1&seed=4111&heroes=on');
    await page.evaluate(() => (window.__warsim!.settings.nukePause.value = false));
    const maus = await page.evaluate(() => {
      const v = window.__warsim!.view!;
      return v.heroFormations().find((f) => v.formationTitle(f)?.name === 'Maus') ?? 0;
    });
    expect(maus).toBeGreaterThan(0);
    // God's bomb a cell and a half off: the Maus lives, hurt.
    await page.evaluate((id) => {
      const [x, y] = window.__warsim!.view!.formationPos(id)!;
      window.__warsim!.sim.command({ kind: 'godNuke', x: x + 1.5, y, thermonuclear: false });
    }, maus);
    await step(page, 2);
    // The statistics come a moment after the tick.
    const health = (): Promise<number> =>
      page.evaluate((n) => {
        const h = window.__warsim!.hud.stats.value!.nations.find((x) => x.id === n)!.heroes!.find((x) => x.nameKey === 'template.hero_maus')!;
        return Math.round(h.health * 100);
      }, GER);
    await expect.poll(health, { message: 'the Maus hurt', timeout: 15_000 }).toBeLessThan(100);
    const pct = await health();
    expect(pct, 'the Maus alive').toBeGreaterThan(0);
    // The formation panel: a Health row beside the men, which stay whole.
    await page.evaluate((id) => window.__warsim!.hud.selectFormation(id), maus);
    await expect(page.getByTestId('formation-health')).toHaveText(`${pct}%`, { timeout: 10_000 });
    await expect(page.getByTestId('formation-strength')).toHaveText('6 of 6');
    await page.screenshot({ path: path.join(out, `r11-${label}-panel.png`) });
    // T1: its marker's number; T2: its tag's.
    const look = async (mPerPx: number): Promise<void> => {
      await page.evaluate(({ id, mPerPx }) => {
        const v = window.__warsim!.view!;
        const [x, y] = v.formationPos(id)!;
        v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / mPerPx });
      }, { id: maus, mPerPx });
    };
    await page.evaluate(() => window.__warsim!.hud.selectFormation(0));
    await look(1200);
    await page.waitForFunction((id) => window.__warsim!.view!.markerOpacity > 0.99 && window.__warsim!.view!.markerRects.some((r) => r.id === id), maus, { timeout: 30_000 });
    expect(await page.evaluate((id) => window.__warsim!.view!.markerRects.find((r) => r.id === id)!.text, maus), 'the T1 marker').toBe(`${pct}%`);
    await page.screenshot({ path: path.join(out, `r11-${label}-marker.png`) });
    await look(150);
    await page.waitForFunction((id) => window.__warsim!.view!.tagOpacity > 0.99 && window.__warsim!.view!.tagRects.some((g) => g.id === id), maus, { timeout: 30_000 });
    const t2 = await page.evaluate((id) => window.__warsim!.view!.tagRects.find((g) => g.id === id)!, maus);
    expect(t2.text, 'the T2 tag').toBe(`${pct}%`);
    expect(t2.name).toBe('Maus');
    await page.screenshot({ path: path.join(out, `r11-${label}-tag.png`) });
  });
}

test('ROADMAP R11: the heroes option says what it is as text, on a phone', async ({ page }, info) => {
  const out = outDir(info);
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, '/?scenario=1938&paused=1&seed=77');
  await page.getByTestId('settings-btn').click();
  const hint = page.getByTestId('opt-heroes-hint');
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('60 days');
  await hint.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(out, 'r11-phone-option.png') });
});

test('ROADMAP R11: the bottom bar is one row from 1024 px up', async ({ page }) => {
  const heights: string[] = [];
  for (const [w, h] of [[1024, 768], [1180, 820], [1280, 720], [1600, 900]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (heights.length === 0) await ready(page, '/?scenario=1938&paused=1&seed=77');
    await page.waitForTimeout(300);
    const box = await page.locator('.bottombar').boundingBox();
    const row = await page.getByTestId('relations-btn').boundingBox();
    heights.push(`${w}: ${box!.height.toFixed(0)} px`);
    // One row: the bar no taller than a button and its padding.
    expect(box!.height, `the bar at ${w} px (${heights.join(', ')})`).toBeLessThan(row!.height * 1.7);
    expect(box!.width).toBeLessThanOrEqual(w);
  }
});

test('ROADMAP R11: the relations graph names a war line\'s side, and zooms on a phone', async ({ page }, info) => {
  test.setTimeout(240_000);
  const out = outDir(info);
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, '/?scenario=1938&paused=1&seed=4111');
  await step(page, 24 * 120);
  await page.getByTestId('relations-btn').click();
  const panel = page.getByTestId('relations-panel');
  await expect(panel).toBeVisible();
  // Every war line read: never "X is at war beside X".
  const said = page.getByTestId('relations-said');
  const wars = page.locator('.relations-edge[data-kind="war"]');
  const n = await wars.count();
  expect(n, 'war lines').toBeGreaterThan(0);
  const texts: string[] = [];
  for (let i = 0; i < Math.min(n, 60); i++) {
    await wars.nth(i).dispatchEvent('click');
    texts.push((await said.textContent()) ?? '');
  }
  const self = texts.filter((s) => /^(.+) is at war beside \1,/.test(s));
  expect(self, 'lines that put a nation beside itself').toEqual([]);
  expect(texts.some((s) => / leads its side| alone on its side/.test(s)), `a leader's or a lone nation's line (${texts.slice(0, 3).join(' / ')})`).toBe(true);
  await page.screenshot({ path: path.join(out, 'r11-phone-graph-whole.png') });
  // Zoomed: more nations named. Names are one size on the screen since R34a (ADR-847: 11 px, readable on a phone
  // with the whole graph; R11 had them grow with the zoom from about 6 px): at least 10 px whole and zoomed.
  const graph = page.getByTestId('relations-graph');
  const labels = (): Promise<number> => page.locator('.relations-label').count();
  const before = await labels();
  const size = async (): Promise<number> => (await page.locator('.relations-label').first().boundingBox())!.height;
  const small = await size();
  expect(small, 'a name readable, the whole graph').toBeGreaterThanOrEqual(10);
  await page.getByTestId('relations-zoom-in').click();
  await page.getByTestId('relations-zoom-in').click();
  await expect(graph).toHaveAttribute('data-zoom', '2.25');
  expect(await labels(), 'every nation named at 2.25×').toBeGreaterThan(before);
  expect(await size(), 'a name readable, zoomed in').toBeGreaterThanOrEqual(10);
  await page.screenshot({ path: path.join(out, 'r11-phone-graph-zoomed.png') });
  // A drag moves the view; it opens nothing.
  const vb = await graph.getAttribute('viewBox');
  const box = (await graph.boundingBox())!;
  const picked = await page.evaluate(() => window.__warsim!.hud.selected.value);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  expect(await graph.getAttribute('viewBox'), 'the view moved').not.toBe(vb);
  expect(await page.evaluate(() => window.__warsim!.hud.selected.value), 'a drag selects nothing').toBe(picked);
  await page.getByTestId('relations-zoom-reset').click();
  await expect(graph).toHaveAttribute('data-zoom', '1.00');
});

// ROADMAP R12 (critic run 29, R29-N1): a hero's loss and return were told nowhere but its Overview row.
// The Bismarck sunk by God: a ticker row and a History row of each, with Go to.
test('ROADMAP R12: a sea hero sunk by God, and back 60 days on: told in the ticker and History', async ({ page }, info) => {
  test.setTimeout(300_000);
  const out = outDir(info);
  await page.setViewportSize({ width: 1600, height: 900 });
  await ready(page, '/?scenario=1938&paused=1&seed=1938&heroes=on');
  const bismarck = await page.evaluate(() => {
    const v = window.__warsim!.view!;
    return v.heroFormations().find((f) => v.formationTitle(f)?.name === 'Bismarck') ?? 0;
  });
  expect(bismarck).toBeGreaterThan(0);
  await page.evaluate((id) => window.__warsim!.sim.command({ kind: 'removeFormation', id }), bismarck);
  await step(page, 1);
  const lost = page.locator('[data-testid=ticker-row][data-kind-name=HeroLost]');
  await expect(lost).toHaveCount(1, { timeout: 15_000 });
  await expect(lost).toContainText('Germany lost Bismarck near');
  await page.screenshot({ path: path.join(out, 'r12-ticker-lost.png') });
  // 60 days on: back.
  await step(page, 24 * 60 + 1);
  const back = page.locator('[data-testid=ticker-row][data-kind-name=HeroReturned]');
  await expect(back).toHaveCount(1, { timeout: 15_000 });
  await expect(back).toContainText('Bismarck is back with Germany near');
  await page.screenshot({ path: path.join(out, 'r12-ticker-back.png') });
  // History: both rows, and the kind among its filters.
  await page.getByTestId('history-btn').click();
  const kinds = await page.getByTestId('history-kind').locator('option').allTextContents();
  expect(kinds).toEqual(expect.arrayContaining(['Hero lost', 'Hero back']));
  await expect(page.locator('[data-testid=history-row]', { hasText: 'Germany lost Bismarck' })).toHaveCount(1);
  await expect(page.locator('[data-testid=history-row]', { hasText: 'Bismarck is back with Germany' })).toHaveCount(1);
  await page.screenshot({ path: path.join(out, 'r12-history.png') });
  // Go to (the loss's row is past the ticker's 30 days by now): the camera to the return's place.
  await page.getByTestId('history-close').click();
  const at = await page.evaluate(() => ({ ...window.__warsim!.view!.controller.cam }));
  await back.click();
  await expect.poll(() => page.evaluate(() => window.__warsim!.view!.controller.cam.cx)).not.toBe(at.cx);
});
