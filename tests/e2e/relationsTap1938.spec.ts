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

// R175 (critic run 80, R80-N1): on a phone Relations opened under a nation's panel opened before it (45 of 81 of the
// graph's points covered upright, 81 of 81 on its side). The graph stands over it; a nation chosen in the graph shows its
// panel; closed without a choice, the panel is back.
test("on a phone Relations opened after a nation's panel: the graph is uncovered", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  const covered = (): Promise<number> =>
    page.getByTestId('relations-graph').evaluate((g) => {
      const r = g.getBoundingClientRect();
      let n = 0;
      for (let i = 1; i <= 9; i++)
        for (let j = 1; j <= 9; j++) {
          const top = document.elementFromPoint(r.x + (r.width * i) / 10, r.y + (r.height * j) / 10);
          if (!top || !g.contains(top)) n++;
        }
      return n;
    });
  for (const [w, h] of [[390, 844], [844, 390]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await expect(page.getByTestId('relations-graph')).toBeVisible();
    expect(await covered(), `${w} × ${h}: the graph's points under something else, of 81`).toBe(0);
    // Closed with no choice made: the panel is back, its nation still chosen.
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    expect(await page.evaluate(() => window.__warsim!.hud.selected.value)).toBe(1);
  }
  // A nation tapped in the graph opened over the panel: its own panel shows.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  await expect(page.getByTestId('nation-panel')).toBeHidden();
  const n = (await node(page))!;
  await page.touchscreen.tap(n.x, n.y);
  await expect.poll(() => picked(page), { timeout: 3000 }).toBe(n.id.replace('relations-node-n', ''));
  await expect(page.getByTestId('nation-panel')).toBeVisible();
});

// R181 (critic run 81, R81-N4): a nation's panel gave way to the graph; another nation chosen from outside it, then the
// first again: the first had no panel. Chosen again, its panel shows.
test('on a phone a nation chosen again from outside the graph shows its panel', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  for (const [w, h] of [[390, 844], [844, 390]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await expect(page.getByTestId('relations-graph')).toBeVisible();
    await expect(page.getByTestId('nation-panel')).toBeHidden();
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(2));
    await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', '2');
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await expect(page.getByTestId('nation-panel'), `${w} × ${h}: chosen again, its panel`).toHaveAttribute('data-nation', '1');
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  }
});

// R182 (critic run 81, non-blocking 5 and its design objection): on a sideways phone a node's tap laid its nation's panel
// over the whole graph (81 of 81). The graph and the panel stand side by side: the panel shows, the graph's points free.
test('on a sideways phone a node tapped shows its panel beside the graph', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  for (const [w, h] of [[844, 390], [932, 430]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await expect(page.getByTestId('relations-graph')).toBeVisible();
    // Zoomed in, as a finger picks a node in a graph this low.
    for (let k = 0; k < 3; k++) await page.getByTestId('relations-zoom-in').tap();
    const n = await node(page);
    expect(n, `${w} × ${h}: a node to tap`).not.toBeNull();
    await page.touchscreen.tap(n!.x, n!.y);
    await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', n!.id.replace('relations-node-n', ''));
    const hidden = await page.getByTestId('relations-graph').evaluate((g) => {
      const r = g.getBoundingClientRect();
      let k = 0;
      for (let i = 1; i <= 9; i++)
        for (let j = 1; j <= 9; j++) {
          const top = document.elementFromPoint(r.x + (r.width * i) / 10, r.y + (r.height * j) / 10);
          if (!top || !g.contains(top)) k++;
        }
      return k;
    });
    expect(hidden, `${w} × ${h}: the graph's points covered, of 81`).toBe(0);
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
  }
});

// R184 (critic run 82, R82-B2): on a sideways phone the nation whose panel Relations hid, tapped again in the Ranking, kept
// no panel (the same id changed nothing, R181's rule cleared on a new one only). Any choice brings it back.
test("on a sideways phone the Ranking's row of the nation Relations hid shows its panel", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  for (const [w, h] of [[844, 390], [667, 375]] as const) {
    await page.setViewportSize({ width: w, height: h });
    const rows = page.locator('[data-testid=rank-row]:not([data-dead])');
    if (!(await rows.first().isVisible())) await page.getByTestId('ranking-toggle').tap();
    await expect(rows.first()).toBeVisible();
    const [a, b] = [await rows.nth(0).getAttribute('data-nation'), await rows.nth(1).getAttribute('data-nation')];
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), Number(a));
    await expect(page.getByTestId('nation-panel')).toBeVisible();
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await expect(page.getByTestId('relations-graph')).toBeVisible();
    await expect(page.getByTestId('nation-panel')).toBeHidden();
    await page.locator(`[data-testid=rank-row][data-nation="${a}"]`).tap();
    await expect(page.getByTestId('nation-panel'), `${w} × ${h}: its panel`).toHaveAttribute('data-nation', a!);
    // Another nation chosen opens its own.
    await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), Number(b));
    await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', b!);
    await page.evaluate(() => window.__warsim!.hud.toggleRelations());
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
  }
});

