import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R34f (critic run 30, R30-N3, carried to run 50): on a phone, the first tap on a nation in the relations
// graph after a one-finger drag selected nothing. Seed 4111 (the critic's), a year on, the graph zoomed 3.4×: a
// drag moves the view and opens nothing; the first tap after it selects the nation tapped; so does a tap after a
// pinch.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

const node = (page: Page): Promise<{ id: string; x: number; y: number } | null> =>
  page.evaluate(() => {
    const g = document.querySelector('[data-testid=relations-graph]')!.getBoundingClientRect();
    const c = [...document.querySelectorAll('.relations-nation circle:first-child')]
      .map((e) => ({ id: e.closest('g')!.getAttribute('data-testid')!, r: e.getBoundingClientRect() }))
      .filter((c) => c.r.width > 8 && c.r.x > g.x + 30 && c.r.right < g.right - 30 && c.r.y > g.y + 30 && c.r.bottom < g.bottom - 30);
    const k = c[Math.floor(c.length / 2)];
    return k ? { id: k.id, x: k.r.x + k.r.width / 2, y: k.r.y + k.r.height / 2 } : null;
  });

/** The nation selected: its panel's, or the relations footer's words. */
const picked = (page: Page): Promise<string | null> => page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.getAttribute('data-nation') ?? null);

test('a phone: the first tap after a drag, and after a pinch, selects the nation tapped', async ({ page, context }) => {
  test.setTimeout(300_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24 * 365));
  await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) >= 24 * 365, null, { timeout: 240_000 });
  const btn = page.getByTestId('relations-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.tap();
  await expect(page.getByTestId('relations-graph')).toBeVisible();
  const graph = page.getByTestId('relations-graph');
  const want = (n: { id: string }): string => n.id.replace('relations-node-n', '');
  // A tap with no drag before it.
  let n = (await node(page))!;
  await page.touchscreen.tap(n.x, n.y);
  await expect.poll(() => picked(page), { timeout: 3000 }).toBe(want(n));
  await page.locator('[data-testid=nation-panel] .panel-close').first().tap();
  await expect.poll(() => picked(page)).toBeNull();
  for (let k = 0; k < 3; k++) await page.getByTestId('relations-zoom-in').tap();
  await expect(graph).toHaveAttribute('data-zoom', '3.38');
  const cdp = await context.newCDPSession(page);
  const g = (await graph.boundingBox())!;
  const [sx, sy] = [g.x + g.width * 0.5, g.y + g.height * 0.5];
  // A one-finger drag: the view moves, nothing opens.
  const vb = await graph.getAttribute('viewBox');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
  for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx - i * 10, y: sy - i * 4 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(300);
  expect(await graph.getAttribute('viewBox'), 'the drag moved the view').not.toBe(vb);
  expect(await picked(page), 'the drag opened nothing').toBeNull();
  // The first tap after it, and a second.
  n = (await node(page))!;
  await page.touchscreen.tap(n.x, n.y);
  await expect.poll(() => picked(page), { timeout: 3000 }).toBe(want(n));
  await page.touchscreen.tap(n.x, n.y);
  await page.waitForTimeout(300);
  expect(await picked(page), 'a second tap: still chosen').toBe(want(n));
  await page.screenshot({ path: test.info().outputPath('r34f-after-drag.png') });
  await page.locator('[data-testid=nation-panel] .panel-close').first().tap();
  await expect.poll(() => picked(page)).toBeNull();
  // A pinch out, then a tap.
  const z0 = Number(await graph.getAttribute('data-zoom'));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx - 20, y: sy, id: 1 }, { x: sx + 20, y: sy, id: 2 }] });
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx - 20 - i * 8, y: sy, id: 1 }, { x: sx + 20 + i * 8, y: sy, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(300);
  expect(Number(await graph.getAttribute('data-zoom')), 'the pinch zoomed in').toBeGreaterThan(z0);
  expect(await picked(page), 'the pinch opened nothing').toBeNull();
  n = (await node(page))!;
  await page.touchscreen.tap(n.x, n.y);
  await expect.poll(() => picked(page), { timeout: 3000 }).toBe(want(n));
});

// R173 (relationsTap red 1 in 2 once: "the pinch zoomed in"): a finger whose `pointerup` the graph never had (a tap that
// opened a panel over it) stayed among the fingers down, and the next pinch's two made three: no pinch. A new gesture's
// first finger starts the count again.
test('a pinch after a finger whose lifting the graph never had still zooms', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  const btn = page.getByTestId('relations-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.tap();
  const graph = page.getByTestId('relations-graph');
  await expect(graph).toBeVisible();
  const z0 = Number(await graph.getAttribute('data-zoom'));
  await graph.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const [x, y] = [r.x + r.width / 2, r.y + r.height / 2];
    const ev = (type: string, id: number, px: number, primary: boolean): PointerEvent => new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: primary, clientX: px, clientY: y, bubbles: true });
    // A finger down whose lifting is lost.
    el.dispatchEvent(ev('pointerdown', 7, x, true));
    // A pinch out: two fingers, the first of a new gesture.
    el.dispatchEvent(ev('pointerdown', 1, x - 20, true));
    el.dispatchEvent(ev('pointerdown', 2, x + 20, false));
    el.dispatchEvent(ev('pointermove', 2, x + 60, false));
    el.dispatchEvent(ev('pointerup', 1, x - 20, true));
    el.dispatchEvent(ev('pointerup', 2, x + 60, false));
  });
  await expect.poll(async () => Number(await graph.getAttribute('data-zoom')), { message: 'the pinch zoomed in' }).toBeGreaterThan(z0);
});