// R185 (critic run 82, R82-N1): on a sideways phone the graph was 55 px high at 667 × 375, its names drawn 4 px (scaled by
// the drawing's width while its height bounded it). The graph has the panel's height, its names one size on the screen.
test('on a sideways phone the relations graph is 150 px high or more, its names 10 px or more', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  for (const [w, h] of [[667, 375], [844, 390]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    const r = await page.getByTestId('relations-graph').evaluate((g) => {
      const hs = [...g.querySelectorAll('.relations-label')].map((t) => t.getBoundingClientRect().height).sort((a, b) => a - b);
      return { h: g.getBoundingClientRect().height, median: hs[Math.floor(hs.length / 2)] ?? 0, n: hs.length };
    });
    expect(r.h, `${w} × ${h}: the graph's height`).toBeGreaterThanOrEqual(150);
    expect(r.n, `${w} × ${h}: names drawn`).toBeGreaterThan(5);
    expect(r.median, `${w} × ${h}: a name's median height`).toBeGreaterThanOrEqual(10);
  }
});

// R188 (critic run 82, R82-N3): on a sideways phone the opened Ranking lay over the bar's History, Relations and Editor.
// It stops above the bar: those buttons take a tap with it open.
test("on a sideways phone the opened Ranking leaves the bar's buttons free", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  for (const [w, h] of [[844, 390], [667, 375]] as const) {
    await page.setViewportSize({ width: w, height: h });
    const rows = page.locator('[data-testid=rank-row]');
    if (!(await rows.first().isVisible())) await page.getByTestId('ranking-toggle').tap();
    await expect(rows.first()).toBeVisible();
    for (const id of ['history-btn', 'relations-btn', 'editor-btn']) {
      const free = await page.getByTestId(id).evaluate((b) => {
        const r = b.getBoundingClientRect();
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return top === b || b.contains(top);
      });
      expect(free, `${w} × ${h}: ${id} under a tap`).toBe(true);
    }
  }
});

// R191 (critic run 83, R83-N3; ADR-1137 (d)): on a sideways phone the filters' one row hid "Truces" and the focus off its
// edge. Every filter, the focus and the zoom's buttons take a tap where they are, sideways, upright, on a desk and back,
// a nation's panel opened and closed beside the graph; the graph keeps R185's height sideways.
test('every relations filter, the focus and the zoom take a tap at every size', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  const ids = ['relations-kind-war', 'relations-kind-alliance', 'relations-kind-guarantee', 'relations-kind-puppet', 'relations-kind-truce', 'relations-focus', 'relations-zoom-in', 'relations-zoom-out', 'relations-close'];
  for (const [w, h] of [[667, 375], [844, 390], [1280, 720], [390, 844], [667, 375]] as const) {
    await page.setViewportSize({ width: w, height: h });
    // A nation's panel opened and closed beside it.
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await page.waitForTimeout(300);
    for (const id of ids) {
      const ok = await page.evaluate((id) => {
        const e = document.querySelector(`[data-testid="${id}"]`);
        if (!e) return 'missing';
        const box = (e.closest('label') ?? e).getBoundingClientRect();
        if (box.right > innerWidth || box.bottom > innerHeight || box.width === 0) return 'off the screen';
        const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return top === e || e.contains(top) || e.closest('label')?.contains(top) ? 'ok' : `under ${top?.className}`;
      }, id);
      expect(ok, `${w} × ${h}: ${id}`).toBe('ok');
    }
    if (h < 500) expect((await page.getByTestId('relations-graph').boundingBox())!.height, `${w} × ${h}: the graph`).toBeGreaterThanOrEqual(150);
  }
});

// R195 (critic run 84, R84-N2; ADR-1137 (d)): at 568 × 320 R191's wrapped filters took three rows and the graph fell to
// 82 px (110 before). There the filters are their colours alone, one row, each named in its title: the graph 110 px or
// more, every filter and the focus taking a tap; across 568 × 320, 844 × 390, a desk, upright and back, a nation's panel
// opened and closed beside it.
test('the smallest sideways phone keeps the relations graph and every filter', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  const ids = ['relations-kind-war', 'relations-kind-alliance', 'relations-kind-guarantee', 'relations-kind-puppet', 'relations-kind-truce', 'relations-focus', 'relations-zoom-in', 'relations-close'];
  for (const [w, h] of [[568, 320], [844, 390], [1280, 720], [390, 844], [568, 320]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await page.waitForTimeout(300);
    for (const id of ids) {
      const ok = await page.evaluate((id) => {
        const e = document.querySelector(`[data-testid="${id}"]`);
        if (!e) return 'missing';
        const box = (e.closest('label') ?? e).getBoundingClientRect();
        const panel = document.querySelector('[data-testid=relations-panel]')!.getBoundingClientRect();
        if (box.right > Math.min(innerWidth, panel.right) + 1 || box.bottom > innerHeight || box.width === 0) return 'off the panel';
        const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return top === e || e.contains(top) || e.closest('label')?.contains(top) ? 'ok' : `under ${top?.className}`;
      }, id);
      expect(ok, `${w} × ${h}: ${id}`).toBe('ok');
    }
    // Each kind named, seen or in its title.
    expect(await page.locator('.relations-kind[title]').count(), `${w} × ${h}: each kind named`).toBe(5);
    if (h === 320) expect((await page.getByTestId('relations-graph').boundingBox())!.height, `${w} × ${h}: the graph`).toBeGreaterThanOrEqual(110);
  }
});

// R196 (critic run 84, R84-N3; ADR-1137 (d)): on a sideways phone the footer's second line ran over the relations panel's
// foot. The footer's text inside the panel's border at 568 × 320, 667 × 375, 844 × 390, upright, a desk and back, a
// nation's panel opened and closed beside it; the graph keeps R185's and R195's heights.
test('the relations footer stays inside its panel at every size', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  for (const [w, h, least] of [[568, 320, 110], [667, 375, 150], [844, 390, 150], [390, 844, 0], [1280, 720, 0], [667, 375, 150]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[data-testid=relations-panel]')!;
      const inner = panel.getBoundingClientRect().bottom - parseFloat(getComputedStyle(panel).borderBottomWidth);
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('[data-testid=relations-said]')!);
      const lines = [...range.getClientRects()].filter((q) => q.height > 0);
      return { over: Math.round(Math.max(...lines.map((q) => q.bottom)) - inner), graph: document.querySelector('[data-testid=relations-graph]')!.getBoundingClientRect().height };
    });
    expect(r.over, `${w} × ${h}: the footer's text past the panel's border`).toBeLessThanOrEqual(0);
    expect(r.graph, `${w} × ${h}: the graph`).toBeGreaterThanOrEqual(least);
  }
});

// R198 (critic run 85, R85-N2; ADR-1137 (d)): at 568 × 320 the filters are colours alone, their names in titles no touch
// shows. A tap on a filter names its kind where it is seen, "Wars hidden", "Wars shown"; at 568 × 320, 844 × 390, a desk,
// upright and back, a nation's panel opened and closed beside it.
test('a relations filter tapped says its kind at every size', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  const said = page.getByTestId('relations-said');
  for (const [w, h] of [[568, 320], [844, 390], [1280, 720], [390, 844], [568, 320]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await page.waitForTimeout(300);
    for (const [k, name] of [['war', 'Wars'], ['alliance', 'Alliances'], ['truce', 'Truces']] as const) {
      const box = (await page.getByTestId(`relations-kind-${k}`).boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(said, `${w} × ${h}: ${k} off`).toHaveText(new RegExp(`^${name} hidden`));
      await expect(said, `${w} × ${h}: the footer seen`).toBeInViewport();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(said, `${w} × ${h}: ${k} on`).toHaveText(new RegExp(`^${name} shown`));
    }
  }
});

// R201 (critic run 86, R86-N1; ADR-1137 (d)): with every kind hidden the footer said "Truces hidden" alone, where it had
// said "No ties of these kinds.". The empty graph says so beside the kind just tapped; one kind shown again, the footer
// names it alone; at 568 × 320, 844 × 390, a desk and upright, a nation's panel opened and closed.
test('the empty relations graph says it is empty beside the kind tapped', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=4111');
  await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.toggleRelations());
  const said = page.getByTestId('relations-said');
  const kinds = ['war', 'alliance', 'guarantee', 'puppet', 'truce'] as const;
  for (const [w, h] of [[568, 320], [844, 390], [1280, 720], [1600, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(1));
    await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    await page.waitForTimeout(300);
    // With ties shown the footer counts the nations left out (those with no tie shown).
    await expect(said, `${w} × ${h}: ties shown`).toHaveText(/nations with no tie shown are left out/);
    for (const k of kinds) await page.getByTestId(`relations-kind-${k}`).click();
    // R205 (critic run 87): the empty graph without the left-out count, which said the same again ("98 nations with no
    // tie shown are left out" at 1600 px).
    await expect(said, `${w} × ${h}: every kind hidden`).toHaveText('Truces hidden · No ties of these kinds.');
    await page.getByTestId('relations-kind-war').click();
    await expect(said, `${w} × ${h}: wars shown again`).toHaveText(/^Wars shown/);
    await expect(said).not.toHaveText(/No ties/);
    await expect(said, `${w} × ${h}: wars shown again, the left-out count back`).toHaveText(/left out/);
    for (const k of kinds.slice(1)) await page.getByTestId(`relations-kind-${k}`).click();
  }
});
